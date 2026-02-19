import { Entity } from "../scene/Entity";
import { Renderer } from "../renderers/Renderer";
import { PixelCell } from "./PixelCell";
import { PixelEngine } from "../core/PixelEngine";

import { InfluenceManager } from "../influences/InfluenceManager";
import { RippleInfluence } from "../influences/RippleInfluence";
import { HoverInfluence } from "../influences/HoverInfluence";
import { OrganicNoiseInfluence } from "../influences/OrganicNoiseInfluence";
import { TextMaskInfluence } from "../influences/Masks/TextMaskInfluence";
import { ImageMaskInfluence } from "../influences/Masks/ImageMaskInfluence";
import { MorphMaskInfluence } from "../influences/Masks/MorphMaskInfluence";

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
  private columns: number;
  private rows: number;

  private influenceManager: InfluenceManager;
  private maxRipples: number;


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
    const cx = width / 2;
    const cy = height / 2;
    super();
    

    this.columns = Math.ceil(width / config.gap);
    this.rows = Math.ceil(height / config.gap);
    this.maxRipples = config.maxRipples ?? 20;

    this.createGrid();

this.influenceManager = new InfluenceManager(
  config.gap,
  this.columns,
  this.rows,
  {
    compressionStrength: 2.5,
    enableSmoothing: true,
    smoothingRadius: 1
  }
);

// this.influenceManager.add(
//   new ImageMaskInfluence(
//     "/src/assets/cat.png",
//     this.width / 2,
//     this.height / 2,
//     {
//       scale: 3,
//       strength: 1.9,
//       sampleMode: "threshold"
//     }
//   )
// );


const imageMask = new ImageMaskInfluence(
  "/src/assets/alberto_fernandez.jpg.webp",
  cx,
  cy,
  { scale: 1,
    sampleMode: "threshold",
    strength: 1.9,
   }
);

const textMask = new TextMaskInfluence(
  "Herza",
  this.width / 2,
  this.height / 2,
  {
    font: "bold 160px Arial",
    strength: 0.9,
    blurRadius: 2
  }
);

const morph = new MorphMaskInfluence(
  imageMask,
  textMask,
  {
    initialT: 1,
  }
);

morph.morphTo(1, 0.5);
    this.influenceManager.add(morph);
  

// this.influenceManager.add(textMask);

    this.setupInfluences();
  }
  

  private createGrid(): void {
    const { colors, gap } = this.config;
    
    for (let x = 0; x < this.columns; x++) {
      for (let y = 0; y < this.rows; y++) {
        const px = x * gap;
        const py = y * gap;
        
        const color =
        colors[Math.floor(Math.random() * colors.length)];
        
        this.cells.push(
          new PixelCell(px, py, color, gap, 1)
        );
      }
    }
  }
  
  private getCellIndex(x: number, y: number): number {
    return x * this.rows + y;
  }
  
  private setupInfluences(): void {
    if (this.influenceOptions.hover) {
      this.influenceManager.add(
        new HoverInfluence(
          this.engine,
          this.config.hoverRadius ?? 120,
          this.config.breathSpeed,
          1
        )
      );
    }
    
    if (this.influenceOptions.organic) {
      this.influenceManager.add(
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

  update(delta: number): void {
    // Reset targets
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].targetSize = 0;
    }

    // Update influences
    this.influenceManager.update(delta);

    // Apply influences
    this.influenceManager.apply(
      this.cells,
      this.getCellIndex.bind(this)
    );

    // Animate cells
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].update(
        this.config.expandEase,
        delta
      );
    }
  }

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

  triggerRipple(x: number, y: number): void {
    if (!this.influenceOptions.ripple) return;

    const maxRadius =
      Math.max(this.width, this.height) * 1.2;

    this.influenceManager.add(
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
