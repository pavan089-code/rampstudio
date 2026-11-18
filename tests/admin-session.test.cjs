const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const { NextResponse } = require("next/server");

const routePath = path.join(__dirname, "../src/app/api/admin/session/route.ts");
const compiledRoute = ts.transpileModule(fs.readFileSync(routePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function loadRoute(options = {}) {
  const calls = [];
  const token = { uid: "user-1", sub: "user-1", email: "admin@example.test", exp: Math.floor(Date.now() / 1000) + 3600 };
  const auth = {
    async verifyIdToken(value, checkRevoked) {
      calls.push(["verifyIdToken", value, checkRevoked]);
      if (options.verifyError) throw new Error("SECRET verify error");
      return options.token || token;
    },
    async createSessionCookie(value, config) {
      calls.push(["createSessionCookie", value, config.expiresIn]);
      if (options.cookieError) throw new Error("SECRET cookie error");
      return "test-session-cookie";
    },
  };
  class RbacAuthorizationError extends Error {}
  const modules = {
    "next/server": { NextResponse },
    "@/lib/admin-session": { ADMIN_SESSION_COOKIE: "ramp_admin_session", ADMIN_SESSION_MAX_AGE: 604800 },
    "@/lib/firebase-admin": { getAdminAuth() { calls.push(["getAdminAuth"]); if (options.initError) throw new Error("SECRET init error"); return auth; } },
    "@/lib/rbac-admin": {
      async ensureUserRoleDocument(value) { calls.push(["role", value.uid]); return options.role || "admin"; },
      isAdminRole(role) { return role === "admin"; },
      RbacAuthorizationError,
    },
  };
  const context = { exports: {}, require(name) { if (!(name in modules)) throw new Error(`Unexpected import: ${name}`); return modules[name]; }, process: { env: { NODE_ENV: "production" } }, console: { info() {}, error() {} } };
  vm.runInNewContext(compiledRoute, context, { filename: routePath });
  return { ...context.exports, calls };
}

function request(body) {
  return new Request("http://localhost/api/admin/session", { method: "POST", headers: { "content-type": "application/json" }, ...(body === undefined ? {} : { body }) });
}

for (const [name, body] of [["null", "null"], ["empty body", undefined], ["invalid JSON", "{"], ["array", "[]"], ["string", '"value"'], ["number", "123"], ["boolean", "true"]]) {
  test(`rejects ${name} before initializing Firebase`, async () => {
    const route = loadRoute();
    const response = await route.POST(request(body));
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { ok: false, code: "INVALID_SESSION_REQUEST", message: "Invalid admin session request." });
    assert.equal(route.calls.length, 0);
  });
}

for (const [name, body] of [["missing token", {}], ["null token", { idToken: null }], ["number token", { idToken: 12 }], ["array token", { idToken: [] }], ["object token", { idToken: {} }], ["blank token", { idToken: "  " }]]) {
  test(`rejects ${name} before initializing Firebase`, async () => {
    const route = loadRoute();
    const response = await route.POST(request(JSON.stringify(body)));
    assert.equal(response.status, 400);
    assert.equal((await response.json()).code, "MISSING_ID_TOKEN");
    assert.equal(route.calls.length, 0);
  });
}

test("valid admin token verifies revocation and creates a secure session", async () => {
  const route = loadRoute();
  const response = await route.POST(request(JSON.stringify({ idToken: "valid-token" })));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, success: true });
  assert.deepEqual(route.calls, [["getAdminAuth"], ["verifyIdToken", "valid-token", true], ["role", "user-1"], ["createSessionCookie", "valid-token", 604800000]]);
  const cookie = response.headers.get("set-cookie");
  assert.match(cookie, /ramp_admin_session=test-session-cookie/);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /Secure/i);
  assert.match(cookie, /SameSite=lax/i);
  assert.match(cookie, /Max-Age=604800/i);
});

for (const [name, options, status, code] of [
  ["invalid or revoked token", { verifyError: true }, 401, "TOKEN_VERIFICATION_FAILED"],
  ["non-admin role", { role: "viewer" }, 403, "ADMIN_RBAC_DENIED"],
  ["session creation failure", { cookieError: true }, 500, "SESSION_CREATION_FAILED"],
  ["internal failure", { initError: true }, 500, "ADMIN_SESSION_INTERNAL_ERROR"],
]) {
  test(`${name} does not disclose internal details`, async () => {
    const route = loadRoute(options);
    const response = await route.POST(request(JSON.stringify({ idToken: "test-token" })));
    assert.equal(response.status, status);
    const body = await response.json();
    assert.equal(body.code, code);
    assert.doesNotMatch(JSON.stringify(body), /SECRET|stack|test-token|test-session-cookie/);
    assert.equal(response.headers.get("set-cookie"), null);
    if (options.role) assert.equal(route.calls.some((call) => call[0] === "createSessionCookie"), false);
  });
}

test("DELETE clears the session cookie", async () => {
  const route = loadRoute();
  const response = await route.DELETE();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  assert.match(response.headers.get("set-cookie"), /ramp_admin_session=;.*Max-Age=0/i);
});
