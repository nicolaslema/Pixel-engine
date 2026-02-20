# Pixel Engine

High-performance, typed-array based 2D pixel simulation engine.

## Features

- TypedArray-based grid
- Double-buffered activation system
- Effect-driven architecture
- Renderer-agnostic
- Adaptive performance system
- Deterministic simulation loop

## Status

Early development – v0.1.0

## Current Architecture

- `core`: engine lifecycle, fixed-step game loop, time management.
- `scene`: entity graph with update/render passes.
- `renderers`: backend abstraction (`IRenderer`) + `Canvas2DRenderer` default implementation.
- `influences`: composable field modifiers (hover, ripple, noise, masks).
- `grid`: typed-array buffers for performance-oriented simulation paths.

## Development

- `npm run dev`: runs playground with Vite.
- `npm run test`: runs Vitest.
- `npm run build`: builds distributable library with `tsup` (ESM/CJS/types).
- `npm run build:playground`: builds playground app with Vite.

## Design Goals

- Stable core API for integration in React/Vue wrappers.
- Renderer-agnostic architecture to support future WebGL backend.
- Clear separation between engine runtime and visual effect modules.

## PixelGrid Reactive Hover

`PixelGridEffect` supports two hover modes:

- `classic`: additive radial influence.
- `reactive`: post-process interaction that can:
  - deactivate pixels (`reactiveHover.deactivate`)
  - displace pixels (`reactiveHover.displace`, `reactiveHover.jitter`)
  - recolor pixels (`reactiveHover.tintPalette`)
  - limit scope (`reactiveHover.interactionScope`: `"all" | "activeOnly" | "imageMask"`)
  - change hover shape (`reactiveHover.shape`: `"circle" | "vignette"`)

Additional controls:

- `hoverShape` / `hoverRadiusY`: shape + vertical radius for classic hover.
- `reactiveRipple`: make ripple pass apply reactive color/displacement/jitter/deactivation.
- `autoMorph.intervalMs`: extra wait between morph cycles.
- `imageMask` / `textMask`: set source text/image and their `centerX`/`centerY` positions in grid space.
