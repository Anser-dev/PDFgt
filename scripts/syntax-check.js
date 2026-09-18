const { spawnSync } = require("node:child_process");

const files = [
  "extension/content.js",
  "tests/content.test.js",
  "tests/manifest.test.js",
  "tests/package.test.js",
  "tests/secret-scan.test.js",
  "scripts/format-check.js",
  "scripts/secret-scan.js",
  "scripts/syntax-check.js"
];

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
