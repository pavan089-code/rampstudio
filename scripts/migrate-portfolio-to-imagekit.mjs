// Run with node scripts/migrate-portfolio-to-imagekit.mjs [--upload]
// Credentials are loaded only in this server-side process.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require('@next/env');
const sharp = require('sharp');
loadEnvConfig(process.cwd());
const root = process.cwd();
const publicDir = path.join(root, 'public');
const inventoryPath = path.join(root, 'imagekit-media-inventory.json');
const manifestPath = path.join(root, 'imagekit-migration-manifest.json');
const destinations = { birthday: 'birthday', marraige: 'wedding', meternity: 'maternity', model: 'model', prewed: 'pre-wedding', traditional: 'traditional' };
const extensions = new Set(['.jpeg', '.jpg', '.png', '.webp']);
const upload = process.argv.includes('--upload');
const limitArg = process.argv.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice(8)) : Infinity;
if (!(limit > 0)) throw new Error('Invalid batch limit');
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const endpoint = process.env.IMAGEKIT_URL_ENDPOINT;
const auth = privateKey ? `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}` : '';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : entry.isFile() ? [p] : [];
  });
}
const sourceFiles = walk(path.join(root, 'src')).filter(p => /\.(js|jsx|ts|tsx|css|mjs)$/.test(p));
const sources = sourceFiles.map(p => ({ file: path.relative(root, p).replaceAll('\\', '/'), text: fs.readFileSync(p, 'utf8') }));
const assets = [];
for (const file of walk(publicDir)) {
  const relative = path.relative(publicDir, file).replaceAll('\\', '/');
  const [folder] = relative.split('/');
  const ext = path.extname(file).toLowerCase();
  const portfolio = !!destinations[folder] && extensions.has(ext);
  const stats = fs.statSync(file);
  let dimensions = null;
  let mimeType = null;
  if (extensions.has(ext)) {
    try { const { width, height, format } = await sharp(file).metadata(); dimensions = { width, height }; mimeType = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[format] || null; } catch { /* recorded as unreadable */ }
  }
  const source = `/${relative}`;
  const references = sources.filter(s => s.text.includes(source) || (portfolio && (s.text.includes(`"${folder}"`) || s.text.includes(`'${folder}'`)))).map(s => s.file);
  const hash = portfolio ? crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') : null;
  // A source-path digest prevents collisions even when ImageKit normalizes names.
  const name = portfolio ? `${path.basename(file, ext).normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'image'}-${crypto.createHash('sha256').update(relative).digest('hex').slice(0, 12)}${ext}` : null;
  const classification = portfolio ? 'portfolio photograph' : ext === '.mp4' ? 'hero video: retained' : /^rew[1-4]\.jpg$/i.test(relative) ? 'testimonial image: retained' : relative.toLowerCase() === 'found.png' ? 'founder image: retained' : ext === '.svg' ? 'UI asset: retained' : 'other static asset: retained';
  assets.push({ source, filename: path.basename(file), extension: ext, size: stats.size, mimeType, dimensions, references, classification, imagekitPath: portfolio ? `/ramp-studio/portfolio/${destinations[folder]}/${name}` : null, sha256: hash, status: portfolio ? 'pending' : 'retained' });
}
let manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { version: 1, assets: [] };
function save() {
  const temp = `${manifestPath}.tmp`;
  for (let attempt = 0; ; attempt++) {
    try { fs.writeFileSync(temp, JSON.stringify(manifest, null, 2) + '\n'); fs.renameSync(temp, manifestPath); return; }
    catch (error) { if (attempt === 5) throw error; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100 * 2 ** attempt); }
  }
}
function record(item) { manifest.assets = manifest.assets.filter(a => a.source !== item.source); manifest.assets.push(item); save(); }
for (const asset of assets) {
  const previous = manifest.assets.find(a => a.source === asset.source && a.sha256 === asset.sha256 && a.status === 'verified');
  if (previous) asset.status = 'verified';
}
fs.writeFileSync(inventoryPath, JSON.stringify({ version: 1, assets }, null, 2) + '\n');
console.log(`Inventory: ${assets.length} files; ${assets.filter(a => a.imagekitPath).length} portfolio photographs. Mode: ${upload ? 'upload' : 'dry run'}.`);
if (!upload) process.exit(0);
if (!privateKey || !endpoint) { console.error('Missing IMAGEKIT_PRIVATE_KEY or IMAGEKIT_URL_ENDPOINT in server environment. No uploads attempted.'); process.exit(1); }
const endpointUrl = new URL(endpoint);
if (endpointUrl.protocol !== 'https:' || endpointUrl.hostname !== 'ik.imagekit.io' || endpointUrl.username || endpointUrl.password || endpointUrl.search || endpointUrl.hash || endpointUrl.pathname === '/') throw new Error('Invalid ImageKit endpoint');
async function retry(fn) {
  for (let attempt = 0; ; attempt++) {
    try { return await fn(); } catch (error) {
      if (attempt >= 3 || !error.temporary) throw error;
      await new Promise(resolve => setTimeout(resolve, 500 * 2 ** attempt));
    }
  }
}
async function request(url, options) {
  let response;
  try { response = await fetch(url, { ...options, signal: AbortSignal.timeout(60000) }); } catch { const e = new Error('Network request failed'); e.temporary = true; throw e; }
  if (!response.ok) { const e = new Error(`HTTP ${response.status}`); e.temporary = response.status === 429 || response.status >= 500; throw e; }
  return response;
}
async function verify(item) {
  const url = new URL(item.url);
  if (url.origin !== endpointUrl.origin || !url.pathname.startsWith(endpointUrl.pathname.replace(/\/$/, '') + '/')) throw new Error('Returned URL does not match configured endpoint');
  const metadata = await (await request(`https://api.imagekit.io/v1/files/${encodeURIComponent(item.imagekitFileId)}/details`, { headers: { Authorization: auth } })).json();
  if (metadata.filePath !== item.imagekitPath || metadata.size !== item.size) throw new Error('Remote metadata does not match source');
  await request(url, {});
  const originalUrl = new URL(url);
  originalUrl.searchParams.set('tr', 'orig-true');
  const bytes = Buffer.from(await (await request(originalUrl, {})).arrayBuffer());
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== item.sha256) throw new Error('Public original bytes differ from source');
}
async function migrate(asset) {
  const old = manifest.assets.find(a => a.source === asset.source && a.sha256 === asset.sha256 && a.imagekitFileId);
  let item = old;
  try {
    const expected = { '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[asset.extension];
    if (!asset.dimensions || asset.mimeType !== expected || asset.size <= 0 || asset.size > 25 * 1024 * 1024) throw new Error('Invalid image type or unsupported size (maximum 25 MiB)');
    if (!item && remoteFiles.has(asset.imagekitPath)) {
      const remote = remoteFiles.get(asset.imagekitPath);
      item = { source: asset.source, filename: asset.filename, mimeType: asset.mimeType, imagekitFileId: remote.fileId, imagekitPath: remote.filePath, url: remote.url, size: asset.size, sha256: asset.sha256, status: 'uploaded-unverified' };
      record(item);
    }
    if (!item) {
      const body = new FormData();
      body.set('file', new Blob([fs.readFileSync(path.join(publicDir, asset.source.slice(1)))], { type: asset.mimeType }), path.basename(asset.imagekitPath));
      body.set('fileName', path.basename(asset.imagekitPath));
      body.set('folder', path.posix.dirname(asset.imagekitPath));
      body.set('useUniqueFileName', 'false');
      body.set('overwriteFile', 'false');
      const result = await retry(async () => (await request('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', headers: { Authorization: auth }, body })).json());
      item = { source: asset.source, filename: asset.filename, mimeType: asset.mimeType, imagekitFileId: result.fileId, imagekitPath: result.filePath, url: result.url, size: asset.size, sha256: asset.sha256, status: 'uploaded-unverified' };
      record(item);
    }
    if (item.imagekitPath !== asset.imagekitPath) throw new Error('Remote destination does not match planned path');
    await retry(() => verify(item));
    record({ ...item, status: 'verified', error: undefined });
  } catch (error) {
    record({ ...(item || { source: asset.source, filename: asset.filename, mimeType: asset.mimeType, imagekitPath: asset.imagekitPath, size: asset.size, sha256: asset.sha256 }), status: 'failed', error: error.message });
  }
}
await retry(() => request('https://api.imagekit.io/v1/files?limit=1', { headers: { Authorization: auth } }));
// Reconcile deterministic destination paths before uploading. Existing assets
// are accepted only after the same metadata and original-byte verification.
const remoteFiles = new Map();
for (const folder of Object.values(destinations)) {
  for (let skip = 0; ; skip += 100) {
    const query = new URLSearchParams({ path: `/ramp-studio/portfolio/${folder}`, limit: '100', skip: String(skip) });
    const page = await retry(async () => (await request(`https://api.imagekit.io/v1/files?${query}`, { headers: { Authorization: auth } })).json());
    if (!Array.isArray(page)) throw new Error('Unexpected asset listing');
    for (const remote of page) if (remote.fileId && remote.filePath && remote.url) remoteFiles.set(remote.filePath, remote);
    if (page.length < 100) break;
  }
}
const queue = assets.filter(a => a.imagekitPath && a.status !== 'verified').slice(0, limit);
await Promise.all(Array.from({ length: 3 }, async () => { while (queue.length) await migrate(queue.shift()); }));
const failures = manifest.assets.filter(a => a.status !== 'verified');
console.log(`Verified: ${manifest.assets.length - failures.length}; failed: ${failures.length}. See manifest for details.`);
if (failures.length) process.exitCode = 1;
