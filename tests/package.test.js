const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const test = require("node:test");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const zipName = "sat-pdf-local-0.1.0.zip";
const checksumName = `${zipName}.sha256`;
const checksumPath = path.join(dist, checksumName);

function packageHash() {
  execFileSync("npm", ["run", "package"], { cwd: root, stdio: "pipe" });
  return fs.readFileSync(checksumPath, "utf8").trim();
}

test("produces the same ZIP hash across consecutive packaging runs", () => {
  assert.equal(packageHash(), packageHash());
});

test("writes a portable checksum verifiable from dist", () => {
  const checksum = fs.readFileSync(checksumPath, "utf8").trim();
  const escapedZipName = zipName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  assert.match(checksum, new RegExp(`^[a-f0-9]{64}  ${escapedZipName}$`));
  assert.equal(checksum.includes("/"), false);
  assert.equal(checksum.includes("\\\\"), false);
  assert.equal(path.isAbsolute(checksum.split(/\s+/)[1]), false);
  assert.equal(checksum.includes(process.env.USER || "__missing_local_user__"), false);

  execFileSync("sha256sum", ["-c", checksumName], { cwd: dist, stdio: "pipe" });
});
