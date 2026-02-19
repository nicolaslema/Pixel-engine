import { Influence, BlendMode } from "./Influence";
import { clamp } from "../utils/math";

export class RippleInfluence implements Influence {
  priority = 10;
  blendMode: BlendMode = "max";

  private radius = 0;

  constructor(
    private originX: number,
    private originY: number,
    private speed: number,
    private thickness: number,
    private strength: number,
    private maxRadius: number
  ) {}

  update(delta: number): void {
    this.radius += this.speed * delta;
  }

  isAlive(): boolean {
    return this.radius < this.maxRadius;
  }

  getBounds() {
    return {
      minX: this.originX - this.radius - this.thickness,
      maxX: this.originX + this.radius + this.thickness,
      minY: this.originY - this.radius - this.thickness,
      maxY: this.originY + this.radius + this.thickness
    };
  }

  getInfluence(
    x: number,
    y: number,
    maxSize: number
  ): number {
    const dx = x - this.originX;
    const dy = y - this.originY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    const diff = Math.abs(distance - this.radius);

    if (diff > this.thickness) return 0;

    // Perfil de campana suave
    const normalized = 1 - diff / this.thickness;

    // curva cuadrática suave
    const falloff = normalized * normalized;

    return falloff * maxSize * this.strength;
  }
}
