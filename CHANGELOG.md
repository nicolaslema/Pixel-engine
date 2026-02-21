# Changelog

All notable changes to this project are documented in this file.

## [1.0.7] - 2026-02-21

### Added
- Documentation examples expanded for React integration:
  - `PixelCanvas`
  - `PixelGridCanvas`
  - `PixelSurface`
- External React consumer validation documented (Vite + TypeScript, local package install, positive result).

### Changed
- `PixelCard` and `PixelSurface` overlay behavior:
  - default `overlayPointerEvents` is now `none` to avoid blocking hover/ripple interactions on canvas.
  - can be overridden with `overlayPointerEvents=\"auto\"` when overlay UI must be interactive.

## [1.0.6] - 2026-02-21

### Added
- Completed PR-D3 for Phase D React product layer.
- `PixelCard` now supports declarative grid mode through `gridConfig` (5-15 line integration path).
- React DX hardening for declarative grid:
  - new `effectKey` option in `usePixelGridEffect` / `PixelGridCanvas`.
- New tests for:
  - `PixelCard` engine/grid modes
  - `usePixelGridEffect` recreation behavior controlled by `effectKey`

### Changed
- React docs/examples updated with final Phase D copy-paste usage (`PixelCard`, `PixelGridCanvas`, callbacks).
- Local roadmap/issue tracking updated to mark Phase D completed.

## [1.0.5] - 2026-02-21

### Added
- Completed PR-D2 for Phase D React product layer.
- New declarative React integration:
  - `usePixelGridEffect`
  - `PixelGridCanvas`
- New high-level callbacks in React layer:
  - `onHoverStart`
  - `onHoverEnd`
  - `onRipple`
- Initial React tests for declarative grid integration and interaction callbacks.

### Changed
- React docs and migration guidance updated to include PR-D2 APIs.
- Roadmap and local issue templates synchronized to mark PR-D2 completed and PR-D3 as next step.

## [1.0.4] - 2026-02-21

### Added
- Started Phase D (React product layer) with PR-D1.
- New workspace package `@pixel-engine/react` with:
  - `usePixelEngine` SSR-safe lifecycle hook (init, resize, cleanup).
  - `PixelCanvas`, `PixelSurface`, and `PixelCard` components.
  - Initial React unit tests for hook/components.

### Changed
- Root workspace scripts now include React package build/pack:
  - `build:packages` includes `@pixel-engine/react`
  - `pack:dry` includes `@pixel-engine/react`
- Release workflow updated to publish in order:
  - `@pixel-engine/core` -> `@pixel-engine/effects` -> `@pixel-engine/react` -> `pixel-engine`.
- Roadmap and phase issue tracking updated to mark PR-D1 as completed and Phase D as in progress.

## [1.0.3] - 2026-02-21

### Changed
- Completed Phase B API contract cleanup:
  - aggregate package (`pixel-engine`) now re-exports from `@pixel-engine/core` and `@pixel-engine/effects`.
  - removed legacy/unused type files under `src/types/*`.
  - removed empty placeholders:
    - `src/effects/PixelEffect.ts`
    - `src/grid/SpatialHash.ts`
    - `packages/core/src/grid/SpatialHash.ts`
- Completed Phase C runtime optimization and maintainability pass:
  - `InfluenceManager` smoothing now reuses a persistent buffer (no per-frame smoothing allocation).
  - `PixelGridEffect` mask cache recomputation is now conditional (only when needed by runtime features).
  - `PixelGridEffect` internals were further modularized with extracted update/render/influence setup runtime modules.
- Added reproducible benchmark flow:
  - `npm run bench:pixelgrid`
  - baseline + post-refactor snapshots documented in `BENCHMARKS.md`.

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
