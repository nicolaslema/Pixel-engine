import { describe, it, expect } from "vitest";
import { PixelCell } from "./PixelCell";

describe("PixelCell", () => {
  it("resets visual state to base color and no offset", () => {
    const cell = new PixelCell(0, 0, "#ffffff", 5, 1);

    cell.color = "#000000";
    cell.offsetX = 3;
    cell.offsetY = -2;

    cell.resetVisualState();

    expect(cell.color).toBe("#ffffff");
    expect(cell.offsetX).toBe(0);
    expect(cell.offsetY).toBe(0);
  });
});
