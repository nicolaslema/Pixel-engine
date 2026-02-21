const { mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");
const { execSync } = require("node:child_process");

const repoRoot = resolve(process.cwd());
const benchRoot = mkdtempSync(join(tmpdir(), "pixel-engine-bench-"));
const packsDir = join(benchRoot, "packs");
const appDir = join(benchRoot, "bench-app");

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

const runnerCode = `
const { performance } = require("node:perf_hooks");
const { PixelGridEffect } = require("@pixel-engine/effects");

function createFakeRenderer() {
  const ctx = { fillStyle: "#000000", globalAlpha: 1, fillRect() {} };
  return { getContext() { return ctx; } };
}

function runBenchmark() {
  const width = 1000;
  const height = 700;
  const gap = 6;
  const frames = 240;
  const warmupFrames = 60;

  const enginePointer = {
    mouse: { x: width * 0.5, y: height * 0.5, inside: true, down: false },
    setClearColor() {}
  };

  const effect = new PixelGridEffect(
    enginePointer,
    width,
    height,
    {
      colors: ["#334155", "#475569", "#64748b"],
      gap,
      expandEase: 0.08,
      breathSpeed: 1,
      hoverEffects: {
        mode: "reactive",
        radius: 120,
        radiusY: 95,
        shape: "vignette",
        interactionScope: "all",
        deactivate: 0.8,
        displace: 3,
        jitter: 1.2,
        strength: 1
      },
      rippleEffects: {
        enabled: true,
        speed: 0.5,
        thickness: 48,
        strength: 28,
        maxRipples: 24,
        deactivateMultiplier: 0.9,
        displaceMultiplier: 1.1,
        jitterMultiplier: 1.1
      },
      breathing: {
        enabled: true,
        speed: 1.2,
        strength: 0.5,
        affectHover: true,
        affectImage: false,
        affectText: false
      }
    },
    { ripple: true, hover: true, organic: false }
  );

  const renderer = createFakeRenderer();
  const estimatedCells = Math.ceil(width / gap) * Math.ceil(height / gap);

  for (let i = 0; i < warmupFrames; i++) {
    enginePointer.mouse.x = (Math.sin(i * 0.07) * 0.4 + 0.5) * width;
    enginePointer.mouse.y = (Math.cos(i * 0.09) * 0.4 + 0.5) * height;
    if (i % 12 === 0) {
      effect.triggerRipple(enginePointer.mouse.x, enginePointer.mouse.y);
    }
    effect.update(16.67);
    effect.render(renderer);
  }

  let updateTotalMs = 0;
  let renderTotalMs = 0;
  const heapStart = process.memoryUsage().heapUsed;

  for (let i = 0; i < frames; i++) {
    enginePointer.mouse.x = (Math.sin(i * 0.07) * 0.4 + 0.5) * width;
    enginePointer.mouse.y = (Math.cos(i * 0.09) * 0.4 + 0.5) * height;
    if (i % 12 === 0) {
      effect.triggerRipple(enginePointer.mouse.x, enginePointer.mouse.y);
    }

    const updateStart = performance.now();
    effect.update(16.67);
    updateTotalMs += performance.now() - updateStart;

    const renderStart = performance.now();
    effect.render(renderer);
    renderTotalMs += performance.now() - renderStart;
  }

  const heapEnd = process.memoryUsage().heapUsed;
  const avgUpdate = updateTotalMs / frames;
  const avgRender = renderTotalMs / frames;
  const avgFrame = avgUpdate + avgRender;
  const fps = 1000 / avgFrame;
  const heapDeltaMb = (heapEnd - heapStart) / (1024 * 1024);

  console.log("PixelGrid benchmark baseline");
  console.log("- Cells (estimated): " + estimatedCells);
  console.log("- Frames sampled: " + frames);
  console.log("- Avg update ms: " + avgUpdate.toFixed(3));
  console.log("- Avg render ms: " + avgRender.toFixed(3));
  console.log("- Avg frame ms: " + avgFrame.toFixed(3));
  console.log("- Est. FPS: " + fps.toFixed(1));
  console.log("- Heap delta MB: " + heapDeltaMb.toFixed(3));
}

runBenchmark();
`;

try {
  run(`npm pack --pack-destination "${packsDir}" -w @pixel-engine/core`);
  run(`npm pack --pack-destination "${packsDir}" -w @pixel-engine/effects`);

  const coreTgz = findPack("pixel-engine-core-");
  const effectsTgz = findPack("pixel-engine-effects-");

  writeFileSync(
    join(appDir, "package.json"),
    JSON.stringify(
      {
        name: "pixel-engine-bench-runner",
        private: true
      },
      null,
      2
    )
  );

  writeFileSync(join(appDir, "runner.cjs"), runnerCode);

  run(
    `npm install --no-package-lock --ignore-scripts "${coreTgz}" "${effectsTgz}"`,
    appDir
  );

  run("node runner.cjs", appDir);
} finally {
  rmSync(benchRoot, { recursive: true, force: true });
}
