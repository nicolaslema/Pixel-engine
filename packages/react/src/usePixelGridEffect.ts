import { useEffect, useRef } from "react";
import { PixelGridEffect } from "@pixel-engine/effects";
import { usePixelEngine } from "./usePixelEngine";
import { UsePixelGridEffectOptions, UsePixelGridEffectResult } from "./types";

function toLocalCoords(canvas: HTMLCanvasElement, event: MouseEvent | PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    nativeEvent: event
  };
}

export function usePixelGridEffect(options: UsePixelGridEffectOptions): UsePixelGridEffectResult {
  const {
    width,
    height,
    gridWidth,
    gridHeight,
    gridConfig,
    influenceOptions,
    effectKey = "default",
    autoAttach = true,
    rippleTrigger = "click",
    onGridReady,
    onRipple,
    createGridEffect,
    ...engineOptions
  } = options;

  const { canvasRef, engine, isReady } = usePixelEngine({
    width,
    height,
    ...engineOptions
  });
  const gridRef = useRef<PixelGridEffect | null>(null);
  const onGridReadyRef = useRef(onGridReady);
  const onRippleRef = useRef(onRipple);
  const createGridEffectRef = useRef(createGridEffect);
  const gridConfigRef = useRef(gridConfig);
  const influenceOptionsRef = useRef(influenceOptions);

  useEffect(() => {
    onGridReadyRef.current = onGridReady;
    onRippleRef.current = onRipple;
    createGridEffectRef.current = createGridEffect;
    gridConfigRef.current = gridConfig;
    influenceOptionsRef.current = influenceOptions;
  }, [createGridEffect, gridConfig, influenceOptions, onGridReady, onRipple]);

  useEffect(() => {
    if (!engine) return;

    const effectWidth = Math.max(1, gridWidth ?? width);
    const effectHeight = Math.max(1, gridHeight ?? height);
    const effect = createGridEffectRef.current
      ? createGridEffectRef.current(
        engine,
        effectWidth,
        effectHeight,
        gridConfigRef.current,
        influenceOptionsRef.current
      )
      : new PixelGridEffect(
        engine,
        effectWidth,
        effectHeight,
        gridConfigRef.current,
        influenceOptionsRef.current
      );

    gridRef.current = effect;
    if (autoAttach) {
      engine.addEntity(effect);
    }
    onGridReadyRef.current?.(effect, engine);

    return () => {
      if (autoAttach) {
        engine.removeEntity(effect);
      }
      if (gridRef.current === effect) {
        gridRef.current = null;
      }
    };
  }, [autoAttach, effectKey, engine, gridHeight, gridWidth, height, width]);

  useEffect(() => {
    if (rippleTrigger === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleRipple = (event: MouseEvent | PointerEvent) => {
      const effect = gridRef.current;
      if (!effect) return;
      const payload = toLocalCoords(canvas, event);
      effect.triggerRipple(payload.x, payload.y);
      onRippleRef.current?.(payload);
    };

    if (rippleTrigger === "pointerdown") {
      canvas.addEventListener("pointerdown", handleRipple, { passive: true });
      return () => canvas.removeEventListener("pointerdown", handleRipple);
    }

    canvas.addEventListener("click", handleRipple, { passive: true });
    return () => canvas.removeEventListener("click", handleRipple);
  }, [canvasRef, isReady, rippleTrigger, effectKey]);

  return {
    canvasRef,
    engine,
    isReady,
    grid: gridRef.current
  };
}
