const fs = require("node:fs");

const files = [
  ".github/workflows/ci.yml",
  ".gitignore",
  ".nvmrc",
  "README.md",
  "TESTS.md",
  "FUENTES.md",
  "PRIVACIDAD.md",
  "package.json",
  "package-lock.json",
  "scripts/package.sh",
  "scripts/secret-scan.js",
  "scripts/syntax-check.js",
  "scripts/format-check.js",
  "tests/content.test.js",
  "tests/manifest.test.js",
  "tests/package.test.js",
  "tests/secret-scan.test.js",
  "extension/content.js",
  "extension/manifest.json"
];

const errors = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  if (content.includes("\r")) errors.push(`${file}: contains CR characters`);
  if (/^[ \t]+$/m.test(content)) errors.push(`${file}: contains a whitespace-only line`);
  if (/[ \t]+$/m.test(content)) errors.push(`${file}: contains trailing whitespace`);
  if (!content.endsWith("\n")) errors.push(`${file}: must end with a newline`);
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}
