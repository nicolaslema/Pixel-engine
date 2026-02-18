export class Time {
  timeScale = 1;
  elapsed = 0;

  update(delta: number): number {
    const scaled = delta * this.timeScale;
    this.elapsed += scaled;
    return scaled;
  }
}
