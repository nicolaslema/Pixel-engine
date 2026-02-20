# Pixel Engine - Project Summary + TODO Audit

Last updated: 2026-02-20  
Scope: full repository audit (`src/`, `packages/`, docs/build/test surface)

## 1) Executive Summary

Pixel Engine is currently at a **stable v1 baseline** for:
- Core runtime (`PixelEngine`, scene, loop, renderer abstraction)
- Effects runtime (`PixelGridEffect`, influences, masks, morph, reactive systems)
- Local package split (`@pixel-engine/core`, `@pixel-engine/effects`)

Current status is good for iterative development, but still not production-grade in packaging/release architecture.  
Main gaps are:
- package split is still partially coupled to root `src/`
- publish pipeline/metadata is incomplete
- some legacy/placeholder files remain
- docs/examples have a few inconsistencies
- no CI quality gates yet

## 2) Architecture Snapshot (for humans and other AI agents)

### 2.1 Runtime layers
- `src/core/*`: engine lifecycle, time, loop, renderer setup
- `src/scene/*`: entities and scene traversal
- `src/renderers/*`: renderer abstraction and Canvas2D implementation
- `src/influences/*`: influence primitives + masks
- `src/entities/PixelGridEffect.ts`: high-level effect orchestrator
- `src/entities/pixel-grid/internal/*`: internal effect subsystems
  - `runtime-state`
  - `mask-state-machine`
  - `reactive-effects`
  - `breathing-system`

### 2.2 Package split
- Root package: `pixel-engine` (aggregate compatibility package)
- Workspace packages:
  - `packages/core` -> `@pixel-engine/core`
  - `packages/effects` -> `@pixel-engine/effects`

### 2.3 Test surface
- 16 test files, 31 tests passing
- Unit-level coverage for core components and new internal pixel-grid modules

## 3) Current Strengths

- Strict `PixelGridConfig` structure (`hoverEffects`, `rippleEffects`, `breathing`, masks, morph).
- Better fault tolerance in mask processing (`getImageData` guards, blank text handling).
- Reduced per-frame allocations in `InfluenceManager`.
- Internal modularization of `PixelGridEffect` improved maintainability.
- Build and package builds succeed:
  - root aggregate build
  - `@pixel-engine/core` build
  - `@pixel-engine/effects` build

## 4) Problems Found (TODOs)

Each item includes severity and rationale.

### P0 - Blockers for professional publish/reuse

- TODO[P0-001]: **True package decoupling is incomplete**  
  File(s): `packages/core/src/index.ts`, `packages/effects/src/index.ts`  
  Problem: both packages re-export from `../../../src/...` (root source).  
  Impact: package boundaries are conceptual, not physical; increases risk of duplicated bundles, hidden coupling, and fragile release behavior.

- TODO[P0-002]: **Effects package does not import from core package**  
  File(s): `packages/effects/src/index.ts`  
  Problem: `@pixel-engine/effects` depends on `@pixel-engine/core` but does not actually consume it in source; still pulls from root source paths.  
  Impact: split is not enforcing dependency direction.

- TODO[P0-003]: **Workspace publishing strategy undefined**  
  File(s): root `package.json`, package manifests  
  Problem: no formal release workflow for publishing root + scoped packages; `private`/workspaces/publish ordering not documented in release scripts.  
  Impact: high risk of accidental broken publish.

### P1 - High priority quality/scalability

- TODO[P1-001]: **README/API import inconsistency**  
  File(s): `README.md`, `API.md`  
  Problem: some examples still mix aggregate import (`pixel-engine`) with split-package narrative.  
  Impact: onboarding confusion and integration errors.

- TODO[P1-002]: **Example still includes `/src/assets/...` path in API docs**  
  File(s): `API.md` (custom image/text example)  
  Problem: one example uses repo-local-style path; app consumers should use bundled URL imports.  
  Impact: common runtime error in external apps.

- TODO[P1-003]: **Unused/placeholder files still present in main source tree**  
  File(s): `src/effects/PixelEffect.ts`, `src/grid/SpatialHash.ts` (empty)  
  Impact: signals incomplete architecture and confuses contributors.

- TODO[P1-004]: **Legacy types namespace overlap**  
  File(s): `src/types/Options.ts`, `src/types/EngineState.ts`, `src/core/types.ts`  
  Problem: duplicated/overlapping type domains and unclear ownership.  
  Impact: maintainability and API clarity degradation.

- TODO[P1-005]: **No CI quality gates configured**  
  Problem: no automated gate for `test`, `build`, and future type/lint/coverage checks on PR.  
  Impact: regression risk increases as codebase grows.

