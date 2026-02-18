export class PerformanceMonitor {
  public fps = 60;

  private frameCount = 0;
  private accumulator = 0;

  update(delta: number) {
    this.frameCount++;
    this.accumulator += delta;

    if (this.accumulator >= 1) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.accumulator = 0;
    }
  }
}
