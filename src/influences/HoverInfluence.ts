import { Influence, BlendMode } from "./Influence";
import { smoothstep } from "../utils/math";
import { PixelEngine } from "../core/PixelEngine";

export class HoverInfluence implements Influence {
  priority = 5;
  blendMode: BlendMode = "add";

  constructor(
    private engine: PixelEngine,
    private radius: number,
    private breathSpeed: number,
    private strength: number
  ) {}

  update(): void {}

  isAlive(): boolean {
    return true;
  }

  getBounds() {
    const { x, y } = this.engine.mouse;

    return {
      minX: x - this.radius,
      maxX: x + this.radius,
      minY: y - this.radius,
      maxY: y + this.radius
    };
  }

  getInfluence(
    x: number,
    y: number,
    maxSize: number
  ): number {
    const { x: mx, y: my } = this.engine.mouse;

    const dx = x - mx;
    const dy = y - my;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.radius) return 0;

    const falloff =
      1 - smoothstep(0, this.radius, distance);

    return falloff * maxSize * this.strength;
  }
}
