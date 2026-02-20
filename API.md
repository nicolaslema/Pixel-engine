# Pixel Engine API

This document describes the stable v1 API baseline for `PixelGridEffect`.

## Stable Surface

`PixelGridConfig` is strict and centered on:
- `hoverEffects`
- `rippleEffects`
- `breathing`
- `imageMask` / `textMask`
- `autoMorph`
- `canvasBackground`

Legacy top-level fields were removed (e.g. `hoverMode`, `rippleSpeed`).

## Quick Start

```ts
import { PixelEngine } from "@pixel-engine/core";
import { PixelGridEffect } from "@pixel-engine/effects";

const canvas = document.getElementById("app") as HTMLCanvasElement;

const engine = new PixelEngine({
  canvas,
  width: 1000,
  height: 700
});

const grid = new PixelGridEffect(engine, 1000, 700, {
  colors: ["#334155", "#475569", "#64748b"],
  gap: 6,
  expandEase: 0.08,
  breathSpeed: 0.9,
  hoverEffects: {
    mode: "classic",
    radius: 120,
    shape: "circle"
  },
  rippleEffects: {
    speed: 0.5,
    thickness: 48,
    strength: 28,
    maxRipples: 20
  }
});

engine.addEntity(grid);
engine.start();
```

## PixelEngine Background Control

- `clearColor?: string | null` in `PixelEngine` options.
- Use CSS colors for solid background (`"#111827"`, `"rgba(...)"`).
- Use `"transparent"` or `null` for true transparent clear (`clearRect`).
- For `PixelGridEffect` usage, prefer `canvasBackground` in effect config.

Runtime:

```ts
engine.setClearColor("#0f172a");
engine.setClearColor("transparent");
engine.setClearColor(null);
```

## PixelGridConfig

Core:
- `colors: string[]`
- `gap: number`
- `expandEase: number`
- `breathSpeed: number`
- `canvasBackground?: string | null` (applies engine clear color from `PixelGridEffect` config)

Ripple:
- `rippleEffects?:`
- `speed?: number`
- `thickness?: number`
- `strength?: number`
- `maxRipples?: number`
- `enabled?: boolean`
- `deactivateMultiplier?: number`
- `displaceMultiplier?: number`
- `jitterMultiplier?: number`
- `tintPalette?: string[]`

Hover:
- `hoverEffects?:`
- `mode?: "classic" | "reactive"`
- `radius?: number`
- `radiusY?: number`
- `shape?: "circle" | "vignette"`
- `strength?: number`
- `interactionScope?: "all" | "activeOnly" | "imageMask"`
- `deactivate?: number`
- `displace?: number`
- `jitter?: number`
- `tintPalette?: string[]`

Breathing (opacity):
- `breathing?:`
- `enabled?: boolean`
- `speed?: number`
- `radius?: number`
- `radiusY?: number`
- `shape?: "circle" | "vignette"`
- `strength?: number`
- `minOpacity?: number`
- `maxOpacity?: number`
- `affectHover?: boolean`
- `affectImage?: boolean`
- `affectText?: boolean`

Mask sources and placement:
- `initialMask?: "image" | "text"`
- `imageMask?: { src?, centerX?, centerY?, scale?, sampleMode?, strength?, threshold?, blurRadius?, dithering? }`
- `textMask?: { text?, centerX?, centerY?, font?, strength?, blurRadius? }`

Masks are optional. If neither `imageMask` nor `textMask` is provided, `PixelGridEffect` runs with hover/ripple/organic effects only.

Morph:
- `autoMorph?:`
- `enabled?: boolean`
- `holdImageMs?: number`
- `holdTextMs?: number`
- `morphDurationMs?: number`
- `intervalMs?: number`

## Defaults

- `hoverEffects.mode`: `"classic"`
- `hoverEffects.radius`: `120`
- `hoverEffects.shape`: `"circle"`
- `rippleEffects.speed`: `0.5`
- `rippleEffects.thickness`: `50`
- `rippleEffects.strength`: `30`
- `rippleEffects.maxRipples`: `20`
- `breathing.enabled`: `false`

## Example: Reactive Hover + Breathing

