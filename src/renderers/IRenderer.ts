export interface IRenderer {
  clear(color?: string | null): void;
  getContext(): CanvasRenderingContext2D;
  resize(width: number, height: number, dpr?: number): void;
  destroy?(): void;
}
