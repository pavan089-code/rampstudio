const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { generateKeyPairSync, randomUUID } = require("node:crypto");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { test } = require("node:test");
const { setTimeout: delay } = require("node:timers/promises");
const { compileFunction } = require("node:vm");
const ts = require("typescript");
const { cert, initializeApp, deleteApp } = require("firebase-admin/app");
const { getAuth: getAdminAuth } = require("firebase-admin/auth");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");
const { initializeApp: initializeClientApp, deleteApp: deleteClientApp } = require("firebase/app");
const { connectAuthEmulator, getAuth, signInWithCustomToken, signInWithEmailAndPassword } = require("firebase/auth");

const projectId = "demo-ramp-bootstrap-test";
const authHost = "127.0.0.1:29099";
const firestoreHost = "127.0.0.1:28080";
const bootstrapEmail = "bootstrap@example.invalid";
const markerPath = "_internal/bootstrap-super-admin";
const root = resolve(__dirname, "..");
const enabled = process.env.RAMP_BOOTSTRAP_EMULATOR_TEST === "1";

function loadServerModule(relativePath, imports, env) {
  const source = readFileSync(resolve(root, relativePath), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  compileFunction(outputText, ["exports", "require", "process"])(exports, (name) => {
    assert.ok(Object.hasOwn(imports, name), `Unexpected test module import: ${name}`);
    return imports[name];
  }, { env });
  return exports;
}

async function startServer(t, port, env) {
  const url = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, [
    require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port),
  ], { cwd: root, env, stdio: "ignore", windowsHide: true });
  t.after(() => server.kill());
  for (let attempt = 0; attempt < 40 && server.exitCode === null; attempt++) {
    const response = await fetch(`${url}/admin/login`, { signal: AbortSignal.timeout(500) }).catch(() => null);
    if (response?.ok) return url;
    await delay(250);
  }
  assert.fail("The isolated Next.js server did not start. Build with the demo project ID first.");
}

