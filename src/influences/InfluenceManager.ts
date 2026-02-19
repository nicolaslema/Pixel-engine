import { Influence } from "./Influence";

interface InfluenceManagerOptions {
  compressionStrength?: number; // k exponencial
  enableSmoothing?: boolean;
  smoothingRadius?: number; // 1 = vecinos inmediatos
}

export class InfluenceManager {
  private influences: Influence[] = [];

  private compressionStrength: number;
  private enableSmoothing: boolean;
  private smoothingRadius: number;

  constructor(
    private gap: number,
    private columns: number,
    private rows: number,
    options: InfluenceManagerOptions = {}
  ) {
    this.compressionStrength =
      options.compressionStrength ?? 2.2;

    this.enableSmoothing =
      options.enableSmoothing ?? false;

    this.smoothingRadius =
      options.smoothingRadius ?? 1;
  }

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
    // ordenar por prioridad (mayor primero)
    this.influences.sort(
      (a, b) => b.priority - a.priority
    );

    // Aplicar influencias
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

    // Compresión exponencial suave
    this.compressField(cells);

    // Smoothing opcional
    if (this.enableSmoothing) {
      this.smoothField(cells, getCellIndex);
    }
  }

  // ----------------------------------------
  // COMPRESIÓN EXPONENCIAL
  // ----------------------------------------

  private compressField(cells: any[]): void {
    const k = this.compressionStrength;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];

      const max = cell.maxSize;
      const value = cell.targetSize;

      // f(x) = max * (1 - e^(-k x / max))
      cell.targetSize =
        max * (1 - Math.exp(-k * value / max));
    }
  }

  // ----------------------------------------
  // FIELD SMOOTHING (BOX BLUR LOCAL)
  // ----------------------------------------

  private smoothField(
    cells: any[],
    getCellIndex: (x: number, y: number) => number
  ): void {
    const temp = new Float32Array(cells.length);

    for (let x = 0; x < this.columns; x++) {
      for (let y = 0; y < this.rows; y++) {
        const index = getCellIndex(x, y);

        let sum = 0;
        let count = 0;

        for (
          let dx = -this.smoothingRadius;
          dx <= this.smoothingRadius;
          dx++
        ) {
          for (
            let dy = -this.smoothingRadius;
            dy <= this.smoothingRadius;
            dy++
          ) {
            const nx = x + dx;
            const ny = y + dy;

            if (
              nx >= 0 &&
              nx < this.columns &&
              ny >= 0 &&
              ny < this.rows
            ) {
              const neighborIndex =
                getCellIndex(nx, ny);

              sum += cells[neighborIndex].targetSize;
              count++;
            }
          }
        }

        temp[index] = sum / count;
      }
    }

    for (let i = 0; i < cells.length; i++) {
      cells[i].targetSize = temp[i];
    }
  }
}
