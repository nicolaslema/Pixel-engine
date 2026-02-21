import { IRenderer } from "../../../renderers/IRenderer";
import { PixelCell } from "../../PixelCell";

export function renderPixelCells(
  renderer: IRenderer,
  cells: PixelCell[]
): void {
  const ctx = renderer.getContext();
  let currentColor = "";
  let currentOpacity = -1;

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (cell.size <= 0.5) continue;

    if (cell.color !== currentColor) {
      currentColor = cell.color;
      ctx.fillStyle = currentColor;
    }

    if (cell.opacity !== currentOpacity) {
      currentOpacity = cell.opacity;
      ctx.globalAlpha = currentOpacity;
    }

    const offset = (cell.gap - cell.size) * 0.5;

    ctx.fillRect(
      (cell.x + cell.offsetX + offset) | 0,
      (cell.y + cell.offsetY + offset) | 0,
      cell.size | 0,
      cell.size | 0
    );
  }

  if (currentOpacity !== 1) {
    ctx.globalAlpha = 1;
  }
}
