# Changelog

All notable changes to this project are documented in this file.

## [1.0.2] - 2026-02-21

### Added
- External consumer smoke test script (`scripts/smoke-consumer.mjs`) that:
  - packs local tarballs
  - installs them in a temporary app
  - validates real imports for `pixel-engine`, `@pixel-engine/core`, and `@pixel-engine/effects`
- Release workflow documentation in `RELEASE.md`.

### Changed
- Completed Phase A package decoupling:
  - `packages/core` and `packages/effects` now export from local package sources (no root `src` re-exports).
  - `@pixel-engine/effects` imports runtime contracts from `@pixel-engine/core`.
- Publish metadata hardened in root/core/effects package manifests.
- `release:check` now runs:
  - verify (test + build + typecheck)
  - pack dry-runs
  - external consumer smoke test
- `@pixel-engine/effects` dependency on `@pixel-engine/core` switched from workspace protocol to semver (`^1.0.0`) for publish-safe installs.

## [1.0.1] - 2026-02-20

### Added
- `canvasBackground?: string | null` in `PixelGridConfig` to control canvas clear color from `PixelGridEffect`.
- `PixelGridEffect#setCanvasBackground(color: string | null)` for runtime background updates.
- Transparent clear support (`null` or `"transparent"`) in Canvas2D renderer clear path.
- Tests for renderer clear behavior and `PixelEngine` clear-color runtime updates.

### Changed
- Playground background controls were simplified:
  - canvas background is now controlled only by `PixelGridEffect` config/runtime API
  - playground UI keeps only page background control for transparency testing
- Documentation updated (`README.md`, `API.md`, `MIGRATION.md`) to reflect effect-driven canvas background flow.

## [1.0.0] - 2026-02-20

### Added
- Formal v1 stable baseline for `PixelEngine` + `PixelGridEffect`.
- Strict `PixelGridConfig` API centered on:
  - `hoverEffects`
  - `rippleEffects`
  - `breathing`
  - `imageMask` / `textMask`
  - `autoMorph`
- Internal modularization of PixelGrid runtime:
  - `entities/pixel-grid/internal/runtime-state`
  - `entities/pixel-grid/internal/mask-state-machine`
  - `entities/pixel-grid/internal/reactive-effects`
  - `entities/pixel-grid/internal/breathing-system`
- Workspace package split:
  - `@pixel-engine/core`
  - `@pixel-engine/effects`
- Extended test coverage for internal systems and runtime paths.

### Changed
- `PixelGridEffect` now supports running with no masks (`imageMask` and `textMask` optional).
- Better fault tolerance in mask influences:
  - defensive guards around `getImageData`
  - safe handling for empty text masks
  - safe behavior for failed image loads
- Performance improvements:
  - fewer allocations in `InfluenceManager` removal paths
  - per-frame mask weight cache usage in reactive/breathing paths
  - in-place compaction for active ripples

### Removed
- Legacy/implicit config compatibility paths were removed from the stable surface:
  - old top-level hover/ripple fields
  - legacy reactive alias fields

### Notes
- `pixel-engine` package remains available as compatibility aggregate entrypoint.
- New scoped packages provide clearer boundaries for production integration.