### P2 - Performance/maintainability improvements

- TODO[P2-001]: **Influence smoothing allocates temp buffer each call**  
  File(s): `src/influences/InfluenceManager.ts`  
  Problem: `new Float32Array(cells.length)` inside smoothing path each apply.  
  Impact: avoidable allocations in hot path.

- TODO[P2-002]: **Mask weight cache recomputed full-grid each frame**  
  File(s): `src/entities/PixelGridEffect.ts`  
  Problem: full pass recomputation even when mask-related influences inactive/static.  
  Impact: extra O(n) work per frame.

- TODO[P2-003]: **`PixelGridEffect` still large orchestration class**  
  File(s): `src/entities/PixelGridEffect.ts`  
  Problem: improved, but still centralizes lifecycle + rendering + wiring.  
  Impact: readability okay now, but long-term change risk remains.

- TODO[P2-004]: **PerformanceMonitor/Scheduler unused in runtime path**  
  File(s): `src/core/PerformanceMonitor.ts`, `src/core/Scheduler.ts`  
  Impact: architectural drift and unclear future direction.

### P3 - Product polish / visual systems roadmap

- TODO[P3-001]: **No standardized effect preset system**  
  Problem: users configure large option objects manually.  
  Impact: difficult authoring and inconsistent visuals.

- TODO[P3-002]: **No deterministic seed control for visual randomness**  
  Problem: randomness uses `Math.random` and derived noise; no reproducible seed API.  
  Impact: hard to reproduce effects across sessions/tests.

- TODO[P3-003]: **No performance-tier adaptive presets yet**  
  Problem: no built-in scaling of smoothing/ripple limits/effect density by FPS/device class.  
  Impact: inconsistent UX on low-end devices.

## 5) Prioritized Professionalization Plan

### Phase A (P0) - Publish-ready architecture
1. TODO[P0-001], TODO[P0-002]: move package source ownership to `packages/*/src` for real split.
2. TODO[P0-003]: define release workflow:
   - versioning strategy (changesets/semantic-release/manual)
   - publish order (`core` -> `effects` -> aggregate)
   - tag/channel strategy (`latest`, `next`).

### Phase B (P1) - Contract and docs correctness
1. TODO[P1-001], TODO[P1-002]: normalize docs/examples to split packages + correct asset handling.
2. TODO[P1-003], TODO[P1-004]: remove/relocate placeholders and consolidate type ownership.
3. TODO[P1-005]: add CI checks:
   - `npm test`
   - `npm run build`
   - package builds
   - (recommended) lint/typecheck/coverage threshold.

### Phase C (P2) - Runtime optimization
1. TODO[P2-001]: persistent smoothing buffers in `InfluenceManager`.
2. TODO[P2-002]: smart cache invalidation for mask weights (only recompute when needed).
3. TODO[P2-003]: extract renderer-facing grid draw pass into internal render module.
4. TODO[P2-004]: either integrate or remove dormant core modules.

### Phase D (P3) - Visual/effect product layer
1. TODO[P3-001]: preset registry (`subtle`, `interactive`, `hero`, etc.).
2. TODO[P3-002]: seedable RNG pipeline for deterministic visuals.
3. TODO[P3-003]: adaptive quality manager tied to FPS budget.

## 6) npm Publishing Readiness Checklist (Recommended)

- [ ] Add package metadata:
  - `repository`, `bugs`, `homepage`, `keywords`, `engines`, `funding` (if applicable)
- [ ] Add `prepublishOnly` checks for each publishable package
- [ ] Ensure no internal-only files leak in package tarballs
- [ ] Add smoke tests consuming published tarballs in sample React app
- [ ] Add changelog/version policy automation

## 7) Suggested Near-term Milestone (v1.1.0)

Definition of done:
- Real package boundary (no `../../../src` in package entrypoints)
- CI pipeline active
- docs/examples fully consistent with split imports
- no empty placeholder files in shipping tree
- at least one benchmark scenario tracked over time (frame budget + memory)

## 8) Context Notes for Other AI Agents

- The project intentionally keeps an aggregate package for compatibility (`pixel-engine`), while migrating toward split packages.
- `PixelGridEffect` is the main high-level effect and now depends on internal helper modules under `entities/pixel-grid/internal`.
- Current tests are unit-focused and mostly jsdom-based with mocked canvas contexts where required.
- Most immediate architectural risk is not runtime correctness, but package boundary correctness for long-term publishing and consumer stability.
