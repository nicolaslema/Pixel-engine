export class Camera2D {
  x = 0;
  y = 0;
  zoom = 1;

  apply(ctx: CanvasRenderingContext2D): void {
    ctx.setTransform(
      this.zoom,
      0,
      0,
      this.zoom,
      -this.x * this.zoom,
      -this.y * this.zoom
    );
  }
}
