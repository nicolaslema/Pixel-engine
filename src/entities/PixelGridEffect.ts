import { Entity } from "../scene/Entity";
import { IRenderer } from "../renderers/IRenderer";
import { PixelCell } from "./PixelCell";
import { PixelEngine } from "../core/PixelEngine";
import {
  PixelGridConfig,
  PixelGridInfluenceOptions,
  ResolvedPixelGridConfig
} from "./pixel-grid/types";
import { resolvePixelGridConfig } from "./pixel-grid/normalizeConfig";

import { InfluenceManager } from "../influences/InfluenceManager";
import { RippleInfluence } from "../influences/RippleInfluence";
import { HoverInfluence } from "../influences/HoverInfluence";
import { OrganicNoiseInfluence } from "../influences/OrganicNoiseInfluence";
import { TextMaskInfluence } from "../influences/Masks/TextMaskInfluence";
import { ImageMaskInfluence } from "../influences/Masks/ImageMaskInfluence";
import { MaskInfluence } from "../influences/Masks/MaskInfluence";
import { MorphMaskInfluence } from "../influences/Masks/MorphMaskInfluence";
import { computeHoverFalloff } from "../influences/HoverShape";
import { clamp } from "../utils/math";

type MorphState = "image" | "toText" | "text" | "toImage";

export class PixelGridEffect extends Entity {
  private cells: PixelCell[] = [];
  private activeRipples: RippleInfluence[] = [];

  private columns: number;
  private rows: number;

  private influenceManager: InfluenceManager;
  private maxRipples: number;
  private reactiveTime = 0;
  private rippleSpeed: number;
  private rippleThickness: number;
  private rippleStrength: number;

  private readonly hoverEffects: ResolvedPixelGridConfig["hoverEffects"];
  private readonly rippleEffects: ResolvedPixelGridConfig["rippleEffects"];
  private readonly breathing: ResolvedPixelGridConfig["breathing"];
  private readonly autoMorph: ResolvedPixelGridConfig["autoMorph"];

  private imageMask: ImageMaskInfluence | null = null;
  private textMask: TextMaskInfluence | null = null;
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
    const resolved = resolvePixelGridConfig(config);
    this.hoverEffects = resolved.hoverEffects;
    this.rippleEffects = resolved.rippleEffects;
    this.breathing = resolved.breathing;
    this.autoMorph = resolved.autoMorph;

    this.rippleSpeed = this.rippleEffects.speed;
    this.rippleThickness = this.rippleEffects.thickness;
    this.rippleStrength = this.rippleEffects.strength;
    this.maxRipples = this.rippleEffects.maxRipples;

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

    if (config.imageMask?.src) {
      this.imageMask = new ImageMaskInfluence(
        config.imageMask.src,
        config.imageMask.centerX ?? centerX,
        config.imageMask.centerY ?? centerY,
        {
          scale: config.imageMask.scale ?? 3,
          sampleMode: config.imageMask.sampleMode ?? "invert",
          strength: config.imageMask.strength ?? 1.5,
          threshold: config.imageMask.threshold,
          blurRadius: config.imageMask.blurRadius,
          dithering: config.imageMask.dithering
        }
      );
    }

    if (config.textMask?.text) {
      this.textMask = new TextMaskInfluence(
        config.textMask.text,
        config.textMask.centerX ?? centerX,
        config.textMask.centerY ?? centerY,
        {
          font: config.textMask.font ?? "bold 160px Arial",
          strength: config.textMask.strength ?? 0.9,
          blurRadius: config.textMask.blurRadius ?? 2
        }
      );
    }

    const initialMask = resolved.initialMask;
    this.morphState = initialMask === "image" ? "image" : "text";

    if (initialMask === "image") {
      if (this.imageMask) this.influenceManager.add(this.imageMask);
      else if (this.textMask) this.influenceManager.add(this.textMask);
    } else {
      if (this.textMask) this.influenceManager.add(this.textMask);
      else if (this.imageMask) this.influenceManager.add(this.imageMask);
    }

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
    from: MaskInfluence,
    to: MaskInfluence,
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
    if (!this.imageMask || !this.textMask) return;

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
    const hoverMode = this.hoverEffects.mode;

