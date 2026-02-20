import { Entity } from "../scene/Entity";
import { IRenderer } from "../renderers/IRenderer";
import { PixelCell } from "./PixelCell";
import { EnginePointerSource } from "../core/EnginePointerSource";
import {
  PixelGridConfig,
  PixelGridInfluenceOptions,
  ResolvedPixelGridConfig
} from "./pixel-grid/types";
import { resolvePixelGridConfig } from "./pixel-grid/normalizeConfig";
import {
  createPixelGridRuntimeState,
  PixelGridRuntimeState,
  compactAliveRipples,
  resetCells
} from "./pixel-grid/internal/runtime-state";
import { createMaskStateMachine } from "./pixel-grid/internal/mask-state-machine";
import {
  applyReactiveEffectsToCell,
  applyReactiveRipple,
  getHoverWeight,
  shouldAffectCell
} from "./pixel-grid/internal/reactive-effects";
import { applyBreathingSystem } from "./pixel-grid/internal/breathing-system";

import { InfluenceManager } from "../influences/InfluenceManager";
import { RippleInfluence } from "../influences/RippleInfluence";
import { HoverInfluence } from "../influences/HoverInfluence";
import { OrganicNoiseInfluence } from "../influences/OrganicNoiseInfluence";
import { TextMaskInfluence } from "../influences/Masks/TextMaskInfluence";
import { ImageMaskInfluence } from "../influences/Masks/ImageMaskInfluence";
import { MaskStateMachine } from "./pixel-grid/internal/mask-state-machine";

export class PixelGridEffect extends Entity {
  private cells: PixelCell[] = [];
  private readonly runtime: PixelGridRuntimeState;

  private columns: number;
  private rows: number;

  private influenceManager: InfluenceManager;
  private readonly inverseGap: number;
  private maxRipples: number;
  private rippleSpeed: number;
  private rippleThickness: number;
  private rippleStrength: number;
  private readonly getCellIndexRef = (x: number, y: number): number => x * this.rows + y;

  private readonly hoverEffects: ResolvedPixelGridConfig["hoverEffects"];
  private readonly rippleEffects: ResolvedPixelGridConfig["rippleEffects"];
  private readonly breathing: ResolvedPixelGridConfig["breathing"];
  private readonly autoMorph: ResolvedPixelGridConfig["autoMorph"];

  private readonly maskState: MaskStateMachine;

  constructor(
    private engine: EnginePointerSource,
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
    this.inverseGap = 1 / config.gap;
    const cacheSize = this.columns * this.rows;
    this.runtime = createPixelGridRuntimeState(cacheSize);
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

    const imageMask = config.imageMask?.src
      ? new ImageMaskInfluence(
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
      )
      : null;

    const textMask = config.textMask?.text
      ? new TextMaskInfluence(
        config.textMask.text,
        config.textMask.centerX ?? centerX,
        config.textMask.centerY ?? centerY,
        {
          font: config.textMask.font ?? "bold 160px Arial",
          strength: config.textMask.strength ?? 0.9,
          blurRadius: config.textMask.blurRadius ?? 2
        }
      )
      : null;

    this.maskState = createMaskStateMachine({
      influenceManager: this.influenceManager,
      autoMorph: this.autoMorph,
      initialMask: resolved.initialMask,
      imageMask,
      textMask
    });

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

  private updateMaskWeightCache(): void {
    const imageMask = this.maskState.imageMask;
    const textMask = this.maskState.textMask;
    const morphMask = this.maskState.morphMask;
    const hasImage = imageMask !== null;
    const hasText = textMask !== null;
    const hasMorph = morphMask !== null;

    if (!hasImage && !hasText && !hasMorph) {
      this.runtime.activeMaskWeightCache.fill(0);
      this.runtime.imageMaskWeightCache.fill(0);
      this.runtime.textMaskWeightCache.fill(0);
      return;
    }

    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      const image = hasImage
        ? imageMask!.getInfluence(cell.x, cell.y, 1)
        : 0;
      const text = hasText
        ? textMask!.getInfluence(cell.x, cell.y, 1)
        : 0;
      const morph = hasMorph
        ? morphMask!.getInfluence(cell.x, cell.y, 1)
        : 0;

      const textOrMorph = Math.max(text, morph);

      this.runtime.imageMaskWeightCache[i] = image;
      this.runtime.textMaskWeightCache[i] = textOrMorph;
      this.runtime.activeMaskWeightCache[i] = Math.max(image, textOrMorph);
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

  private shouldAffectWithReactiveHover(index: number, cell: PixelCell): boolean {
    return shouldAffectCell(
      this.hoverEffects.interactionScope,
      cell.targetSize,
      this.runtime.activeMaskWeightCache[index]
    );
  }

  private applyReactiveHover(): void {
    const hoverMode = this.hoverEffects.mode;
    if (!this.influenceOptions.hover || hoverMode !== "reactive") return;

    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      if (!this.shouldAffectWithReactiveHover(i, cell)) continue;

      const falloff = getHoverWeight(cell, this.engine.mouse, this.hoverEffects);
      if (falloff <= 0) continue;

      const mouse = this.engine.mouse;
      const interaction = falloff * this.hoverEffects.strength;

      applyReactiveEffectsToCell({
        cell,
        cellIndex: i,
        interaction,
        originX: mouse.x,
        originY: mouse.y,
        reactiveTime: this.runtime.reactiveTime,
        hoverEffects: this.hoverEffects,
        tintPalette: this.hoverEffects.tintPalette
      });
    }
  }

  private applyReactiveRippleEffects(): void {
    if (!this.influenceOptions.ripple) return;
    applyReactiveRipple({
      cells: this.cells,
      activeRipples: this.runtime.activeRipples,
      inverseGap: this.inverseGap,
      columns: this.columns,
      rows: this.rows,
      hoverEffects: this.hoverEffects,
      rippleEffects: this.rippleEffects,
      activeMaskWeightCache: this.runtime.activeMaskWeightCache,
      reactiveTime: this.runtime.reactiveTime,
      getCellIndex: this.getCellIndexRef
    });
  }

  private applyBreathing(): void {
    applyBreathingSystem({
      cells: this.cells,
      breathing: this.breathing,
      mouse: this.engine.mouse,
      imageMaskWeightCache: this.runtime.imageMaskWeightCache,
      textMaskWeightCache: this.runtime.textMaskWeightCache,
      reactiveTime: this.runtime.reactiveTime
    });
  }

  update(delta: number): void {
    this.runtime.reactiveTime += delta;

    resetCells(this.cells);

    this.influenceManager.update(delta);
    compactAliveRipples(this.runtime.activeRipples);
    this.maskState.update(delta);

    this.influenceManager.apply(
      this.cells,
      this.getCellIndexRef
    );
    this.updateMaskWeightCache();

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

    if (this.runtime.activeRipples.length >= this.maxRipples) {
      const oldest = this.runtime.activeRipples.shift();
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

    this.runtime.activeRipples.push(ripple);
    this.influenceManager.add(ripple);
  }
}
