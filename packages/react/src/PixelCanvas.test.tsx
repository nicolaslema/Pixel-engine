import React from "react";
import { describe, expect, it, vi } from "vitest";
import { createRoot, Root } from "react-dom/client";
import { act } from "react";
import { PixelCanvas } from "./PixelCanvas";

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

describe("PixelCanvas", () => {
  it("renders a canvas and merges styles", () => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const createEngine = vi.fn(() => ({
      start: vi.fn(),
      destroy: vi.fn(),
      resize: vi.fn()
    })) as never;

    const { container, root } = createHost();
    act(() => {
      root.render(
        <PixelCanvas
          width={300}
          height={200}
          className="pixel-test"
          style={{ opacity: 0.5 }}
          createEngine={createEngine}
        />
      );
    });

    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas?.className).toBe("pixel-test");
    expect(canvas?.style.opacity).toBe("0.5");

    cleanupHost(container, root);
  });
});
