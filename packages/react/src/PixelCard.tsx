import { CSSProperties, PropsWithChildren } from "react";
import { PixelCanvas } from "./PixelCanvas";
import { PixelGridCanvas } from "./PixelGridCanvas";
import { PixelCanvasProps, PixelGridCanvasProps } from "./types";

interface PixelCardBaseProps extends PropsWithChildren {
  containerClassName?: string;
  containerStyle?: CSSProperties;
  overlayClassName?: string;
  overlayStyle?: CSSProperties;
  overlayPointerEvents?: CSSProperties["pointerEvents"];
  radius?: number;
  padding?: number;
}

export type PixelCardProps = PixelCardBaseProps & (PixelCanvasProps | PixelGridCanvasProps);

const surfaceStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden"
};

const canvasStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "block",
  width: "100%",
  height: "100%"
};

export function PixelCard({
  children,
  radius = 16,
  padding = 16,
  className,
  style,
  containerClassName,
  containerStyle,
  overlayClassName,
  overlayStyle,
  overlayPointerEvents = "none",
  ...canvasProps
}: PixelCardProps) {
  const isGridCard =
    "gridConfig" in canvasProps ||
    "preset" in canvasProps ||
    "mask" in canvasProps ||
    "rippleTrigger" in canvasProps ||
    "onGridReady" in canvasProps;

  const mergedContainerStyle: CSSProperties = {
    ...surfaceStyle,
    borderRadius: radius,
    ...containerStyle
  };
  const mergedOverlayStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
    pointerEvents: overlayPointerEvents,
    borderRadius: radius,
    padding,
    ...overlayStyle
  };
  const mergedCanvasStyle: CSSProperties = {
    ...canvasStyle,
    ...style
  };

  return (
    <div className={containerClassName} style={mergedContainerStyle}>
      {isGridCard ? (
        <PixelGridCanvas
          {...(canvasProps as PixelGridCanvasProps)}
          className={className}
          style={mergedCanvasStyle}
        />
      ) : (
        <PixelCanvas
          {...(canvasProps as PixelCanvasProps)}
          className={className}
          style={mergedCanvasStyle}
        />
      )}
      <div className={overlayClassName} style={mergedOverlayStyle}>
        {children}
      </div>
    </div>
  );
}
