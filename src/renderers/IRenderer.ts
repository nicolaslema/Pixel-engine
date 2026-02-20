export interface IRenderer {
  clear(color?: string): void;
  getContext(): CanvasRenderingContext2D;
  resize(width: number, height: number, dpr?: number): void;
  destroy?(): void;
}
