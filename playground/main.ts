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
    gap: 7,
    expandEase: 0.08,
    breathSpeed: 0.9,

    rippleSpeed: 0.5,
    rippleThickness: 50,
    rippleStrength: 30,
    maxRipples: 50,

    hoverRadius: 100,
    hoverRadiusY: 100,
    hoverShape: "circle",
    hoverMode: "reactive",
    reactiveHover: {
      radius: 100,
      radiusY: 90,
      shape: "circle",
      strength: 1,
      interactionScope: "all",
      deactivate: 0.85,
      displace: 4,
      jitter: 1.2,
      tintPalette: ["#60a5fa", "#f59e0b", "#f43f5e"]
    },
    reactiveRipple: {
      enabled: true,
      displaceMultiplier: 1.25,
      jitterMultiplier: 1.2,
      tintPalette: ["#22d3ee", "#fb7185", "#fde047"]
    },
    autoMorph: {
      enabled: false,
      holdImageMs: 100,
      holdTextMs: 100,
      morphDurationMs: 100,
      intervalMs: 850
    },
    initialMask: "image",
    imageMask: {
      src: "/src/assets/cat.png",
      centerX: 400,
      centerY: 300,
      scale: 2,
      sampleMode: "threshold",
      strength: 1.4
    },
    textMask: {
      text: "HERZA",
      centerX: 400,
      centerY: 300,
      font: "bold 140px Arial",
      strength: 0.9,
      blurRadius: 2
    },

    organicRadius: 1000,
    organicStrength: 0.5,
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
