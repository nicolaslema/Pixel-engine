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
