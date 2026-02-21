import { IRenderer } from "../renderers/IRenderer";

export type QualityLevel = "low" | "medium" | "high";

export interface PixelEngineRendererFactory {
  (canvas: HTMLCanvasElement): IRenderer;
}

export interface PixelEngineOptions {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  quality?: QualityLevel;
  clearColor?: string | null;
  devicePixelRatio?: number;
  rendererFactory?: PixelEngineRendererFactory;
}
