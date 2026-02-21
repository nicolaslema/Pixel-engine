# Migration Guide (v1.0.0)

This guide covers migration to the formal v1 stable baseline and the new package split.

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
- Follow publish order in `RELEASE.md` (`core` -> `effects` -> aggregate).

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

You can still use `pixel-engine` as aggregate compatibility package.

## 2. Installation

```bash
npm install @pixel-engine/core @pixel-engine/effects
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

## 7. Verification checklist

- Update imports to split packages (recommended).
- Update `PixelGridConfig` usage to stable structured options.
- Ensure asset URLs are bundled URLs in app projects:
  - use `import img from "./asset.png"` instead of `"/src/..."`
- Run tests/build after migration.
