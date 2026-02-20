export class Time {
  delta = 0;
  unscaledDelta = 0;
  timeScale = 1;
  elapsed = 0;

  update(deltaMs: number): number {
    this.unscaledDelta = deltaMs;
    this.delta = deltaMs * this.timeScale;
    this.elapsed += this.delta;
    return this.delta;
  }

  get deltaSeconds(): number {
    return this.delta / 1000;
  }

  get elapsedSeconds(): number {
    return this.elapsed / 1000;
  }
}
