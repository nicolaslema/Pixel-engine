export type BlendMode =
  | "max"
  | "add"
  | "multiply"
  | "override";

export interface Influence {
  priority: number;
  blendMode: BlendMode;

  update(delta: number): void;   // ← IMPORTANTE
  isAlive(): boolean;

  getBounds(): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };

  getInfluence(
    x: number,
    y: number,
    maxSize: number
  ): number;
}
