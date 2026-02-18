import { describe, it, expect } from "vitest";
import { Time } from "../core/Time";

describe("Time", () => {
  it("should initialize with zero delta", () => {
    const time = new Time();
    expect(time.delta).toBe(0);
  });

  it("should calculate delta correctly", () => {
    const time = new Time();

    time.update(1000);
    time.update(2000);

    expect(time.delta).toBeCloseTo(1);
  });
});
