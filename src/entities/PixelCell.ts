export class PixelCell {
  x: number;
  y: number;
  color: string;
  gap: number;
  activation: number;

  size = 0;
  targetSize = 0;

  minSize = 0;
  maxSize: number;

  phase: number;
  speed: number;

  constructor(
    x: number,
    y: number,
    color: string,
    gap: number,
    activation: number
  ) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.gap = gap;
    this.activation = activation;

    this.maxSize = Math.min(Math.max(1, Math.round(gap * 0.65)), gap);
    this.phase = Math.random() * Math.PI * 2;
    this.speed = 0.5 + Math.random() * 0.5;
  }

  update(expandEase: number, breathSpeed: number, delta: number) {
    this.size += (this.targetSize - this.size) * expandEase;

    if (Math.abs(this.size - this.targetSize) < 0.05) {
      this.size = this.targetSize;
    }

    if (this.size > 0.01) {
      this.phase += breathSpeed * this.speed * delta * 0.01;
    }
  }
}
