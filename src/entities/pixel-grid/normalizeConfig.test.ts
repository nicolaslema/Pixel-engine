import { describe, expect, it } from "vitest";
import { resolvePixelGridConfig } from "./normalizeConfig";

describe("resolvePixelGridConfig", () => {
  it("provides stable defaults", () => {
    const resolved = resolvePixelGridConfig({
      colors: ["#fff"],
      gap: 5,
      expandEase: 0.1,
      breathSpeed: 1
    });

    expect(resolved.hoverEffects.mode).toBe("classic");
    expect(resolved.hoverEffects.radius).toBe(120);
    expect(resolved.rippleEffects.speed).toBe(0.5);
    expect(resolved.rippleEffects.maxRipples).toBe(20);
    expect(resolved.breathing.enabled).toBe(false);
    expect(resolved.initialMask).toBe("image");
  });

  it("maps nested overrides and shared morph interval", () => {
    const resolved = resolvePixelGridConfig({
      colors: ["#fff"],
      gap: 5,
      expandEase: 0.1,
      breathSpeed: 1,
      hoverEffects: {
        mode: "reactive",
        radius: 90,
        shape: "vignette"
      },
      rippleEffects: {
        speed: 2,
        thickness: 12,
        strength: 99,
        maxRipples: 3
      },
      breathing: {
        enabled: true,
        speed: 2.2
      },
      autoMorph: {
        intervalMs: 700
      },
      initialMask: "text"
    });

    expect(resolved.hoverEffects.mode).toBe("reactive");
    expect(resolved.hoverEffects.radiusY).toBe(90);
    expect(resolved.rippleEffects.thickness).toBe(12);
    expect(resolved.breathing.radius).toBe(90);
    expect(resolved.autoMorph.holdImageMs).toBe(700);
    expect(resolved.autoMorph.holdTextMs).toBe(700);
    expect(resolved.initialMask).toBe("text");
  });
});
