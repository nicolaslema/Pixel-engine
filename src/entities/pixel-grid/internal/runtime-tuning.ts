export interface PixelGridRuntimeTuning {
  compressionStrength: number;
  enableSmoothing: boolean;
  smoothingRadius: number;
}

export const DEFAULT_PIXEL_GRID_RUNTIME_TUNING: PixelGridRuntimeTuning = {
  compressionStrength: 2.5,
  enableSmoothing: true,
  smoothingRadius: 1
};
