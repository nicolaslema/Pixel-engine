import { describe, it, expect } from "vitest";
import { Time } from "../core/Time";

describe("Time", () => {
  it("should initialize with zero delta", () => {
    const time = new Time();
    expect(time.delta).toBe(0);
    expect(time.elapsed).toBe(0);
  });

  it("should calculate delta in milliseconds", () => {
    const time = new Time();

    time.update(16);
    time.update(33);

    expect(time.delta).toBe(33);
    expect(time.unscaledDelta).toBe(33);
    expect(time.elapsed).toBe(49);
  });

  it("should apply timeScale to delta", () => {
    const time = new Time();
    time.timeScale = 0.5;

    time.update(20);

    expect(time.delta).toBe(10);
    expect(time.unscaledDelta).toBe(20);
  });
});
