import { Influence } from "./Influence";

export class OrganicNoiseInfluence implements Influence {
  private time = 0;

  constructor(
    private x: number,
    private y: number,
    private radius: number,
    private strength: number,
    private speed: number
  ) {}

  update(delta: number): void {
    this.time += delta * this.speed;
  }

  isAlive(): boolean {
    return true;
  }

  getBounds() {
    return {
      minX: this.x - this.radius,
      maxX: this.x + this.radius,
      minY: this.y - this.radius,
      maxY: this.y + this.radius
    };
  }

  getInfluence(
    cellX: number,
    cellY: number,
    cellMaxSize: number
  ): number {
    const dx = cellX - this.x;
    const dy = cellY - this.y;

    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > this.radius) return 0;

    // Campo orgánico basado en seno compuesto
    const noise =
      Math.sin(dx * 0.05 + this.time) *
      Math.cos(dy * 0.05 - this.time);

    const falloff =
      1 - dist / this.radius;

    const organic =
      (noise * 0.5 + 0.5) * falloff;

    return cellMaxSize * organic * this.strength;
  }
}