    if (
      this.influenceOptions.hover &&
      hoverMode === "classic"
    ) {
      this.influenceManager.add(
        new HoverInfluence(
          this.engine,
          this.hoverEffects.radius,
          this.config.breathSpeed,
          this.hoverEffects.strength,
          {
            radiusY: this.hoverEffects.radiusY,
            shape: this.hoverEffects.shape
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
    return this.getMaskWeight(cell) > 0.05;
  }

  private getHoverWeight(cell: PixelCell): number {
    const mouse = this.engine.mouse;
    if (!mouse.inside) return 0;

    const dx = cell.x - mouse.x;
    const dy = cell.y - mouse.y;
    const hoverMode = this.hoverEffects.mode;

    if (hoverMode === "reactive") {
      return computeHoverFalloff(dx, dy, {
        radiusX: this.hoverEffects.radius,
        radiusY: this.hoverEffects.radiusY,
        shape: this.hoverEffects.shape
      });
    }

    return computeHoverFalloff(dx, dy, {
      radiusX: this.hoverEffects.radius,
      radiusY: this.hoverEffects.radiusY,
      shape: this.hoverEffects.shape
    });
  }

  private getMaskWeight(cell: PixelCell): number {
    const image = this.imageMask
      ? this.imageMask.getInfluence(cell.x, cell.y, 1)
      : 0;
    const text = this.textMask
      ? this.textMask.getInfluence(cell.x, cell.y, 1)
      : 0;
    const morph = this.morphMask
      ? this.morphMask.getInfluence(cell.x, cell.y, 1)
      : 0;

    return Math.max(image, text, morph);
  }

  private getImageMaskWeight(cell: PixelCell): number {
    if (!this.imageMask) return 0;
    return this.imageMask.getInfluence(cell.x, cell.y, 1);
  }

  private getTextMaskWeight(cell: PixelCell): number {
    const text = this.textMask
      ? this.textMask.getInfluence(cell.x, cell.y, 1)
      : 0;
    const morph = this.morphMask
      ? this.morphMask.getInfluence(cell.x, cell.y, 1)
      : 0;
    return Math.max(text, morph);
  }

  private shouldAffectWithReactiveHover(cell: PixelCell): boolean {
    const scope = this.hoverEffects.interactionScope;

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

    const deactivate = this.hoverEffects.deactivate * multipliers.deactivate;
    const displace = this.hoverEffects.displace * multipliers.displace;
    const jitter = this.hoverEffects.jitter * multipliers.jitter;

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
    const hoverMode = this.hoverEffects.mode;
    if (!this.influenceOptions.hover || hoverMode !== "reactive") return;

    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      if (!this.shouldAffectWithReactiveHover(cell)) continue;

      const falloff = this.getHoverWeight(cell);
      if (falloff <= 0) continue;

      const mouse = this.engine.mouse;
      const interaction = falloff * this.hoverEffects.strength;

      this.applyReactiveEffectsToCell(
        cell,
        i,
        interaction,
        mouse.x,
        mouse.y,
        this.hoverEffects.tintPalette
      );
    }
  }

  private applyReactiveRippleEffects(): void {
    if (!this.influenceOptions.ripple) return;
    if (!this.rippleEffects.enabled) return;
    if (this.activeRipples.length === 0) return;

    const palette = this.rippleEffects.tintPalette.length > 0
      ? this.rippleEffects.tintPalette
      : this.hoverEffects.tintPalette;

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

          const interaction = factor * this.hoverEffects.strength;

          this.applyReactiveEffectsToCell(
            cell,
            index,
            interaction,
            ripple.getOriginX(),
            ripple.getOriginY(),
            palette,
            {
              deactivate: this.rippleEffects.deactivateMultiplier,
              displace: this.rippleEffects.displaceMultiplier,
              jitter: this.rippleEffects.jitterMultiplier
            }
          );
        }
      }
    }
  }

  private applyBreathing(): void {
    if (!this.breathing.enabled) return;

    const minOpacity = clamp(this.breathing.minOpacity, 0, 1);
    const maxOpacity = clamp(this.breathing.maxOpacity, minOpacity, 1);
    const speed = Math.max(0, this.breathing.speed);
    const strength = clamp(this.breathing.strength, 0, 1);

    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      if (cell.targetSize <= 0.001) continue;

      let influenceWeight = 0;

      if (this.breathing.affectHover) {
        const mouse = this.engine.mouse;
        if (mouse.inside) {
          const dx = cell.x - mouse.x;
          const dy = cell.y - mouse.y;

          const hoverWeight = computeHoverFalloff(dx, dy, {
            radiusX: this.breathing.radius,
            radiusY: this.breathing.radiusY,
            shape: this.breathing.shape
          });

          influenceWeight = Math.max(influenceWeight, hoverWeight);
        }
      }

      if (this.breathing.affectImage) {
        influenceWeight = Math.max(
          influenceWeight,
          this.getImageMaskWeight(cell)
        );
      }

      if (this.breathing.affectText) {
        influenceWeight = Math.max(
          influenceWeight,
          this.getTextMaskWeight(cell)
        );
      }

      if (influenceWeight <= 0.001) continue;

      const breathWave = cell.getBreathFactor(this.reactiveTime, speed);
      const randomSlice = Math.floor(this.reactiveTime * 0.001 * speed * 2);
      const seed = Math.sin((i + 1) * 12.9898 + randomSlice * 78.233) * 43758.5453;
      const randomPulse = seed - Math.floor(seed);
      const wave = clamp((breathWave * 0.65) + (randomPulse * 0.35), 0, 1);
      const breathOpacity =
        minOpacity + (maxOpacity - minOpacity) * wave;
      const mix = clamp(influenceWeight * strength, 0, 1);

      cell.opacity = 1 + (breathOpacity - 1) * mix;
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
    this.applyBreathing();

    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].update(this.config.expandEase);
    }
  }

  render(renderer: IRenderer): void {
    const ctx = renderer.getContext();
    let currentColor = "";
    let currentOpacity = -1;

    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      if (cell.size <= 0.5) continue;

      if (cell.color !== currentColor) {
        currentColor = cell.color;
        ctx.fillStyle = currentColor;
      }

      if (cell.opacity !== currentOpacity) {
        currentOpacity = cell.opacity;
        ctx.globalAlpha = currentOpacity;
      }

      const offset = (cell.gap - cell.size) * 0.5;

      ctx.fillRect(
        (cell.x + cell.offsetX + offset) | 0,
        (cell.y + cell.offsetY + offset) | 0,
        cell.size | 0,
        cell.size | 0
      );
    }

    if (currentOpacity !== 1) {
      ctx.globalAlpha = 1;
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
      this.rippleSpeed,
      this.rippleThickness,
      this.rippleStrength,
      maxRadius
    );

    this.activeRipples.push(ripple);
    this.influenceManager.add(ripple);
  }
}
