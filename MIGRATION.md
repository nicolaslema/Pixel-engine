# Migration Guide (v1.0.0)

This guide covers migration to the formal v1 stable baseline and the new package split.

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
