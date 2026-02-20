import { describe, it, expect } from "vitest";
import { computeHoverFalloff } from "./HoverShape";

describe("HoverShape", () => {
  it("returns zero outside circle radius", () => {
    const value = computeHoverFalloff(200, 0, {
      radiusX: 100,
      radiusY: 100,
      shape: "circle"
    });

    expect(value).toBe(0);
  });

  it("supports vignette profile", () => {
    const center = computeHoverFalloff(0, 0, {
      radiusX: 100,
      radiusY: 60,
      shape: "vignette"
    });
    const edge = computeHoverFalloff(90, 50, {
      radiusX: 100,
      radiusY: 60,
      shape: "vignette"
    });

    expect(center).toBeGreaterThan(edge);
    expect(edge).toBeGreaterThanOrEqual(0);
  });
});
