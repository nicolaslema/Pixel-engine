import { beforeEach, describe, expect, it, vi } from "vitest";
import { PixelEngine } from "../core/PixelEngine";
import { PixelGridEffect } from "./PixelGridEffect";

describe("PixelGridEffect", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue({
        setTransform: () => {},
        scale: () => {},
        fillRect: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        clearRect: () => {},
        drawImage: () => {},
        getImageData: () => ({ data: new Uint8ClampedArray(4) })
      } as unknown as CanvasRenderingContext2D);
  });

  it("should work without imageMask and textMask", () => {
    const canvas = document.createElement("canvas");
    const engine = new PixelEngine({
      canvas,
      width: 200,
      height: 120
    });

    const effect = new PixelGridEffect(engine, 200, 120, {
      colors: ["#334155", "#475569", "#64748b"],
      gap: 8,
      expandEase: 0.08,
      breathSpeed: 1
    });

    expect(() => effect.update(16)).not.toThrow();
    expect(() => effect.render(engine.getRenderer())).not.toThrow();

    engine.destroy();
  });

  it("should apply canvasBackground from config and allow runtime update", () => {
    const canvas = document.createElement("canvas");
    const engine = new PixelEngine({
      canvas,
      width: 200,
      height: 120,
      clearColor: "black"
    });

    const effect = new PixelGridEffect(engine, 200, 120, {
      colors: ["#334155", "#475569", "#64748b"],
      gap: 8,
      expandEase: 0.08,
      breathSpeed: 1,
      canvasBackground: "#112233"
    });

    expect(engine.getClearColor()).toBe("#112233");

    effect.setCanvasBackground(null);
    expect(engine.getClearColor()).toBeNull();

    engine.destroy();
  });
});
