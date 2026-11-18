import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync('imagekit-migration-manifest.json', 'utf8'));
const mapping = {};
for (const asset of manifest.assets) {
  if (asset.status !== 'verified') continue;
  const url = new URL(asset.url);
  if (url.protocol !== 'https:' || url.hostname !== 'ik.imagekit.io') throw new Error('Unexpected delivery URL');
  mapping[asset.source] = asset.url;
}
fs.writeFileSync('src/lib/portfolio-assets.generated.json', JSON.stringify(mapping, null, 2) + '\n');
console.log(`Generated ${Object.keys(mapping).length} verified mappings.`);