test("bootstrap policy against local Firebase Auth and Firestore", { skip: !enabled, timeout: 120_000 }, async (t) => {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = authHost;
  process.env.FIRESTORE_EMULATOR_HOST = firestoreHost;
  const { privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  const clientEmail = `test@${projectId}.iam.gserviceaccount.com`;
  const admin = initializeApp({ projectId, credential: cert({ projectId, clientEmail, privateKey }) });
  const db = getFirestore(admin);
  const auth = getAdminAuth(admin);
  const marker = db.doc(markerPath);
  let ownsFixtures = false;
  t.after(async () => {
    try {
      if (ownsFixtures) await marker.delete();
    } finally {
      await deleteApp(admin);
    }
  });
  assert.equal((await db.collection("users").limit(1).get()).empty, true, "Use a fresh demo emulator");
  assert.equal((await marker.get()).exists, false, "Use a fresh demo emulator");
  ownsFixtures = true;

  const env = {
    ...process.env,
    NODE_ENV: "production",
    FIREBASE_PROJECT_ID: projectId,
    FIREBASE_CLIENT_EMAIL: clientEmail,
    FIREBASE_PRIVATE_KEY: privateKey,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: projectId,
  };
  const server = await startServer(t, 13212, { ...env, BOOTSTRAP_ADMIN_EMAIL: "  BOOTSTRAP@EXAMPLE.INVALID  " });
  const disabledServer = await startServer(t, 13213, { ...env, BOOTSTRAP_ADMIN_EMAIL: "" });
  const rbac = loadServerModule("src/lib/rbac-admin.ts", {
    "firebase-admin/firestore": { FieldValue },
    "@/lib/firebase-admin": { getAdminDb: () => db },
    "@/lib/rbac-types": loadServerModule("src/lib/rbac-types.ts", {}, {}),
  }, { BOOTSTRAP_ADMIN_EMAIL: bootstrapEmail });

  async function account(caseTest, email, verified = false) {
    const password = randomUUID();
    const authRecord = await auth.createUser(email ? { email, password, emailVerified: verified } : {});
    const { uid } = authRecord;
    const doc = db.collection("users").doc(uid);
    const app = initializeClientApp({ apiKey: "demo-key", projectId }, uid);
    caseTest.after(async () => {
      await deleteClientApp(app);
      await doc.delete();
      await auth.deleteUser(uid);
    });
    const clientAuth = getAuth(app);
    connectAuthEmulator(clientAuth, `http://${authHost}`, { disableWarnings: true });
    const credential = email
      ? await signInWithEmailAndPassword(clientAuth, email, password)
      : await signInWithCustomToken(clientAuth, await auth.createCustomToken(uid));
    const idToken = await credential.user.getIdToken(true);
    const claims = await auth.verifyIdToken(idToken, true);
    return { uid, idToken, doc, claims };
  }

  async function exchange(account, options = {}) {
    const response = await fetch(`${options.url || server}/api/admin/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: account.idToken, ...options.body }),
      signal: AbortSignal.timeout(12000),
    });
    return {
      status: response.status,
      code: (await response.json()).code,
      hasCookie: response.headers.has("set-cookie"),
    };
  }

  async function denied(account, options) {
    assert.deepEqual(await exchange(account, options), { status: 403, code: "ADMIN_RBAC_DENIED", hasCookie: false });
    assert.equal((await account.doc.get()).data().role, "viewer");
  }

  await t.test("matching unverified Firebase identity stays a viewer and is not upgraded after verification", async (c) => {
    const viewer = await account(c, bootstrapEmail);
    assert.equal(viewer.claims.email_verified, false);
    await denied(viewer);
    await auth.updateUser(viewer.uid, { emailVerified: true });
    const app = initializeClientApp({ apiKey: "demo-key", projectId }, `${viewer.uid}-refresh`);
    c.after(() => deleteClientApp(app));
    const client = getAuth(app);
    connectAuthEmulator(client, `http://${authHost}`, { disableWarnings: true });
    const credentials = await signInWithCustomToken(client, await auth.createCustomToken(viewer.uid));
    const idToken = await credentials.user.getIdToken();
    const claims = await auth.verifyIdToken(idToken, true);
    assert.equal(claims.email_verified, true);
    await denied({ ...viewer, idToken });
  });

  await t.test("nonmatching verified identity ignores client-supplied role and identity fields", async (c) => {
    const other = await account(c, "other@example.invalid", true);
    await denied(other, { body: {
      uid: "untrusted-uid", email: bootstrapEmail, email_verified: true, role: "super_admin",
    } });
    assert.equal((await db.doc("users/untrusted-uid").get()).exists, false);
  });

  await t.test("Firebase token with no email is denied before any role write", async (c) => {
    const noEmail = await account(c);
    assert.equal(noEmail.claims.email, undefined);
    assert.deepEqual(await exchange(noEmail), { status: 403, code: "ADMIN_EMAIL_REQUIRED", hasCookie: false });
    assert.equal((await noEmail.doc.get()).exists, false);
  });

  await t.test("missing and non-boolean verification claims cannot bootstrap", async (c) => {
    const candidate = await account(c, bootstrapEmail, true);
    // Firebase emits a boolean for this account. Vary the decoded claim only at the
    // policy boundary and run the real Firestore transaction without altering a JWT.
    const claims = { ...candidate.claims };
    delete claims.email_verified;
    assert.equal(await rbac.ensureUserRoleDocument(claims), "viewer");
    assert.equal((await candidate.doc.get()).data().role, "viewer");
    await candidate.doc.delete();
    assert.equal(await rbac.ensureUserRoleDocument({ ...claims, email_verified: "true" }), "viewer");
    assert.equal((await candidate.doc.get()).data().role, "viewer");
  });

  await t.test("disabled bootstrap denies a matching verified account", async (c) => {
    await denied(await account(c, bootstrapEmail, true), { url: disabledServer });
  });

  await t.test("a different existing administrator blocks first-time bootstrap", async (c) => {
    const existing = await account(c, "existing@example.invalid");
    await existing.doc.set({ role: "admin" });
    const candidate = await account(c, bootstrapEmail, true);
    await denied(candidate);
    assert.equal((await db.doc(markerPath).get()).exists, false);
    assert.deepEqual(await exchange(existing), { status: 200, code: undefined, hasCookie: true });
    assert.equal((await existing.doc.get()).data().role, "admin");
  });

  await t.test("an existing super admin retains access with bootstrap disabled", async (c) => {
    const existing = await account(c, bootstrapEmail);
    await existing.doc.set({ role: "super_admin" });
    assert.deepEqual(await exchange(existing, { url: disabledServer }), { status: 200, code: undefined, hasCookie: true });
    assert.equal((await existing.doc.get()).data().role, "super_admin");
  });

  await t.test("matching new verified account bootstraps once under concurrent requests", async (c) => {
    const candidate = await account(c, bootstrapEmail, true);
    const responses = await Promise.all([exchange(candidate), exchange(candidate)]);
    for (const response of responses) {
      assert.deepEqual(response, { status: 200, code: undefined, hasCookie: true });
    }
    assert.equal((await candidate.doc.get()).data().role, "super_admin");
    assert.equal((await marker.get()).data().uid === candidate.uid, true);
  });

  await t.test("bootstrap stays consumed after the first administrator is removed", async (c) => {
    assert.equal((await db.collection("users").limit(1).get()).empty, true);
    assert.equal((await marker.get()).exists, true);
    await denied(await account(c, bootstrapEmail, true));
  });
});
