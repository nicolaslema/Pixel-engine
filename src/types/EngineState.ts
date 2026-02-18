export type QualityLevel =
  | "low"
  | "medium"
  | "high"
  | "auto";

export interface EngineState {
  width: number;
  height: number;

  time: {
    delta: number;
    elapsed: number;
  };

  pointer: {
    x: number;
    y: number;
    active: boolean;
  };

  performance: {
    fps: number;
  };

  quality: {
    level: QualityLevel;
  };
}
