import { PixelEngine } from "../src/core/PixelEngine";
import { PixelGridEffect } from "../src/entities/PixelGridEffect";

const canvas = document.getElementById("app") as HTMLCanvasElement;

const width = 800;
const height = 600;

const engine = new PixelEngine({
  canvas,
  width,
  height
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
    canvasBackground: "#00ffb7",
    

    hoverEffects: {
      mode: "reactive",
      radius: 100,
      radiusY: 100,
      shape: "circle",
      strength: 1,
      interactionScope: "all",
      deactivate: 0.85,
      displace: 4,
      jitter: 1.2,
     
    },
    rippleEffects: {
      speed: 0.5,
      thickness: 50,
      strength: 30,
      maxRipples: 50,
      enabled: true,
      deactivateMultiplier: 0.7,
      displaceMultiplier: 1.25,
      jitterMultiplier: 1.2,
      
    
    },
    breathing: {
      enabled: true,
      speed: 1.9,
      radius: 140,
      radiusY: 100,
      shape: "circle",
      strength: 0.6,
      minOpacity: 0.45,
      maxOpacity: 1,
      affectHover: true,
      affectImage: true,
      affectText: true
    },
    autoMorph: {
      enabled: false,
      holdImageMs: 100,
      holdTextMs: 100,
      morphDurationMs: 100,
      intervalMs: 1050
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

    organicRadius: 500,
    organicStrength: 0.2,
    organicSpeed: 0.009,

  },
  {
    ripple:true,
    hover: true,
    
    

  
  }
);

engine.addEntity(effect);

type PlaygroundBackgroundControls = {
  pageColor: string;
};

const backgroundControls: PlaygroundBackgroundControls = {
  pageColor: "#0b1020"
};

document.body.style.backgroundColor = backgroundControls.pageColor;

const panel = document.createElement("div");
panel.style.position = "fixed";
panel.style.top = "12px";
panel.style.left = "12px";
panel.style.zIndex = "9999";
panel.style.padding = "10px";
panel.style.borderRadius = "8px";
panel.style.background = "rgba(15, 23, 42, 0.9)";
panel.style.color = "#e2e8f0";
panel.style.fontFamily = "system-ui, sans-serif";
panel.style.fontSize = "12px";
panel.style.display = "grid";
panel.style.gap = "8px";
panel.style.minWidth = "220px";

const title = document.createElement("div");
title.textContent = "Page Background";
title.style.fontWeight = "700";
panel.appendChild(title);

const pageColorRow = document.createElement("label");
pageColorRow.style.display = "grid";
pageColorRow.style.gap = "4px";
const pageColorText = document.createElement("span");
pageColorText.textContent = "Page background";
const pageColorInput = document.createElement("input");
pageColorInput.type = "color";
pageColorInput.value = backgroundControls.pageColor;
pageColorRow.appendChild(pageColorText);
pageColorRow.appendChild(pageColorInput);
panel.appendChild(pageColorRow);

const applyBackground = () => {
  document.body.style.backgroundColor = backgroundControls.pageColor;
};

pageColorInput.addEventListener("input", () => {
  backgroundControls.pageColor = pageColorInput.value;
  applyBackground();
});

applyBackground();
document.body.appendChild(panel);

// Trigger ripple on click
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  effect.triggerRipple(
    e.clientX - rect.left,
    e.clientY - rect.top
  );
});

engine.start();
