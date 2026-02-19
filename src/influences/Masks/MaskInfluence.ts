import { Influence, BlendMode } from "../Influence";

export abstract class MaskInfluence implements Influence {
  priority = 8;
  blendMode: BlendMode = "max";

  protected width = 0;
  protected height = 0;

  // 🔥 Buffer normalizado 0–1
  protected buffer!: Float32Array;

  constructor(
    protected centerX: number,
    protected centerY: number,
    protected strength: number = 1
  ) {}

  abstract update(delta: number): void;
  abstract generateMask(): void;

  isAlive(): boolean {
    return true;
  }

  getBounds() {
    return {
      minX: this.centerX - this.width * 0.5,
      maxX: this.centerX + this.width * 0.5,
      minY: this.centerY - this.height * 0.5,
      maxY: this.centerY + this.height * 0.5
    };
  }

  getInfluence(
    x: number,
    y: number,
    maxSize: number
  ): number {
    if (!this.buffer) return 0;

    const localX = Math.floor(
      x - (this.centerX - this.width * 0.5)
    );

    const localY = Math.floor(
      y - (this.centerY - this.height * 0.5)
    );

    if (
      localX < 0 ||
      localY < 0 ||
      localX >= this.width ||
      localY >= this.height
    ) {
      return 0;
    }

    const index = localY * this.width + localX;

    return this.buffer[index] * maxSize * this.strength;
  }
}
