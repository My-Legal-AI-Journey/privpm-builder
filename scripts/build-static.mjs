import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = path.join(root, "src/app/api");
const stash = path.join(root, ".api-stash");

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: "inherit", env: { ...process.env, STATIC_EXPORT: "1" } });
}

if (fs.existsSync(stash)) fs.rmSync(stash, { recursive: true, force: true });
if (fs.existsSync(apiDir)) fs.renameSync(apiDir, stash);

try {
  run("npx next build");
} finally {
  if (fs.existsSync(stash)) fs.renameSync(stash, apiDir);
}
