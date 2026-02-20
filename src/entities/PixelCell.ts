export class PixelCell {
  public size = 0;
  public targetSize = 0;
  public offsetX = 0;
  public offsetY = 0;

  public readonly maxSize: number;
  public readonly baseColor: string;
  public color: string;

  private breathPhase: number;
  private breathOffset: number;

  constructor(
    public readonly x: number,
    public readonly y: number,
    color: string,
    public readonly gap: number,
    maxSizeFactor: number
  ) {
    this.maxSize = gap * maxSizeFactor;
    this.baseColor = color;
    this.color = color;

    this.breathPhase = Math.random() * Math.PI * 2;
    this.breathOffset = Math.random() * 0.5 + 0.5;
  }

  public getBreathFactor(
    time: number,
    breathSpeed: number
  ): number {
    // breathSpeed controla frecuencia real
    const t = time * 0.001 * breathSpeed;

    return (
      (Math.sin(t + this.breathPhase) * 0.5 + 0.5) *
      this.breathOffset
    );
  }

  public update(
    expandEase: number
  ): void {
    this.size +=
      (this.targetSize - this.size) * expandEase;
  }

  public resetVisualState(): void {
    this.offsetX = 0;
    this.offsetY = 0;
    this.color = this.baseColor;
  }
}
