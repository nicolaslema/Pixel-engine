import type * as React from "react";
import type { PixelEngine, PixelEngineOptions, QualityLevel } from "@pixel-engine/core";
import type {
  PixelGridConfig,
  PixelGridEffect,
  PixelGridInfluenceOptions
} from "@pixel-engine/effects";

export type ResizeMode = "observer" | "window" | "none";
export type FitMode = "none" | "client";
export type RippleTriggerMode = "click" | "pointerdown" | "none";

export interface PixelPointerEventPayload {
  x: number;
  y: number;
  nativeEvent: MouseEvent | PointerEvent;
}

export interface UsePixelEngineOptions {
  width: number;
  height: number;
  autoStart?: boolean;
  quality?: QualityLevel;
  clearColor?: string | null;
  devicePixelRatio?: number;
  resizeMode?: ResizeMode;
  fitMode?: FitMode;
  onReady?: (engine: PixelEngine) => void;
  onDestroy?: (engine: PixelEngine) => void;
  onHoverStart?: (event: PixelPointerEventPayload) => void;
  onHoverEnd?: (event: PixelPointerEventPayload) => void;
  createEngine?: (options: PixelEngineOptions) => PixelEngine;
}

export interface UsePixelEngineResult {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  engine: PixelEngine | null;
  isReady: boolean;
}

export interface PixelCanvasProps extends UsePixelEngineOptions {
  className?: string;
  style?: React.CSSProperties;
}

export interface UsePixelGridEffectOptions extends UsePixelEngineOptions {
  gridConfig: PixelGridConfig;
  influenceOptions?: PixelGridInfluenceOptions;
  effectKey?: string | number;
  gridWidth?: number;
  gridHeight?: number;
  autoAttach?: boolean;
  rippleTrigger?: RippleTriggerMode;
  onGridReady?: (effect: PixelGridEffect, engine: PixelEngine) => void;
  onRipple?: (event: PixelPointerEventPayload) => void;
  createGridEffect?: (
    engine: PixelEngine,
    width: number,
    height: number,
    config: PixelGridConfig,
    influenceOptions?: PixelGridInfluenceOptions
  ) => PixelGridEffect;
}

export interface UsePixelGridEffectResult extends UsePixelEngineResult {
  grid: PixelGridEffect | null;
}

export interface PixelGridCanvasProps extends UsePixelGridEffectOptions {
  className?: string;
  style?: React.CSSProperties;
}
