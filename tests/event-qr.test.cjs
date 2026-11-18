const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const { NextResponse } = require("next/server");

function load(file, modules, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const context = { exports: {}, require(name) { if (!(name in modules)) throw new Error(`Unexpected import: ${name}`); return modules[name]; }, ...globals };
  vm.runInNewContext(compiled, context);
  return context.exports;
}
const urls = load("src/lib/events/public-url.ts", {});
function flatten(node) {
  if (!node || typeof node !== "object") return [];
  return [node, ...[].concat(node.props?.children || []).flatMap(flatten)];
}
function render(props) {
  const actions = {};
  const jsx = (type, props) => ({ type, props });
  const canvas = { toDataURL(type) { actions.pngType = type; return "data:image/png;base64,example"; } };
  const component = load("src/components/events/admin/EventQrCode.tsx", {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    react: { useRef: () => ({ current: canvas }), useState: () => ["", () => {}] },
    "qrcode.react": { QRCodeCanvas: "qr" },
    "@/lib/events/public-url": urls,
  }, { navigator: { clipboard: { async writeText(value) { actions.copied = value; } } }, document: { createElement() { return { click() { actions.download = { href: this.href, name: this.download }; } }; } } });
  return { nodes: flatten(component.default(props)), actions };
}

test("published events encode distinct permanent production URLs", () => {
  const a = render({ eventId: "one", title: "One", published: true });
  const b = render({ eventId: "two", title: "Two", published: true });
  assert.equal(a.nodes.find((node) => node.type === "qr").props.value, "https://www.rampstudio.in/e/one");
  assert.notEqual(a.nodes.find((node) => node.type === "qr").props.value, b.nodes.find((node) => node.type === "qr").props.value);
});
test("drafts and unsaved events do not expose a QR", () => {
  for (const props of [{ eventId: "one", published: false }, { published: true }]) {
    assert.equal(render(props).nodes.some((node) => node.type === "qr"), false);
  }
});
test("copy and download use the displayed event code", async () => {
  const { nodes, actions } = render({ eventId: "one", title: "One", published: true });
  await nodes.find((node) => node.props?.children === "Copy Event Link").props.onClick();
  nodes.find((node) => node.props?.children === "Download QR Code (PNG)").props.onClick();
  assert.equal(actions.copied, "https://www.rampstudio.in/e/one");
  assert.equal(actions.pngType, "image/png");
  assert.equal(actions.download.name, "event-one-qr.png");
});
test("permanent route redirects to the current slug and hides unpublished events", async () => {
  let slug = "first-slug";
  const route = load("src/app/e/[id]/route.ts", { "next/server": { NextResponse }, "@/lib/events/event-server-service": { async getPublicEventSlugById() { return slug; } } }, { URL, Response });
  const request = new Request("https://www.rampstudio.in/e/one");
  const params = Promise.resolve({ id: "one" });
  let response = await route.GET(request, { params });
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "https://www.rampstudio.in/events/first-slug");
  slug = "new-slug";
  response = await route.GET(request, { params });
  assert.equal(response.headers.get("location"), "https://www.rampstudio.in/events/new-slug");
  slug = null;
  response = await route.GET(request, { params });
  assert.equal(response.status, 404);
});
