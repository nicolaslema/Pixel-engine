import { CSSProperties } from "react";
import { usePixelEngine } from "./usePixelEngine";
import { PixelCanvasProps } from "./types";

const baseStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%"
};

export function PixelCanvas(props: PixelCanvasProps) {
  const { className, style, ...engineOptions } = props;
  const { canvasRef } = usePixelEngine(engineOptions);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ ...baseStyle, ...style }}
    />
  );
}
