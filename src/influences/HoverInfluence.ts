import { Influence } from "./Influence";
import { PixelEngine } from "../core/PixelEngine";

export class HoverInfluence implements Influence {
  private hoverAmount = 0;
  private hoverTarget = 0;

  constructor(
    private engine: PixelEngine,
    private radius: number,
    private breathSpeed: number,
    private strength: number
  ) {}

  update(): void {
    const mouse = this.engine.getInput().getMouse();

    this.hoverTarget = mouse.x >= 0 ? 1 : 0;

    this.hoverAmount +=
      (this.hoverTarget - this.hoverAmount) * 0.08;
  }

  isAlive(): boolean {
    return true; // siempre viva
  }

  getBounds() {
    const mouse = this.engine.getInput().getMouse();

    return {
      minX: mouse.x - this.radius,
      maxX: mouse.x + this.radius,
      minY: mouse.y - this.radius,
      maxY: mouse.y + this.radius
    };
  }

  getInfluence(
    cellX: number,
    cellY: number,
    cellMaxSize: number
  ): number {
    if (this.hoverAmount <= 0.001) return 0;

    const mouse = this.engine.getInput().getMouse();

    const dx = cellX - mouse.x;
    const dy = cellY - mouse.y;

    const distSq = dx * dx + dy * dy;
    const radiusSq = this.radius * this.radius;

    if (distSq > radiusSq) return 0;

    const strength =
      1 - distSq / radiusSq;

    const time = performance.now() * 0.001 * this.breathSpeed;

    const breath =
      0.75 +
      (Math.sin(
        time +
          (cellX * 0.01 + cellY * 0.01)
      ) *
        0.5 +
        0.5) *
        0.25;

    return (
      cellMaxSize *
      strength *
      this.hoverAmount *
      this.strength *
      breath
    );
  }
}
