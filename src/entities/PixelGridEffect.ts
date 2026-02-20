import { Entity } from "../scene/Entity";
import { IRenderer } from "../renderers/IRenderer";
import { PixelCell } from "./PixelCell";
import { PixelEngine } from "../core/PixelEngine";

import { InfluenceManager } from "../influences/InfluenceManager";
import { RippleInfluence } from "../influences/RippleInfluence";
import { HoverInfluence } from "../influences/HoverInfluence";
import { OrganicNoiseInfluence } from "../influences/OrganicNoiseInfluence";
import { TextMaskInfluence, TextMaskOptions } from "../influences/Masks/TextMaskInfluence";
import { ImageMaskInfluence, ImageMaskOptions } from "../influences/Masks/ImageMaskInfluence";
import { MorphMaskInfluence } from "../influences/Masks/MorphMaskInfluence";
import { computeHoverFalloff, HoverShape } from "../influences/HoverShape";

type HoverMode = "classic" | "reactive";
type ReactiveHoverScope = "all" | "activeOnly" | "imageMask";
type MorphState = "image" | "toText" | "text" | "toImage";
type InitialMask = "image" | "text";

interface ReactiveHoverOptions {
  radius?: number;
  radiusY?: number;
  shape?: HoverShape;
  strength?: number;
  interactionScope?: ReactiveHoverScope;
  deactivate?: number;
  displace?: number;
  jitter?: number;
  tintPalette?: string[];
}

interface ReactiveRippleOptions {
  enabled?: boolean;
  deactivateMultiplier?: number;
  displaceMultiplier?: number;
  jitterMultiplier?: number;
  tintPalette?: string[];
}

interface AutoMorphOptions {
  enabled?: boolean;
  holdImageMs?: number;
  holdTextMs?: number;
  morphDurationMs?: number;
  intervalMs?: number;
}

interface PixelGridTextMaskConfig extends TextMaskOptions {
  text?: string;
  centerX?: number;
  centerY?: number;
}

interface PixelGridImageMaskConfig extends ImageMaskOptions {
  src?: string;
  centerX?: number;
  centerY?: number;
}

export interface PixelGridConfig {
  colors: string[];
  gap: number;
  expandEase: number;
  breathSpeed: number;

  rippleSpeed: number;
  rippleThickness: number;
  rippleStrength: number;

  hoverRadius?: number;
  hoverRadiusY?: number;
  hoverShape?: HoverShape;

  organicRadius?: number;
  organicStrength?: number;
  organicSpeed?: number;

  maxRipples?: number;
  hoverMode?: HoverMode;
  reactiveHover?: ReactiveHoverOptions;
  reactiveRipple?: ReactiveRippleOptions;
  autoMorph?: AutoMorphOptions;

  imageMask?: PixelGridImageMaskConfig;
  textMask?: PixelGridTextMaskConfig;
  initialMask?: InitialMask;
}

export interface PixelGridInfluenceOptions {
  ripple?: boolean;
  hover?: boolean;
  organic?: boolean;
}

export class PixelGridEffect extends Entity {
  private cells: PixelCell[] = [];
  private activeRipples: RippleInfluence[] = [];

  private columns: number;
  private rows: number;

  private influenceManager: InfluenceManager;
  private maxRipples: number;
  private reactiveTime = 0;

  private readonly reactiveHover: Required<ReactiveHoverOptions>;
  private readonly reactiveRipple: Required<ReactiveRippleOptions>;
  private readonly autoMorph: Required<AutoMorphOptions>;

  private imageMask: ImageMaskInfluence;
  private textMask: TextMaskInfluence;
  private morphMask: MorphMaskInfluence | null = null;
  private morphState: MorphState;
  private stateTimer = 0;

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

    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.columns = Math.ceil(width / config.gap);
    this.rows = Math.ceil(height / config.gap);
    this.maxRipples = config.maxRipples ?? 20;

