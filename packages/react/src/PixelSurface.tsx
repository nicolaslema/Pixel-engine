import { CSSProperties, PropsWithChildren } from "react";
import { PixelCanvas } from "./PixelCanvas";
import { PixelCanvasProps } from "./types";

export interface PixelSurfaceProps extends PixelCanvasProps, PropsWithChildren {
  containerClassName?: string;
  containerStyle?: CSSProperties;
  overlayClassName?: string;
  overlayStyle?: CSSProperties;
}

const surfaceStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden"
};

const canvasStyle: CSSProperties = {
  position: "absolute",
  inset: 0
};

const overlayStyleBase: CSSProperties = {
  position: "relative",
  zIndex: 1
};

export function PixelSurface({
  children,
  containerClassName,
  containerStyle,
  overlayClassName,
  overlayStyle,
  style,
  ...canvasProps
}: PixelSurfaceProps) {
  return (
    <div className={containerClassName} style={{ ...surfaceStyle, ...containerStyle }}>
      <PixelCanvas {...canvasProps} style={{ ...canvasStyle, ...style }} />
      <div className={overlayClassName} style={{ ...overlayStyleBase, ...overlayStyle }}>
        {children}
      </div>
    </div>
  );
}
