import { PixelEngine } from "../src/core/PixelEngine";
import { PixelGridEffect } from "../src/entities/PixelGridEffect";

const canvas = document.getElementById("app") as HTMLCanvasElement;

const width = 800;
const height = 600;

const engine = new PixelEngine({
  canvas,
  width,
  height,
});

const effect = new PixelGridEffect(
  engine,
  width,
  height,
  {
    colors: ["#334155", "#475569", "#64748b"],
    gap: 6,
    expandEase: 0.08,
    breathSpeed: 0.2,

    rippleSpeed: 3,
    rippleThickness: 5,
    rippleStrength: 5,

    hoverRadius: 100,
    organicRadius: 500,
    organicStrength: 1,
    organicSpeed: 0.002,

    maxRipples: 30
  },
  {
    ripple:true,
    hover: true,
  }
);

engine.addEntity(effect);

// Trigger ripple on click
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  effect.triggerRipple(
    e.clientX - rect.left,
    e.clientY - rect.top
  );
});

engine.start();