```ts
const grid = new PixelGridEffect(engine, 1000, 700, {
  colors: ["#0f172a", "#1e293b", "#334155"],
  gap: 6,
  expandEase: 0.08,
  breathSpeed: 0.9,
  hoverEffects: {
    mode: "reactive",
    radius: 120,
    radiusY: 90,
    shape: "vignette",
    interactionScope: "imageMask",
    deactivate: 0.8,
    displace: 4,
    jitter: 1.2,
    tintPalette: ["#60a5fa", "#f59e0b", "#f43f5e"]
  },
  breathing: {
    enabled: true,
    speed: 1.4,
    radius: 140,
    radiusY: 100,
    shape: "vignette",
    strength: 0.9,
    minOpacity: 0.45,
    maxOpacity: 1,
    affectHover: true,
    affectImage: true,
    affectText: true
  }
});
```

## Example: Ripple With Displace/Jitter/Palette

```ts
const grid = new PixelGridEffect(engine, 1000, 700, {
  colors: ["#334155", "#475569", "#64748b"],
  gap: 7,
  expandEase: 0.08,
  breathSpeed: 0.9,
  rippleEffects: {
    speed: 0.5,
    thickness: 52,
    strength: 30,
    maxRipples: 50,
    enabled: true,
    deactivateMultiplier: 0.7,
    displaceMultiplier: 1.25,
    jitterMultiplier: 1.2,
    tintPalette: ["#22d3ee", "#fb7185", "#fde047"]
  }
});
```

## Example: Custom Image/Text + Morph Interval

```ts
const grid = new PixelGridEffect(engine, 1000, 700, {
  colors: ["#334155", "#475569", "#64748b"],
  gap: 7,
  expandEase: 0.08,
  breathSpeed: 0.9,
  rippleEffects: {
    speed: 0.5,
    thickness: 50,
    strength: 30
  },
  initialMask: "image",
  imageMask: {
    src: "/src/assets/cat.png",
    centerX: 500,
    centerY: 320,
    scale: 3,
    sampleMode: "invert",
    strength: 1.4
  },
  textMask: {
    text: "HERZA",
    centerX: 500,
    centerY: 340,
    font: "bold 140px Arial",
    strength: 0.9,
    blurRadius: 2
  },
  autoMorph: {
    enabled: true,
    holdImageMs: 1200,
    holdTextMs: 1200,
    morphDurationMs: 900,
    intervalMs: 450
  }
});
```

## Click Ripple Trigger

```ts
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  grid.triggerRipple(e.clientX - rect.left, e.clientY - rect.top);
});
```

## Canvas Background From PixelGridEffect

```ts
const grid = new PixelGridEffect(engine, width, height, {
  colors: ["#334155", "#475569", "#64748b"],
  gap: 6,
  expandEase: 0.08,
  breathSpeed: 0.9,
  canvasBackground: "transparent" // or "#0f172a", null
});

grid.setCanvasBackground("#111827");
grid.setCanvasBackground(null);
```

`canvasBackground` in config is applied at effect construction time.

## React Wrapper Pattern

```tsx
import { useEffect, useRef } from "react";
import { PixelEngine } from "@pixel-engine/core";
import { PixelGridEffect } from "@pixel-engine/effects";
import catPngUrl from "./assets/cat.png";

export function PixelGridCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const width = 1000;
    const height = 700;
    const engine = new PixelEngine({ canvas, width, height });
    const grid = new PixelGridEffect(engine, width, height, {
      colors: ["#334155", "#475569", "#64748b"],
      gap: 6,
      expandEase: 0.08,
      breathSpeed: 1,
      hoverEffects: { mode: "reactive", radius: 110, shape: "vignette" },
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

    return () => engine.destroy();
  }, []);

  return <canvas ref={ref} />;
}
```

Note: in React/Vite/Next projects, prefer `import imageUrl from "./file.png"` and pass that URL. Avoid `"/src/..."`

## Vue Wrapper Pattern

```ts
import { onMounted, onBeforeUnmount, ref } from "vue";
import { PixelEngine } from "@pixel-engine/core";
import { PixelGridEffect } from "@pixel-engine/effects";

const canvasRef = ref<HTMLCanvasElement | null>(null);
let engine: PixelEngine | null = null;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  engine = new PixelEngine({ canvas, width: 1000, height: 700 });
  const grid = new PixelGridEffect(engine, 1000, 700, {
    colors: ["#334155", "#475569", "#64748b"],
    gap: 6,
    expandEase: 0.08,
    breathSpeed: 1,
    hoverEffects: { mode: "reactive", radius: 110, shape: "circle" },
    rippleEffects: { speed: 0.5, thickness: 48, strength: 28, maxRipples: 25 }
  });

  engine.addEntity(grid);
  engine.start();
});

onBeforeUnmount(() => {
  engine?.destroy();
  engine = null;
});
```
