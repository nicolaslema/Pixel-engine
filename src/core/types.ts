export type QualityLevel = "low" | "medium" | "high";

export interface PixelEngineOptions {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  quality?: QualityLevel;
}