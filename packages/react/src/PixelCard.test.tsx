import React from "react";
import { describe, expect, it, vi } from "vitest";
import { createRoot, Root } from "react-dom/client";
import { act } from "react";
import { PixelCard } from "./PixelCard";

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

describe("PixelCard", () => {
  it("renders in grid mode and forwards grid interaction callbacks", () => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const onRipple = vi.fn();
    const createEngine = vi.fn(() => ({
      addEntity: vi.fn(),
      removeEntity: vi.fn(),
      start: vi.fn(),
      destroy: vi.fn(),
      resize: vi.fn()
    })) as never;
    const triggerRipple = vi.fn();
    const createGridEffect = vi.fn(() => ({
      triggerRipple
    })) as never;

    const { container, root } = createHost();
    act(() => {
      root.render(
        <PixelCard
          width={320}
          height={180}
          gridConfig={{
            colors: ["#334155", "#475569", "#64748b"],
            gap: 6,
            expandEase: 0.08,
            breathSpeed: 1
          }}
          createEngine={createEngine}
          createGridEffect={createGridEffect}
          onRipple={onRipple}
        >
          <span>Content</span>
        </PixelCard>
      );
    });

    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    vi.spyOn(canvas as HTMLCanvasElement, "getBoundingClientRect").mockReturnValue({
      left: 2,
      top: 3,
      width: 320,
      height: 180,
      right: 322,
      bottom: 183,
      x: 2,
      y: 3,
      toJSON: () => ({})
    } as DOMRect);

    act(() => {
      canvas?.dispatchEvent(new MouseEvent("click", { clientX: 12, clientY: 13 }));
    });

    expect(triggerRipple).toHaveBeenCalledWith(10, 10);
    expect(onRipple).toHaveBeenCalledWith(expect.objectContaining({ x: 10, y: 10 }));
    expect(container.textContent).toContain("Content");

    cleanupHost(container, root);
  });

  it("renders in engine mode when gridConfig is not provided", () => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const createEngine = vi.fn(() => ({
      start: vi.fn(),
      destroy: vi.fn(),
      resize: vi.fn()
    })) as never;

    const { container, root } = createHost();
    act(() => {
      root.render(
        <PixelCard width={320} height={180} createEngine={createEngine}>
          <span>Engine Content</span>
        </PixelCard>
      );
    });

    expect(createEngine).toHaveBeenCalledTimes(1);
    expect(container.querySelector("canvas")).not.toBeNull();
    expect(container.textContent).toContain("Engine Content");

    cleanupHost(container, root);
  });
});
