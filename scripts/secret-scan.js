const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const scannerPath = path.relative(process.cwd(), __filename);
const ignoredPaths = new Set([scannerPath, "tests/secret-scan.test.js"]);
const placeholderPattern = /^(?:<[^>]+>|\$\{[^}]+\}|CHANGE_ME|REPLACE_ME|example|sample|placeholder|redacted|your[_-].*|test[_-].*|fake[_-].*|dummy[_-].*)$/i;

const patterns = [
  { name: "private-key", regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { name: "github-token", regex: /\b(?:gh[pousr]|github_pat)_[A-Za-z0-9_]{20,}\b/ },
  { name: "gitlab-token", regex: /\bglpat-[A-Za-z0-9_-]{20,}\b/ },
  { name: "slack-token", regex: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/ },
  { name: "stripe-live-key", regex: /\bsk_live_[A-Za-z0-9]{16,}\b/ },
  { name: "aws-access-key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "jwt", regex: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/ },
  { name: "authorization-bearer", regex: /\bAuthorization\s*:\s*Bearer\s+[A-Za-z0-9._~+/=-]{20,}/i },
  {
    name: "suspicious-assignment",
    regex: /\b(?:api[_-]?key|client[_-]?secret|password|private[_-]?key|secret|token)\s*[:=]\s*["'`]([^"'`\r\n]{12,})["'`]/i,
    valueGroup: 1,
  },
];

function isPlaceholder(value) {
  return placeholderPattern.test(value.trim()) || /^[._-]+$/.test(value.trim());
}

function scanText(text) {
  const findings = [];

  for (const pattern of patterns) {
    const match = pattern.regex.exec(text);
    if (match && (!pattern.valueGroup || !isPlaceholder(match[pattern.valueGroup]))) {
      findings.push(pattern.name);
    }
  }

  return findings;
}

function trackedTextFiles(root = process.cwd()) {
  const output = execFileSync("git", ["ls-files", "-z"], { cwd: root });
  return output
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .filter((file) => !ignoredPaths.has(file))
    .filter((file) => !fs.readFileSync(path.join(root, file)).includes(0));
}

function scanFiles(files, root = process.cwd()) {
  const findings = [];

  for (const file of files) {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    for (const pattern of scanText(text)) {
      findings.push({ file, pattern });
    }
  }

  return findings;
}

function main() {
  const findings = scanFiles(trackedTextFiles());
  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(`${finding.file}: ${finding.pattern}`);
    }
    process.exitCode = 1;
  }
}

module.exports = { scanFiles, scanText, trackedTextFiles };

if (require.main === module) main();
