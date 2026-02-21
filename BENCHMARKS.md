# Benchmarks

This file tracks reproducible baseline benchmarks for runtime-critical paths.

## PixelGrid baseline

Run:

```bash
npm run bench:pixelgrid
```

What it does:
- builds aggregate + split packages
- packs and installs local `@pixel-engine/core` + `@pixel-engine/effects` tarballs in a temporary benchmark app
- runs a synthetic PixelGrid scenario from installed packages
- reports:
  - average update time
  - average render time
  - average frame time
  - estimated FPS
  - heap delta

Notes:
- This is a comparative baseline, not an absolute cross-machine performance score.
- Use before/after outputs to evaluate Phase C optimizations.

## Baseline Snapshot (2026-02-21)

Scenario:
- Grid: `1000x700`
- Gap: `6`
- Estimated cells: `19539`
- Sampled frames: `240` (plus warmup)

Result:
- Avg update ms: `4.301`
- Avg render ms: `0.122`
- Avg frame ms: `4.422`
- Estimated FPS: `226.1`
- Heap delta MB: `1.304`

## Snapshot After PR-C3 (2026-02-21)

Result:
- Avg update ms: `4.258`
- Avg render ms: `0.121`
- Avg frame ms: `4.380`
- Estimated FPS: `228.3`
- Heap delta MB: `1.667`

Comparison vs baseline:
- Update: `-0.043 ms`
- Render: `-0.001 ms`
- Frame: `-0.042 ms`
- FPS: `+2.2`
