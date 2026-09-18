const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadHooks() {
  const context = {
    window: { __SAT_PDF_LOCAL_TEST__: true },
    document: {},
    ArrayBuffer,
    Uint8Array,
    setTimeout,
    clearTimeout
  };
  context.window.window = context.window;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "extension", "content.js"), "utf8"), context);
  return context.window.__SAT_PDF_LOCAL_TEST_HOOKS__;
}

test("accepts a valid PDF header and rejects empty or non-PDF bytes", () => {
  const { hasPdfHeader } = loadHooks();
  assert.equal(hasPdfHeader(new Uint8Array(Buffer.from("%PDF-1.7"))), true);
  assert.equal(hasPdfHeader(new Uint8Array()), false);
  assert.equal(hasPdfHeader(new Uint8Array(Buffer.from("not-a-pdf"))), false);
});

test("converts supported byte containers without copying unnecessarily", () => {
  const { asUint8Array } = loadHooks();
  const buffer = new ArrayBuffer(4);
  const bytes = new Uint8Array(buffer);
  assert.equal(asUint8Array(bytes), bytes);
  assert.equal(asUint8Array(buffer).buffer, buffer);
  assert.deepEqual(Array.from(asUint8Array(new DataView(buffer))), [0, 0, 0, 0]);
  assert.equal(asUint8Array("%PDF-"), null);
});

test("builds a portable timestamped filename without page data", () => {
  const { buildFilename } = loadHooks();
  assert.equal(buildFilename(new Date(2026, 0, 2, 3, 4, 5)), "sat-pdf-20260102-030405.pdf");
  assert.match(buildFilename(new Date()), /^sat-pdf-\d{8}-\d{6}\.pdf$/);
});
