const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "extension", "manifest.json"), "utf8"));
const content = fs.readFileSync(path.join(root, "extension", "content.js"), "utf8");

test("manifest has the exact minimal MV3 injection scope", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.content_scripts, [{
    matches: ["https://cdn.c.sat.gob.gt/aduana-digital/*"],
    js: ["content.js"],
    all_frames: true,
    run_at: "document_idle",
    world: "MAIN"
  }]);
  assert.equal(Object.hasOwn(manifest, "permissions"), false);
  assert.equal(Object.hasOwn(manifest, "host_permissions"), false);
  assert.equal(Object.hasOwn(manifest, "background"), false);
});

test("runtime source does not introduce prohibited extension capabilities", () => {
  for (const forbidden of ["chrome.downloads", "chrome.tabs", "chrome.scripting", "chrome.storage", "fetch(", "XMLHttpRequest", "WebSocket"]) {
    assert.equal(content.includes(forbidden), false, `found ${forbidden}`);
  }
  assert.match(content, /PDFViewerApplication\?\.pdfDocument/);
  assert.match(content, /getData\(\)/);
  assert.match(content, /getPdfDocument\(\) !== capturedDocument/);
});
