import { Influence } from "./Influence";

export class InfluenceManager {
  private influences: Influence[] = [];

  constructor(
    private gap: number,
    private columns: number,
    private rows: number
  ) {}

  add(influence: Influence): void {
    this.influences.push(influence);
  }

  removeDead(): void {
    this.influences =
      this.influences.filter(i => i.isAlive());
  }

  update(delta: number): void {
    for (let i = 0; i < this.influences.length; i++) {
      this.influences[i].update(delta);
    }

    this.removeDead();
  }

  apply(
    cells: any[],
    getCellIndex: (x: number, y: number) => number
  ): void {
    // ordenar por prioridad
    this.influences.sort(
      (a, b) => b.priority - a.priority
    );

    for (let i = 0; i < this.influences.length; i++) {
      const influence = this.influences[i];
      const bounds = influence.getBounds();

      const minCol = Math.max(
        0,
        Math.floor(bounds.minX / this.gap)
      );
      const maxCol = Math.min(
        this.columns - 1,
        Math.floor(bounds.maxX / this.gap)
      );

      const minRow = Math.max(
        0,
        Math.floor(bounds.minY / this.gap)
      );
      const maxRow = Math.min(
        this.rows - 1,
        Math.floor(bounds.maxY / this.gap)
      );

      for (let x = minCol; x <= maxCol; x++) {
        for (let y = minRow; y <= maxRow; y++) {
          const cell =
            cells[getCellIndex(x, y)];

          const value =
            influence.getInfluence(
              cell.x,
              cell.y,
              cell.maxSize
            );

          if (value <= 0) continue;

          switch (influence.blendMode) {
            case "max":
              cell.targetSize = Math.max(
                cell.targetSize,
                value
              );
              break;

            case "add":
              cell.targetSize += value;
              break;

            case "multiply":
              cell.targetSize *= value;
              break;

            case "override":
              cell.targetSize = value;
              break;
          }
        }
      }
    }

    // clamp final
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];

      if (cell.targetSize > cell.maxSize) {
        cell.targetSize = cell.maxSize;
      }
    }
  }
}
