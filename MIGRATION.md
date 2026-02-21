# Migration Guide (v1.0.0)

This guide covers migration to the formal v1 stable baseline and the new package split.

## Update: Overlay Pointer Events + External React Validation (v1.0.7)

- `PixelCard` y `PixelSurface` ahora usan `overlayPointerEvents="none"` por defecto.
- Esto evita que el contenido overlay bloquee hover/click/ripple del canvas.
- Si necesitas UI clickeable encima, usa `overlayPointerEvents="auto"`.
- Se validó integración en proyecto React externo (Vite + TS) con resultado positivo.

## Update: React Product Layer Completion + PixelCard DX (v1.0.6)

- `Phase D` completed with `PR-D3`.
- `PixelCard` now supports declarative grid mode via `gridConfig`.
- Added React DX hardening:
  - `effectKey` for `usePixelGridEffect` / `PixelGridCanvas` to control intentional effect recreation.

Recommended `PixelCard` usage:

```tsx
<PixelCard
  width={420}
  height={240}
  gridConfig={{
    colors: ["#0f172a", "#1e293b"],
    gap: 7,
    expandEase: 0.08,
    breathSpeed: 1
  }}
/>
```

## Update: React Product Layer Callbacks + Declarative Grid (v1.0.5)

- `@pixel-engine/react` now includes:
  - `usePixelGridEffect`
  - `PixelGridCanvas`
- New high-level callbacks:
  - `onHoverStart`
  - `onHoverEnd`
  - `onRipple` (grid hook/component path)
- Declarative usage now supports ripple trigger wiring with `rippleTrigger` (`click`, `pointerdown`, `none`).

If you were wiring `PixelGridEffect` manually inside `useEffect`, you can migrate to:

```tsx
<PixelGridCanvas
  width={800}
  height={500}
  onRipple={(event) => console.log(event.x, event.y)}
  gridConfig={{
    colors: ["#334155", "#475569", "#64748b"],
    gap: 6,
    expandEase: 0.08,
    breathSpeed: 0.9
  }}
/>
```

## Update: React Product Layer Baseline (v1.0.4)

- New package: `@pixel-engine/react`.
- New exports:
  - `usePixelEngine`
  - `PixelCanvas`
  - `PixelSurface`
  - `PixelCard`
- The React package is SSR-safe (`window` guards) and handles engine lifecycle cleanup by default.

Install:

```bash
npm install @pixel-engine/react @pixel-engine/core @pixel-engine/effects
```

Maintainer note:
- In this phase baseline, `PixelCanvas` + `onReady` is the simplest integration path.
- This baseline was extended by v1.0.5 and v1.0.6 with declarative grid hooks/components and interaction callbacks.

## Update: API Contract Cleanup + Runtime Optimization (v1.0.3)

- Aggregate package (`pixel-engine`) now re-exports directly from:
  - `@pixel-engine/core`
  - `@pixel-engine/effects`
- Legacy unused files removed (`src/types/*`, empty placeholders) with no public API impact.
- Runtime internals for `PixelGridEffect` were modularized to improve maintainability.
- New reproducible benchmark command:

```bash
npm run bench:pixelgrid
```

Maintainer note:
- Use `BENCHMARKS.md` snapshots as before/after reference when changing runtime paths.
- Keep aggregate usage as compatibility path; split-package imports remain recommended.

## Update: Publish Hardening + Consumer Smoke Test (v1.0.2)

- Package boundaries are now physically decoupled in `packages/core` and `packages/effects`.
- `@pixel-engine/effects` now depends on `@pixel-engine/core` with semver (`^1.0.0`) for publish-safe npm installs.
- New release validation flow:

```bash
npm run release:check
```

This now includes:
- tests
- build + package builds
- typecheck
- pack dry-runs
- consumer smoke install/import test from local tarballs

Maintainer note:
- Run `npm run release:check` before every public publish.
- Follow publish order in `RELEASE.md` (`core` -> `effects` -> `react` -> aggregate).

## Update: Canvas Background via PixelGridEffect (v1.0.1)

Canvas clear color can now be controlled directly from `PixelGridEffect`:
- `canvasBackground?: string | null` in `PixelGridConfig`
- `grid.setCanvasBackground(color | null)` at runtime

Recommended for effect-driven setups:

```ts
const engine = new PixelEngine({ canvas, width, height });
const grid = new PixelGridEffect(engine, width, height, {
  colors: ["#334155", "#475569", "#64748b"],
  gap: 6,
  expandEase: 0.08,
  breathSpeed: 0.9,
  canvasBackground: "transparent"
});
```

If you previously set background only with `engine.setClearColor(...)`, it still works.
For `PixelGridEffect` scenes, move that value to `canvasBackground` to keep config centralized.

## 1. Package Strategy

### Before
- Single package usage:
  - `pixel-engine`

### After
- Recommended split by concern:
  - `@pixel-engine/core` for engine/runtime/renderer/scene primitives
  - `@pixel-engine/effects` for `PixelGridEffect` and influence systems
  - `@pixel-engine/react` for React lifecycle hook + ready-to-use canvas/surface/card components

You can still use `pixel-engine` as aggregate compatibility package.

## 2. Installation

```bash
npm install @pixel-engine/core @pixel-engine/effects @pixel-engine/react
```

Or keep compatibility aggregate:

```bash
npm install pixel-engine
```

## 3. Import Changes

### Recommended (split)
```ts
import { PixelEngine } from "@pixel-engine/core";
import { PixelGridEffect } from "@pixel-engine/effects";
```

### Compatibility (aggregate)
```ts
import { PixelEngine, PixelGridEffect } from "pixel-engine";
```

## 4. PixelGridConfig Changes

Use structured config blocks:
- `hoverEffects`
- `rippleEffects`
- `breathing`

Use optional masks:
- `imageMask` is optional
- `textMask` is optional

If both are omitted, the grid still works with hover/ripple/organic effects only.

## 5. Why split into `core` and `effects`?

- Better dependency boundaries:
  - app code that only needs runtime primitives does not pull effect code.
- Easier framework wrappers:
  - React/Vue wrappers can depend on `core` and opt into `effects`.
- Better long-term maintenance:
  - independent evolution of runtime vs effect modules.
- Cleaner publish strategy:
  - smaller packages, clearer ownership, less API ambiguity.

## 6. Build in this repository

```bash
npm run build
npm run build:packages
```

`build:packages` builds:
- `@pixel-engine/core`
- `@pixel-engine/effects`
- `@pixel-engine/react`

## 7. Verification checklist

- Update imports to split packages (recommended).
- Update `PixelGridConfig` usage to stable structured options.
- Ensure asset URLs are bundled URLs in app projects:
  - use `import img from "./asset.png"` instead of `"/src/..."`
- Run tests/build after migration.
