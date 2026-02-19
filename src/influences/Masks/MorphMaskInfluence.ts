import { Influence, BlendMode } from "../Influence";
import { MaskInfluence } from "./MaskInfluence";

interface MorphOptions {
  strength?: number;
  initialT?: number;
}

export class MorphMaskInfluence implements Influence {
  priority = 8;
  blendMode: BlendMode = "max";

  private t: number;
  private startT: number;
  private targetT: number;

  private duration = 1;
  private elapsed = 0;
  private animating = false;

  private strength: number;

  constructor(
    private maskA: MaskInfluence,
    private maskB: MaskInfluence,
    options: MorphOptions = {}
  ) {
    this.t = options.initialT ?? 0;
    this.startT = this.t;
    this.targetT = this.t;
    this.strength = options.strength ?? 1;
  }

  // 🔥 Animación controlada por duración
  morphTo(target: number, duration: number = 1) {
    this.startT = this.t;
    this.targetT = Math.max(0, Math.min(1, target));
    this.duration = Math.max(0.0001, duration);
    this.elapsed = 0;
    this.animating = true;
  }

  // 🔥 Cambio inmediato
  setImmediate(t: number) {
    const clamped = Math.max(0, Math.min(1, t));
    this.t = clamped;
    this.startT = clamped;
    this.targetT = clamped;
    this.animating = false;
  }

  update(delta: number): void {
    this.maskA.update(delta);
    this.maskB.update(delta);

    if (!this.animating) return;

    this.elapsed += delta;

    const progress = Math.min(this.elapsed / this.duration, 1);

    // Smoothstep easing
    const eased = progress * progress * (3 - 2 * progress);

    this.t =
      this.startT +
      (this.targetT - this.startT) * eased;

    if (progress >= 1) {
      this.animating = false;
    }
  }

  isAlive(): boolean {
    return this.maskA.isAlive() || this.maskB.isAlive();
  }

  getBounds() {
    const a = this.maskA.getBounds();
    const b = this.maskB.getBounds();

    return {
      minX: Math.min(a.minX, b.minX),
      maxX: Math.max(a.maxX, b.maxX),
      minY: Math.min(a.minY, b.minY),
      maxY: Math.max(a.maxY, b.maxY)
    };
  }

  getInfluence(
    x: number,
    y: number,
    maxSize: number
  ): number {
    const a = this.maskA.getInfluence(x, y, maxSize);
    const b = this.maskB.getInfluence(x, y, maxSize);

    return (
      (a * (1 - this.t) + b * this.t) *
      this.strength
    );
  }
}