    this.reactiveHover = {
      radius: config.reactiveHover?.radius ?? config.hoverRadius ?? 120,
      radiusY: config.reactiveHover?.radiusY ?? config.hoverRadiusY ?? config.reactiveHover?.radius ?? config.hoverRadius ?? 120,
      shape: config.reactiveHover?.shape ?? config.hoverShape ?? "circle",
      strength: config.reactiveHover?.strength ?? 1,
      interactionScope: config.reactiveHover?.interactionScope ?? "imageMask",
      deactivate: config.reactiveHover?.deactivate ?? 0.8,
      displace: config.reactiveHover?.displace ?? 3,
      jitter: config.reactiveHover?.jitter ?? 1.25,
      tintPalette: config.reactiveHover?.tintPalette ?? []
    };

    this.reactiveRipple = {
      enabled: config.reactiveRipple?.enabled ?? true,
      deactivateMultiplier: config.reactiveRipple?.deactivateMultiplier ?? 1,
      displaceMultiplier: config.reactiveRipple?.displaceMultiplier ?? 1,
      jitterMultiplier: config.reactiveRipple?.jitterMultiplier ?? 1,
      tintPalette: config.reactiveRipple?.tintPalette ?? []
    };

    const sharedMorphHold = config.autoMorph?.intervalMs;
    this.autoMorph = {
      enabled: config.autoMorph?.enabled ?? false,
      holdImageMs: config.autoMorph?.holdImageMs ?? sharedMorphHold ?? 2500,
      holdTextMs: config.autoMorph?.holdTextMs ?? sharedMorphHold ?? 2500,
      morphDurationMs: config.autoMorph?.morphDurationMs ?? 1200,
      intervalMs: config.autoMorph?.intervalMs ?? 0
    };

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

    this.imageMask = new ImageMaskInfluence(
      config.imageMask?.src ?? "/src/assets/cat.png",
      config.imageMask?.centerX ?? centerX,
      config.imageMask?.centerY ?? centerY,
      {
        scale: config.imageMask?.scale ?? 3,
        sampleMode: config.imageMask?.sampleMode ?? "invert",
        strength: config.imageMask?.strength ?? 1.5,
        threshold: config.imageMask?.threshold,
        blurRadius: config.imageMask?.blurRadius,
        dithering: config.imageMask?.dithering
      }
    );

    this.textMask = new TextMaskInfluence(
      config.textMask?.text ?? "PIXEL",
      config.textMask?.centerX ?? centerX,
      config.textMask?.centerY ?? centerY,
      {
        font: config.textMask?.font ?? "bold 160px Arial",
        strength: config.textMask?.strength ?? 0.9,
        blurRadius: config.textMask?.blurRadius ?? 2
      }
    );

    const initialMask = config.initialMask ?? "image";
    this.morphState = initialMask === "image" ? "image" : "text";
    this.influenceManager.add(initialMask === "image" ? this.imageMask : this.textMask);

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

  private startMorph(
    from: ImageMaskInfluence | TextMaskInfluence,
    to: ImageMaskInfluence | TextMaskInfluence,
    nextState: MorphState
  ): void {
    this.influenceManager.remove(from);
    this.influenceManager.remove(to);

    this.morphMask = new MorphMaskInfluence(
      from,
      to,
      this.autoMorph.morphDurationMs
    );

    this.influenceManager.add(this.morphMask);
    this.morphState = nextState;
    this.stateTimer = 0;
  }

