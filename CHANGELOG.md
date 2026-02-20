# Changelog

All notable changes to this project are documented in this file.

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
