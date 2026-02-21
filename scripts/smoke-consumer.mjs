import { mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execSync } from "node:child_process";

const repoRoot = resolve(process.cwd());
const smokeRoot = mkdtempSync(join(tmpdir(), "pixel-engine-smoke-"));
const packsDir = join(smokeRoot, "packs");
const appDir = join(smokeRoot, "consumer-app");

mkdirSync(packsDir, { recursive: true });
mkdirSync(appDir, { recursive: true });

function run(command, cwd = repoRoot) {
  execSync(command, {
    cwd,
    stdio: "inherit"
  });
}

function findPack(prefix) {
  const files = readdirSync(packsDir);
  const match = files.find((file) => file.startsWith(prefix) && file.endsWith(".tgz"));
  if (!match) {
    throw new Error(`Missing tarball for ${prefix}`);
  }
  return join(packsDir, match);
}

try {
  run(`npm pack --pack-destination "${packsDir}"`);
  run(`npm pack --pack-destination "${packsDir}" -w @pixel-engine/core`);
  run(`npm pack --pack-destination "${packsDir}" -w @pixel-engine/effects`);

  const aggregateTgz = findPack("pixel-engine-");
  const coreTgz = findPack("pixel-engine-core-");
  const effectsTgz = findPack("pixel-engine-effects-");

  writeFileSync(
    join(appDir, "package.json"),
    JSON.stringify(
      {
        name: "pixel-engine-smoke-consumer",
        private: true,
        type: "module"
      },
      null,
      2
    )
  );

  writeFileSync(
    join(appDir, "smoke.mjs"),
    [
      'import { PixelEngine as CoreEngine } from "@pixel-engine/core";',
      'import { PixelGridEffect as EffectsGrid } from "@pixel-engine/effects";',
      'import { PixelEngine as AggregateEngine, PixelGridEffect as AggregateGrid } from "pixel-engine";',
      "",
      "if (typeof CoreEngine !== 'function') throw new Error('Missing CoreEngine export');",
      "if (typeof EffectsGrid !== 'function') throw new Error('Missing EffectsGrid export');",
      "if (typeof AggregateEngine !== 'function') throw new Error('Missing aggregate CoreEngine export');",
      "if (typeof AggregateGrid !== 'function') throw new Error('Missing aggregate EffectsGrid export');",
      "console.log('Smoke consumer import check passed');"
    ].join("\n")
  );

  run(
    [
      "npm install --no-package-lock --ignore-scripts",
      `"${coreTgz}"`,
      `"${effectsTgz}"`,
      `"${aggregateTgz}"`
    ].join(" "),
    appDir
  );

  run("node smoke.mjs", appDir);
} finally {
  rmSync(smokeRoot, { recursive: true, force: true });
}