  private updateMorphState(delta: number): void {
    if (!this.autoMorph.enabled) return;

    if (this.morphMask && !this.morphMask.isAlive()) {
      this.influenceManager.remove(this.morphMask);
      this.morphMask = null;

      if (this.morphState === "toText") {
        this.influenceManager.add(this.textMask);
        this.morphState = "text";
      } else if (this.morphState === "toImage") {
        this.influenceManager.add(this.imageMask);
        this.morphState = "image";
      }

      this.stateTimer = 0;
      return;
    }

    if (this.morphMask) return;

    this.stateTimer += delta;

    const imageWaitMs = this.autoMorph.holdImageMs + this.autoMorph.intervalMs;
    const textWaitMs = this.autoMorph.holdTextMs + this.autoMorph.intervalMs;

    if (
      this.morphState === "image" &&
      this.stateTimer >= imageWaitMs
    ) {
      this.startMorph(this.imageMask, this.textMask, "toText");
      return;
    }

    if (
      this.morphState === "text" &&
      this.stateTimer >= textWaitMs
    ) {
      this.startMorph(this.textMask, this.imageMask, "toImage");
    }
  }

  private setupInfluences(): void {
    const hoverMode = this.config.hoverMode ?? "classic";

    if (
      this.influenceOptions.hover &&
      hoverMode === "classic"
    ) {
      this.influenceManager.add(
        new HoverInfluence(
          this.engine,
          this.config.hoverRadius ?? 120,
          this.config.breathSpeed,
          1,
          {
            radiusY: this.config.hoverRadiusY ?? this.config.hoverRadius ?? 120,
            shape: this.config.hoverShape ?? "circle"
          }
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

  private isInsideAnyMask(cell: PixelCell): boolean {
    const threshold = 0.05;
    const image = this.imageMask.getInfluence(cell.x, cell.y, 1);
    if (image > threshold) return true;

    const text = this.textMask.getInfluence(cell.x, cell.y, 1);
    if (text > threshold) return true;

    if (this.morphMask) {
      const morph = this.morphMask.getInfluence(cell.x, cell.y, 1);
      return morph > threshold;
    }

    return false;
  }

  private shouldAffectWithReactiveHover(cell: PixelCell): boolean {
    const scope = this.reactiveHover.interactionScope;

    if (scope === "all") return true;
    if (scope === "activeOnly") return cell.targetSize > 0.001;
    return this.isInsideAnyMask(cell);
  }

  private applyReactiveEffectsToCell(
    cell: PixelCell,
    cellIndex: number,
    interaction: number,
    originX: number,
    originY: number,
    tintPalette: string[],
    multipliers = { deactivate: 1, displace: 1, jitter: 1 }
  ): void {
    const strength = Math.max(0, interaction);
    if (strength <= 0) return;

    const deactivate = this.reactiveHover.deactivate * multipliers.deactivate;
    const displace = this.reactiveHover.displace * multipliers.displace;
    const jitter = this.reactiveHover.jitter * multipliers.jitter;

    if (deactivate > 0) {
      cell.targetSize *= Math.max(0, 1 - deactivate * strength);
    }

    if (displace > 0) {
      const dx = cell.x - originX;
      const dy = cell.y - originY;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const dirX = dx / len;
      const dirY = dy / len;

      const noise =
        Math.sin((cellIndex + 1) * 12.9898 + this.reactiveTime * 0.01) * 0.5 + 0.5;

      const jitterTerm = (noise - 0.5) * 2 * jitter * strength;

      cell.offsetX += dirX * displace * strength + jitterTerm;
      cell.offsetY += dirY * displace * strength - jitterTerm;
    }

    if (tintPalette.length > 0) {
      const normalized = Math.max(0, Math.min(0.999, strength));
      const colorIndex = Math.floor(normalized * tintPalette.length);
      cell.color = tintPalette[colorIndex];
    }
  }

  private applyReactiveHover(): void {
    const hoverMode = this.config.hoverMode ?? "classic";
    if (!this.influenceOptions.hover || hoverMode !== "reactive") return;

    const mouse = this.engine.mouse;
    if (!mouse.inside) return;

    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      if (!this.shouldAffectWithReactiveHover(cell)) continue;

      const dx = cell.x - mouse.x;
      const dy = cell.y - mouse.y;
      const falloff = computeHoverFalloff(dx, dy, {
        radiusX: this.reactiveHover.radius,
        radiusY: this.reactiveHover.radiusY,
        shape: this.reactiveHover.shape
      });

      if (falloff <= 0) continue;
      const interaction = falloff * this.reactiveHover.strength;

      this.applyReactiveEffectsToCell(
        cell,
        i,
        interaction,
        mouse.x,
        mouse.y,
        this.reactiveHover.tintPalette
      );
    }
  }

  private applyReactiveRippleEffects(): void {
    const hoverMode = this.config.hoverMode ?? "classic";
    if (hoverMode !== "reactive") return;
    if (!this.influenceOptions.ripple) return;
    if (!this.reactiveRipple.enabled) return;
    if (this.activeRipples.length === 0) return;

    const palette = this.reactiveRipple.tintPalette.length > 0
      ? this.reactiveRipple.tintPalette
      : this.reactiveHover.tintPalette;

    for (let r = 0; r < this.activeRipples.length; r++) {
      const ripple = this.activeRipples[r];
      const bounds = ripple.getBounds();

      const minCol = Math.max(0, Math.floor(bounds.minX / this.config.gap));
      const maxCol = Math.min(this.columns - 1, Math.floor(bounds.maxX / this.config.gap));
      const minRow = Math.max(0, Math.floor(bounds.minY / this.config.gap));
      const maxRow = Math.min(this.rows - 1, Math.floor(bounds.maxY / this.config.gap));

      for (let x = minCol; x <= maxCol; x++) {
        for (let y = minRow; y <= maxRow; y++) {
          const index = this.getCellIndex(x, y);
          const cell = this.cells[index];

          if (!this.shouldAffectWithReactiveHover(cell)) continue;

          const factor = ripple.getRingFactorAt(cell.x, cell.y);
          if (factor <= 0) continue;

          const interaction = factor * this.reactiveHover.strength;

          this.applyReactiveEffectsToCell(
            cell,
            index,
            interaction,
            ripple.getOriginX(),
            ripple.getOriginY(),
            palette,
            {
              deactivate: this.reactiveRipple.deactivateMultiplier,
              displace: this.reactiveRipple.displaceMultiplier,
              jitter: this.reactiveRipple.jitterMultiplier
            }
          );
        }
      }
    }
  }

  update(delta: number): void {
    this.reactiveTime += delta;

    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].targetSize = 0;
      this.cells[i].resetVisualState();
    }

    this.influenceManager.update(delta);
    this.activeRipples = this.activeRipples.filter(r => r.isAlive());
    this.updateMorphState(delta);

    this.influenceManager.apply(
      this.cells,
      this.getCellIndex.bind(this)
    );

    this.applyReactiveHover();
    this.applyReactiveRippleEffects();

    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].update(this.config.expandEase);
    }
  }

  render(renderer: IRenderer): void {
    const ctx = renderer.getContext();
    let currentColor = "";

    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      if (cell.size <= 0.5) continue;

      if (cell.color !== currentColor) {
        currentColor = cell.color;
        ctx.fillStyle = currentColor;
      }

      const offset = (cell.gap - cell.size) * 0.5;

      ctx.fillRect(
        (cell.x + cell.offsetX + offset) | 0,
        (cell.y + cell.offsetY + offset) | 0,
        cell.size | 0,
        cell.size | 0
      );
    }
  }

  triggerRipple(x: number, y: number): void {
    if (!this.influenceOptions.ripple) return;

    const maxRadius =
      Math.max(this.width, this.height) * 1.2;

    if (this.activeRipples.length >= this.maxRipples) {
      const oldest = this.activeRipples.shift();
      if (oldest) this.influenceManager.remove(oldest);
    }

    const ripple = new RippleInfluence(
      x,
      y,
      this.config.rippleSpeed,
      this.config.rippleThickness,
      this.config.rippleStrength,
      maxRadius
    );

    this.activeRipples.push(ripple);
    this.influenceManager.add(ripple);
  }
}
