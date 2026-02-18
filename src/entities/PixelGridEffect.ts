import { Entity } from "../scene/Entity";
import { Renderer } from "../renderers/Renderer";
import { PixelCell } from "./PixelCell";
import { PixelEngine } from "../core/PixelEngine";

import { Influence } from "../influences/Influence";
import { RippleInfluence } from "../influences/RippleInfluence";
import { HoverInfluence } from "../influences/HoverInfluence";
import { OrganicNoiseInfluence } from "../influences/OrganicNoiseInfluence";

export interface PixelGridConfig {
  colors: string[];
  gap: number;
  expandEase: number;
  breathSpeed: number;

  rippleSpeed: number;
  rippleThickness: number;
  rippleStrength: number;

  hoverRadius?: number;
  organicRadius?: number;
  organicStrength?: number;
  organicSpeed?: number;

  maxRipples?: number;
}

export interface PixelGridInfluenceOptions {
  ripple?: boolean;
  hover?: boolean;
  organic?: boolean;
}

export class PixelGridEffect extends Entity {
  private cells: PixelCell[] = [];
  private influences: Influence[] = [];

  private columns: number;
  private rows: number;

  private readonly gap: number;
  private readonly maxRipples: number;

  constructor(
    private engine: PixelEngine,
    private width: number,
    private height: number,
    private config: PixelGridConfig,
    private influenceOptions: PixelGridInfluenceOptions = {
      ripple: true,
      hover: true,
      organic: false
    }
  ) {
    super();

    this.gap = config.gap;
    this.columns = Math.ceil(width / this.gap);
    this.rows = Math.ceil(height / this.gap);
    this.maxRipples = config.maxRipples ?? 20;

    this.createGrid();
    this.setupInfluences();
  }

  // =========================
  // GRID
  // =========================

  private createGrid(): void {
    const { colors } = this.config;

    for (let x = 0; x < this.columns; x++) {
      for (let y = 0; y < this.rows; y++) {
        const px = x * this.gap;
        const py = y * this.gap;

        const color =
          colors[Math.floor(Math.random() * colors.length)];

        this.cells.push(
          new PixelCell(px, py, color, this.gap, 1)
        );
      }
    }
  }

  private getCellIndex(x: number, y: number): number {
    return x * this.rows + y;
  }

  // =========================
  // INFLUENCES SETUP
  // =========================

  private setupInfluences(): void {
    const {
      hover,
      organic
    } = this.influenceOptions;

    if (hover) {
      this.influences.push(
        new HoverInfluence(
          this.engine,
          this.config.hoverRadius ?? 120,
          this.config.breathSpeed,
          1
        )
      );
    }

    if (organic) {
      this.influences.push(
        new OrganicNoiseInfluence(
          this.width * 0.5,
          this.height * 0.5,
          this.config.organicRadius ?? 150,
          this.config.organicStrength ?? 0.4,
          this.config.organicSpeed ?? 0.002
        )
      );
    }
  }

  // =========================
  // UPDATE
  // =========================

  update(delta: number): void {
    // Reset targets
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].targetSize = 0;
    }

    // Update influences
    for (let i = 0; i < this.influences.length; i++) {
      this.influences[i].update(delta);
    }

    this.influences =
      this.influences.filter(i => i.isAlive());

    // Apply influences
    for (let i = 0; i < this.influences.length; i++) {
      const influence = this.influences[i];
      const bounds = influence.getBounds();

      const minCol = Math.max(
        0,
        Math.floor(bounds.minX / this.gap)
      );
      const maxCol = Math.min(
        this.columns - 1,
        Math.floor(bounds.maxX / this.gap)
      );

      const minRow = Math.max(
        0,
        Math.floor(bounds.minY / this.gap)
      );
      const maxRow = Math.min(
        this.rows - 1,
        Math.floor(bounds.maxY / this.gap)
      );

      for (let x = minCol; x <= maxCol; x++) {
        for (let y = minRow; y <= maxRow; y++) {
          const cell =
            this.cells[this.getCellIndex(x, y)];

          const value =
            influence.getInfluence(
              cell.x,
              cell.y,
              cell.maxSize
            );

          if (value > cell.targetSize) {
            cell.targetSize = value;
          }
        }
      }
    }

    // Animate
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].update(
        this.config.expandEase,
        delta
      );
    }
  }

  // =========================
  // RENDER
  // =========================

  render(renderer: Renderer): void {
    const ctx = renderer.getContext();

    const batches = new Map<string, PixelCell[]>();

    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];

      if (cell.size <= 0.5) continue;

      if (!batches.has(cell.color)) {
        batches.set(cell.color, []);
      }

      batches.get(cell.color)!.push(cell);
    }

    batches.forEach((cells, color) => {
      ctx.fillStyle = color;

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];

        const offset =
          (cell.gap - cell.size) * 0.5;

        ctx.fillRect(
          (cell.x + offset) | 0,
          (cell.y + offset) | 0,
          cell.size | 0,
          cell.size | 0
        );
      }
    });
  }

  // =========================
  // EXTERNAL API
  // =========================

  triggerRipple(x: number, y: number): void {
    if (!this.influenceOptions.ripple) return;

    const maxRadius =
      Math.max(this.width, this.height) * 1.2;

    // limitar cantidad de ripples
    const rippleCount = this.influences.filter(
      i => i instanceof RippleInfluence
    ).length;

    if (rippleCount >= this.maxRipples) {
      this.influences = this.influences.filter(
        i => !(i instanceof RippleInfluence)
      ).slice(1);
    }

    this.influences.push(
      new RippleInfluence(
        x,
        y,
        this.config.rippleSpeed,
        this.config.rippleThickness,
        this.config.rippleStrength,
        maxRadius
      )
    );
  }
}
