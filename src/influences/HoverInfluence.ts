import { Influence, BlendMode } from "./Influence";
import { PixelEngine } from "../core/PixelEngine";
import { computeHoverFalloff, HoverShape } from "./HoverShape";

export interface HoverInfluenceOptions {
  radiusY?: number;
  shape?: HoverShape;
}

export class HoverInfluence implements Influence {
  priority = 5;
  blendMode: BlendMode = "add";
  private radiusY: number;
  private shape: HoverShape;

  constructor(
    private engine: PixelEngine,
    private radius: number,
    private breathSpeed: number,
    private strength: number,
    options: HoverInfluenceOptions = {}
  ) {
    this.radiusY = options.radiusY ?? radius;
    this.shape = options.shape ?? "circle";
  }

  update(_delta = 0): void {
    void _delta;
    void this.breathSpeed;
  }

  isAlive(): boolean {
    return true;
  }

  getBounds() {
    const { x, y } = this.engine.mouse;

    return {
      minX: x - this.radius,
      maxX: x + this.radius,
      minY: y - this.radiusY,
      maxY: y + this.radiusY
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

    const falloff = computeHoverFalloff(dx, dy, {
      radiusX: this.radius,
      radiusY: this.radiusY,
      shape: this.shape
    });

    if (falloff <= 0) return 0;

    return falloff * maxSize * this.strength;
  }
}
