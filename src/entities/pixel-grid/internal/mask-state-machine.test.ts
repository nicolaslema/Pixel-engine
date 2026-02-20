import { describe, expect, it } from "vitest";
import { createMaskStateMachine } from "./mask-state-machine";
import { InfluenceManager } from "../../../influences/InfluenceManager";
import { MaskInfluence } from "../../../influences/Masks/MaskInfluence";

class StaticMask extends MaskInfluence {
  constructor() {
    super(0, 0, 1);
    this.width = 1;
    this.height = 1;
    this.buffer = new Float32Array([1]);
  }
  protected onUpdate(): void {}
  protected generateMask(): void {}
}

describe("pixel-grid mask-state-machine", () => {
  it("keeps morph disabled when one mask is missing", () => {
    const manager = new InfluenceManager(1, 1, 1);
    const imageMask = new StaticMask();

    const machine = createMaskStateMachine({
      influenceManager: manager,
      autoMorph: {
        enabled: true,
        holdImageMs: 10,
        holdTextMs: 10,
        morphDurationMs: 10,
        intervalMs: 0
      },
      initialMask: "image",
      imageMask: imageMask as never,
      textMask: null
    });

    expect(() => machine.update(100)).not.toThrow();
    expect(machine.morphMask).toBeNull();
  });
});
