export type BlendMode =
  | "max"
  | "add"
  | "override"
  | "multiply";

export interface Influence {
  priority: number;
  blendMode: BlendMode;

  update(delta: number): void;

  getBounds(): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };

  getInfluence(
    cellX: number,
    cellY: number,
    cellMaxSize: number
  ): number;

  isAlive(): boolean;
}
