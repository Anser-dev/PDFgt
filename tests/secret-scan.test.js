const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { scanFiles } = require("../scripts/secret-scan.js");

test("detects a synthetic token without exposing its value", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "secret-scan-"));
  const file = path.join(directory, "fixture.txt");
  fs.writeFileSync(file, "token = ghp_1234567890abcdefghijklmnop\n");

  try {
    assert.deepEqual(scanFiles(["fixture.txt"], directory), [
      { file: "fixture.txt", pattern: "github-token" },
    ]);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("ignores innocuous documentation and placeholders", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "secret-scan-"));
  const file = path.join(directory, "README.md");
  fs.writeFileSync(
    file,
    "Use Authorization: Bearer <token> and set API_KEY=REPLACE_ME in local configuration.\n",
  );

  try {
    assert.deepEqual(scanFiles(["README.md"], directory), []);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
