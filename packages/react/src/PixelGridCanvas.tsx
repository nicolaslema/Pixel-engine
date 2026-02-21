import { CSSProperties } from "react";
import { usePixelGridEffect } from "./usePixelGridEffect";
import { PixelGridCanvasProps } from "./types";

const baseStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%"
};

export function PixelGridCanvas(props: PixelGridCanvasProps) {
  const { className, style, ...gridOptions } = props;
  const { canvasRef } = usePixelGridEffect(gridOptions);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ ...baseStyle, ...style }}
    />
  );
}
