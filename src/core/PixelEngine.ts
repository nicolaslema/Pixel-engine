import { GameLoop } from "./GameLoop";
import { PixelEngineOptions } from "./types";
import { Renderer } from "../renderers/Renderer";
import { Scene } from "../scene/Scene";
import { Entity } from "../scene/Entity";
import { InputSystem } from "../input/InputSystem";
import { Time } from "./Time";
import { Camera2D } from "../renderers/Camera2D";

export class PixelEngine {
  private renderer: Renderer;
  private loop: GameLoop;
  private scene: Scene;
  private input: InputSystem;
  private time: Time;
  private camera: Camera2D;

  // ==============================
  // Mouse State (expuesto para influences)
  // ==============================

  public mouse = {
    x: 0,
    y: 0,
    inside: false,
    down: false
  };

  constructor(private options: PixelEngineOptions) {
    const { canvas, width, height } = options;

    canvas.width = width;
    canvas.height = height;

    this.renderer = new Renderer(canvas);
    this.scene = new Scene();
    this.input = new InputSystem(canvas);
    this.time = new Time();
    this.camera = new Camera2D();

    this.setupMouseTracking(canvas);

    this.loop = new GameLoop((deltaTime: number) => {
      this.update(deltaTime);
      this.render();
    });
  }

  // ==============================
  // Mouse Tracking
  // ==============================

  private setupMouseTracking(canvas: HTMLCanvasElement): void {
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();

      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener("mouseenter", () => {
      this.mouse.inside = true;
    });

    canvas.addEventListener("mouseleave", () => {
      this.mouse.inside = false;
    });

    canvas.addEventListener("mousedown", () => {
      this.mouse.down = true;
    });

    canvas.addEventListener("mouseup", () => {
      this.mouse.down = false;
    });
  }

  // ==============================
  // Internal lifecycle
  // ==============================

  private update(deltaTime: number): void {
    const scaledDelta = this.time.update(deltaTime);

    this.scene.update(scaledDelta);
  }

  private render(): void {
    const ctx = this.renderer.getContext();

    ctx.save();

    this.renderer.clear("black");

    this.camera.apply(ctx);

    this.scene.render(this.renderer);

    ctx.restore();
  }

  // ==============================
  // Public API
  // ==============================

  start(): void {
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
  }

  destroy(): void {
    this.stop();
    this.input.destroy();
  }

  // ==============================
  // Scene Management
  // ==============================

  addEntity(entity: Entity): void {
    this.scene.add(entity);
  }

  removeEntity(entity: Entity): void {
    this.scene.remove(entity);
  }

  getScene(): Scene {
    return this.scene;
  }

  // ==============================
  // Systems Access
  // ==============================

  getRenderer(): Renderer {
    return this.renderer;
  }

  getInput(): InputSystem {
    return this.input;
  }

  getCamera(): Camera2D {
    return this.camera;
  }

  getTime(): Time {
    return this.time;
  }

  getFPS(): number {
    return this.loop.getFPS();
  }

  isRunning(): boolean {
    return this.loop.isRunning();
  }
}
