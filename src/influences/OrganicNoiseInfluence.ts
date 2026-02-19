import { Influence, BlendMode } from "./Influence";
import { smoothstep } from "../utils/math";

export class OrganicNoiseInfluence implements Influence {
  priority = 1;
  blendMode: BlendMode = "add";

  private time = 0;

  constructor(
    private centerX: number,
    private centerY: number,
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
      minX: this.centerX - this.radius,
      maxX: this.centerX + this.radius,
      minY: this.centerY - this.radius,
      maxY: this.centerY + this.radius
    };
  }

  private noise(x: number, y: number): number {
    const n =
      Math.sin(x * 0.03 + this.time) *
      Math.cos(y * 0.04 - this.time * 0.7) +
      Math.sin((x + y) * 0.02 + this.time * 0.5);

    return 0.5 + 0.5 * (n / 2);
  }

  getInfluence(
    x: number,
    y: number,
    maxSize: number
  ): number {
    const dx = x - this.centerX;
    const dy = y - this.centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.radius) return 0;

    const radial =
      1 - smoothstep(0, this.radius, distance);

    const noiseValue = this.noise(x, y);

    return (
      radial *
      noiseValue *
      maxSize *
      this.strength
    );
  }
}
