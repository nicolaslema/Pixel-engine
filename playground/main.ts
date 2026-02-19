import { PixelEngine } from "../src/core/PixelEngine";
import { PixelGridEffect } from "../src/entities/PixelGridEffect";

const canvas = document.getElementById("app") as HTMLCanvasElement;

const width = 1000;
const height = 700;

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
    gap: 5,
    expandEase: 0.08,
    breathSpeed: 0.9,

    rippleSpeed: 0.5,
    rippleThickness: 50,
    rippleStrength: 30,
    maxRipples: 50,

    hoverRadius: 100,
    organicRadius: 400,
    organicStrength: 1,
    organicSpeed: 0.0002,

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
