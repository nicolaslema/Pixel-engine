import { mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execSync } from "node:child_process";

const root = resolve(process.cwd());
const outDir = mkdtempSync(join(tmpdir(), "pixel-engine-pack-verify-"));

function run(command) {
  execSync(command, {
    cwd: root,
    stdio: "inherit"
  });
}

function assertTarball(prefix) {
  const file = readdirSync(outDir).find((name) => name.startsWith(prefix) && name.endsWith(".tgz"));
  if (!file) {
    throw new Error(`Missing tarball with prefix "${prefix}"`);
  }
  const full = join(outDir, file);
  const size = statSync(full).size;
  if (size <= 0) {
    throw new Error(`Tarball "${file}" is empty`);
  }
}

try {
  run(`npm pack --pack-destination "${outDir}"`);
  run(`npm pack --pack-destination "${outDir}" -w @pixel-engine/core`);
  run(`npm pack --pack-destination "${outDir}" -w @pixel-engine/effects`);
  run(`npm pack --pack-destination "${outDir}" -w @pixel-engine/react`);

  assertTarball("pixel-engine-");
  assertTarball("pixel-engine-core-");
  assertTarball("pixel-engine-effects-");
  assertTarball("pixel-engine-react-");

  console.log("release-pack-verify: all tarballs generated successfully");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
