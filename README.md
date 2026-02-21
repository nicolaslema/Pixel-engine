# Pixel Engine

High-performance 2D pixel simulation engine for browser apps and UI frameworks.

## Features

- Fixed-step engine loop and scene system
- Renderer-agnostic core (`IRenderer`) with Canvas2D backend
- Composable influence system (hover, ripple, noise, masks, morph)
- Configurable `PixelGridEffect` with strict API (`hoverEffects`, `rippleEffects`, `breathing`)
- Typed exports for framework integrations (React/Vue/Svelte wrappers)

## Status

Stable API baseline (v1) for core + `PixelGridEffect`.
Phase A (publish architecture hardening) completed.
Phase B (API contract + docs consistency) completed.
Phase C (runtime performance + benchmark baseline) completed.
Phase D (React product layer) completed (PR-D1 + PR-D2 + PR-D3).

## Install

Recommended split packages:

```bash
npm install @pixel-engine/core @pixel-engine/effects @pixel-engine/react
```

Compatibility aggregate package:

```bash
npm install pixel-engine
```

## Quick Usage

```ts
import { PixelEngine } from "@pixel-engine/core";
import { PixelGridEffect } from "@pixel-engine/effects";

const canvas = document.getElementById("app") as HTMLCanvasElement;

const engine = new PixelEngine({
  canvas,
  width: 1000,
  height: 700
});

const grid = new PixelGridEffect(engine, 1000, 700, {
  colors: ["#334155", "#475569", "#64748b"],
  gap: 6,
  expandEase: 0.08,
  breathSpeed: 0.9,
  canvasBackground: "transparent", // or "#0f172a", "rgba(0,0,0,0.35)", null
  hoverEffects: { mode: "reactive", radius: 120, shape: "vignette" },
  rippleEffects: { speed: 0.5, thickness: 48, strength: 28, maxRipples: 30 }
});

engine.addEntity(grid);
engine.start();

// Runtime control:
grid.setCanvasBackground("#111827");
grid.setCanvasBackground("transparent");
grid.setCanvasBackground(null);
```

## React Example

```tsx
import { useCallback } from "react";
import { PixelGridCanvas } from "@pixel-engine/react";
import catPngUrl from "./assets/cat.png";

export function PixelBackground() {
  return (
    <PixelGridCanvas
      width={1000}
      height={700}
      onHoverStart={(event) => console.log("hover start", event.x, event.y)}
      onHoverEnd={(event) => console.log("hover end", event.x, event.y)}
      onRipple={(event) => console.log("ripple", event.x, event.y)}
      gridConfig={{
      colors: ["#334155", "#475569", "#64748b"],
      gap: 6,
      expandEase: 0.08,
      breathSpeed: 1,
      hoverEffects: { mode: "reactive", radius: 110, shape: "circle" },
      rippleEffects: { speed: 0.5, thickness: 50, strength: 30, maxRipples: 25 },
      imageMask: {
        src: catPngUrl,
        centerX: 500,
        centerY: 350,
        scale: 2,
        sampleMode: "threshold"
      }
    }}
    />
  );
}
```

## PixelCard in 10 lines

```tsx
import { PixelCard } from "@pixel-engine/react";

export function HeroCard() {
  return (
    <PixelCard width={420} height={240} gridConfig={{ colors: ["#0f172a", "#1e293b"], gap: 7, expandEase: 0.08, breathSpeed: 1 }}>
      <h3>Pixel Card</h3>
    </PixelCard>
  );
}
```

`PixelCard` now supports both modes:
- engine mode: no `gridConfig` (raw engine canvas layer)
- grid mode: provide `gridConfig` for declarative `PixelGridEffect`

DX hardening:
- `usePixelGridEffect` adds `effectKey` so inline config objects do not recreate effects accidentally.
- change `effectKey` explicitly when you want to recreate the underlying `PixelGridEffect`.

Compatibility aggregate import remains available:

```ts
import { PixelEngine, PixelGridEffect } from "pixel-engine";
```

Use bundled asset URLs (`import img from "./asset.png"`). Do not use `"/src/..."` paths in app projects.
`imageMask` and `textMask` are optional; you can run the effect with no masks.
`canvasBackground` is the recommended way to control canvas clear color from effect config.

## Architecture

- `core`: engine lifecycle, loop, timing
- `scene`: entities + update/render traversal
- `renderers`: abstraction + Canvas2D implementation
- `influences`: reusable influence primitives
- `entities`: high-level effects (`PixelGridEffect`)
- `entities/pixel-grid/internal`: private runtime modules (not part of public API)

## Scripts

- `npm run dev`: runs playground with Vite.
- `npm run test`: runs Vitest.
- `npm run build`: builds distributable library with `tsup` (ESM/CJS/types).
- `npm run typecheck`: TypeScript validation (`tsc --noEmit`).
- `npm run build:packages`: builds `@pixel-engine/core`, `@pixel-engine/effects`, and `@pixel-engine/react`.
- `npm run build:all`: builds aggregate + split packages.
- `npm run verify`: test + build + typecheck.
- `npm run bench:pixelgrid`: reproducible PixelGrid performance baseline.
- `npm run smoke:consumer`: validates package consumption from local tarballs.
- `npm run release:check`: verify + pack dry-runs + consumer smoke test.
- `npm run build:playground`: builds playground app with Vite.
- API reference and examples: `API.md`
- Release notes: `CHANGELOG.md`
- Migration guide: `MIGRATION.md`
- Release workflow: `RELEASE.md`
- Benchmark notes: `BENCHMARKS.md`

## Package Split

- `@pixel-engine/core`: runtime primitives (engine, loop, scene, renderers, input, base grid helpers).
- `@pixel-engine/effects`: high-level effects (`PixelGridEffect`), influences, masks.
- `@pixel-engine/react`: React hook/components (`usePixelEngine`, `usePixelGridEffect`, `PixelCanvas`, `PixelGridCanvas`, `PixelSurface`, `PixelCard`).

Benefits:
- smaller dependency surface per use-case
- cleaner boundaries and maintainability
- easier wrappers for React/Vue/Svelte
- clearer long-term API ownership
