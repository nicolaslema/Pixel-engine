export interface MouseState {
  x: number;
  y: number;
  isDown: boolean;
  inside: boolean;
}

export class InputSystem {
  private mouse: MouseState = {
    x: -9999,
    y: -9999,
    isDown: false,
    inside: false
  };

  constructor(private canvas: HTMLCanvasElement) {
    this.attach();
  }

  private attach(): void {
    this.canvas.addEventListener("mousemove", this.handleMove);
    this.canvas.addEventListener("mouseenter", this.handleEnter);
    this.canvas.addEventListener("mousedown", this.handleDown);
    this.canvas.addEventListener("mouseup", this.handleUp);
    this.canvas.addEventListener("mouseleave", this.handleLeave);
  }

  private handleMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  };

  private handleDown = (): void => {
    this.mouse.isDown = true;
  };

  private handleUp = (): void => {
    this.mouse.isDown = false;
  };

  private handleLeave = (): void => {
    this.mouse.x = -9999;
    this.mouse.y = -9999;
    this.mouse.isDown = false;
    this.mouse.inside = false;
  };

  private handleEnter = (): void => {
    this.mouse.inside = true;
  };

  getMouse(): Readonly<MouseState> {
    return this.mouse;
  }

  destroy(): void {
    this.canvas.removeEventListener("mousemove", this.handleMove);
    this.canvas.removeEventListener("mouseenter", this.handleEnter);
    this.canvas.removeEventListener("mousedown", this.handleDown);
    this.canvas.removeEventListener("mouseup", this.handleUp);
    this.canvas.removeEventListener("mouseleave", this.handleLeave);
  }
}
