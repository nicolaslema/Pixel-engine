import { Influence } from "./Influence";

export class RippleInfluence implements Influence {
  private radius = 0;
  priority = 10;
  blendMode: "max" = "max";

  constructor(
    private x: number,
    private y: number,
    private speed: number,
    private thickness: number,
    private strength: number,
    private maxRadius: number
  ) {}

  update(): void {
    this.radius += this.speed;
  }

  isAlive(): boolean {
    return this.radius < this.maxRadius;
  }

  getBounds() {
    const bound = this.radius + this.thickness;

    return {
      minX: this.x - bound,
      maxX: this.x + bound,
      minY: this.y - bound,
      maxY: this.y + bound
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

    const minDist = this.radius - this.thickness;
    const maxDist = this.radius + this.thickness;

    if (dist < minDist || dist > maxDist) {
      return 0;
    }

    const influence =
      1 -
      Math.abs(dist - this.radius) /
        this.thickness;

    return cellMaxSize * influence * this.strength;
  }
}
