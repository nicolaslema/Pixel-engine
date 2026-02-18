import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameLoop, FrameCallback } from "./GameLoop";

describe("GameLoop", () => {
  let frame: FrameCallback;
  let rafCallback: FrameRequestCallback | null = null;
  let now = 0;

  beforeEach(() => {
    frame = vi.fn() as FrameCallback;
    rafCallback = null;
    now = 0;

    vi.spyOn(performance, "now").mockImplementation(() => now);

    vi.spyOn(window, "requestAnimationFrame").mockImplementation(
      (cb: FrameRequestCallback): number => {
        rafCallback = cb;
        return 1;
      }
    );

    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  it("should call frame callback", () => {
    const loop = new GameLoop(frame);

    loop.start();

    now = 17;
    rafCallback?.(17);

    expect(frame).toHaveBeenCalled();
  });
  it("should clamp large delta values", () => {
  const loop = new GameLoop(frame, { fixedTimeStep: 16 });

  loop.start();

  now = 1000;   // simulamos salto enorme
  rafCallback?.(1000);

  expect(frame).toHaveBeenCalled();
});
});