export interface Influence {
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
