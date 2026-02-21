import { CSSProperties, PropsWithChildren } from "react";
import { PixelCanvas } from "./PixelCanvas";
import { PixelCanvasProps } from "./types";

export interface PixelSurfaceProps extends PixelCanvasProps, PropsWithChildren {
  containerClassName?: string;
  containerStyle?: CSSProperties;
  overlayClassName?: string;
  overlayStyle?: CSSProperties;
  overlayPointerEvents?: CSSProperties["pointerEvents"];
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
  overlayPointerEvents = "none",
  style,
  ...canvasProps
}: PixelSurfaceProps) {
  const mergedOverlayStyle: CSSProperties = {
    ...overlayStyleBase,
    pointerEvents: overlayPointerEvents,
    ...overlayStyle
  };

  return (
    <div className={containerClassName} style={{ ...surfaceStyle, ...containerStyle }}>
      <PixelCanvas {...canvasProps} style={{ ...canvasStyle, ...style }} />
      <div className={overlayClassName} style={mergedOverlayStyle}>
        {children}
      </div>
    </div>
  );
}
