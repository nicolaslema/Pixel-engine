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
  clearColor?: string;
  devicePixelRatio?: number;
  rendererFactory?: PixelEngineRendererFactory;
}
