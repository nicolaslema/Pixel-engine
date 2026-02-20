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

## Install

```bash
npm install pixel-engine
```

## Quick Usage

```ts
import { PixelEngine, PixelGridEffect } from "pixel-engine";

const canvas = document.getElementById("app") as HTMLCanvasElement;

const engine = new PixelEngine({ canvas, width: 1000, height: 700 });

const grid = new PixelGridEffect(engine, 1000, 700, {
  colors: ["#334155", "#475569", "#64748b"],
  gap: 6,
  expandEase: 0.08,
  breathSpeed: 0.9,
  hoverEffects: { mode: "reactive", radius: 120, shape: "vignette" },
  rippleEffects: { speed: 0.5, thickness: 48, strength: 28, maxRipples: 30 }
});

engine.addEntity(grid);
engine.start();
```

## React Example

```tsx
import { useEffect, useRef } from "react";
import { PixelEngine, PixelGridEffect } from "pixel-engine";
import catPngUrl from "./assets/cat.png";

export function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = 1000;
    const height = 700;
    const engine = new PixelEngine({ canvas, width, height });
    const grid = new PixelGridEffect(engine, width, height, {
      colors: ["#334155", "#475569", "#64748b"],
      gap: 6,
      expandEase: 0.08,
      breathSpeed: 1,
      hoverEffects: { mode: "reactive", radius: 110, shape: "circle" },
      rippleEffects: { speed: 0.5, thickness: 50, strength: 30, maxRipples: 25 },
      imageMask: {
        src: catPngUrl,
        centerX: width * 0.5,
        centerY: height * 0.5,
        scale: 2,
        sampleMode: "threshold"
      }
    });

    engine.addEntity(grid);
    engine.start();

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      grid.triggerRipple(e.clientX - rect.left, e.clientY - rect.top);
    };
    canvas.addEventListener("click", onClick);

    return () => {
      canvas.removeEventListener("click", onClick);
      engine.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} />;
}
```

Use bundled asset URLs (`import img from "./asset.png"`). Do not use `"/src/..."` paths in app projects.
`imageMask` and `textMask` are optional; you can run the effect with no masks.

## Architecture

- `core`: engine lifecycle, loop, timing
- `scene`: entities + update/render traversal
- `renderers`: abstraction + Canvas2D implementation
- `influences`: reusable influence primitives
- `entities`: high-level effects (`PixelGridEffect`)

## Scripts

- `npm run dev`: runs playground with Vite.
- `npm run test`: runs Vitest.
- `npm run build`: builds distributable library with `tsup` (ESM/CJS/types).
- `npm run build:playground`: builds playground app with Vite.
- API reference and examples: `API.md`
