import React from "react";
import { describe, expect, it, vi } from "vitest";
import { createRoot, Root } from "react-dom/client";
import { act } from "react";
import { PixelGridCanvas } from "./PixelGridCanvas";

function createHost(): { container: HTMLDivElement; root: Root } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  return { container, root };
}

function cleanupHost(container: HTMLDivElement, root: Root): void {
  act(() => root.unmount());
  container.remove();
}

describe("PixelGridCanvas", () => {
  it("renders canvas with declarative grid setup", () => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const createEngine = vi.fn(() => ({
      addEntity: vi.fn(),
      removeEntity: vi.fn(),
      start: vi.fn(),
      destroy: vi.fn(),
      resize: vi.fn()
    })) as never;
    const createGridEffect = vi.fn(() => ({
      triggerRipple: vi.fn()
    })) as never;

    const { container, root } = createHost();
    act(() => {
      root.render(
        <PixelGridCanvas
          width={320}
          height={180}
          className="pixel-grid-canvas"
          gridConfig={{
            colors: ["#334155", "#475569", "#64748b"],
            gap: 6,
            expandEase: 0.08,
            breathSpeed: 1
          }}
          createEngine={createEngine}
          createGridEffect={createGridEffect}
        />
      );
    });

    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas?.className).toBe("pixel-grid-canvas");

    cleanupHost(container, root);
  });
});
