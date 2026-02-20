export interface EnginePointerState {
  x: number;
  y: number;
  inside: boolean;
  down: boolean;
}

export interface EnginePointerSource {
  mouse: EnginePointerState;
}
