import { Entity } from "../scene/Entity";
import { Renderer } from "../renderers/Renderer";
import { PixelCell } from "./PixelCell";
import { PixelEngine } from "../core/PixelEngine";

interface Ripple {
  x: number;
  y: number;
  radius: number;
}

export interface PixelGridConfig {
  colors: string[];
  gap: number;
  expandEase: number;
  breathSpeed: number;
  shimmerOpacityStrength: number;
  rippleSpeed: number;
  rippleThickness: number;
  rippleStrength: number;
}

export class PixelGridEffect extends Entity {
  private cells: PixelCell[] = [];
  private ripples: Ripple[] = [];

  private hoverAmount = 0;
  private hoverTarget = 0;

  constructor(
    private engine: PixelEngine,
    private width: number,
    private height: number,
    private config: PixelGridConfig
  ) {
    super();
    this.createGrid();
  }

  private createGrid(): void {
    const { gap, colors } = this.config;

    for (let x = 0; x < this.width; x += gap) {
      for (let y = 0; y < this.height; y += gap) {
        const color =
          colors[Math.floor(Math.random() * colors.length)];

        this.cells.push(
          new PixelCell(x, y, color, gap, 1)
        );
      }
    }
  }

  update(delta: number): void {
    const mouse = this.engine.getInput().getMouse();

    this.hoverTarget = mouse.x >= 0 ? 1 : 0;
    this.hoverAmount += (this.hoverTarget - this.hoverAmount) * 0.08;

    this.ripples.forEach(r => (r.radius += this.config.rippleSpeed));
    this.ripples = this.ripples.filter(
      r => r.radius < this.width * 1.5
    );

    this.cells.forEach(cell => {
      let activationStrength = 0;

      if (this.hoverAmount > 0) {
        const dist = Math.hypot(cell.x - mouse.x, cell.y - mouse.y);
        activationStrength +=
          Math.max(0, 1 - dist / 120) * this.hoverAmount;

        this.ripples.forEach(r => {
          const dist = Math.hypot(cell.x - r.x, cell.y - r.y);
          const deltaRipple = Math.abs(dist - r.radius);

          if (deltaRipple < this.config.rippleThickness) {
            activationStrength +=
              (1 - deltaRipple / this.config.rippleThickness) *
              this.config.rippleStrength *
              this.hoverAmount;
          }
        });
      }

      activationStrength = Math.min(activationStrength, 1);

      if (activationStrength > 0) {
        cell.minSize = cell.maxSize * 0.6;
        const breathe = (Math.sin(cell.phase) + 1) / 2;

        cell.targetSize =
          cell.minSize +
          breathe * (cell.maxSize - cell.minSize);
      } else {
        cell.targetSize = 0;
      }

      cell.update(
        this.config.expandEase,
        this.config.breathSpeed,
        delta
      );
    });
  }

  render(renderer: Renderer): void {
    const ctx = renderer.getContext();

    this.cells.forEach(cell => {
      if (cell.size <= 0) return;

      const offset = (cell.gap - cell.size) * 0.5;

      const x = Math.round(cell.x + offset);
      const y = Math.round(cell.y + offset);
      const size = Math.round(cell.size);

      const shimmer = 0.5 + Math.sin(cell.phase) * 0.5;

      const alpha =
        1 -
        this.config.shimmerOpacityStrength +
        shimmer * this.config.shimmerOpacityStrength;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = cell.color;
      ctx.fillRect(x, y, size, size);
      ctx.globalAlpha = 1;
    });
  }

  triggerRipple(x: number, y: number): void {
    this.ripples.push({ x, y, radius: 0 });
  }
}
