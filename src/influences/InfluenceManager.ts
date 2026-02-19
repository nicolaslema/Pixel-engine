import { Influence } from "./Influence";

interface InfluenceManagerOptions {
  compressionStrength?: number;
  enableSmoothing?: boolean;
  smoothingRadius?: number;
}

export class InfluenceManager {

  private influences: Influence[] = [];
  private dirty = false;

  private compressionStrength: number;
  private enableSmoothing: boolean;
  private smoothingRadius: number;

  constructor(
    private gap: number,
    private columns: number,
    private rows: number,
    options: InfluenceManagerOptions = {}
  ) {
    this.compressionStrength = options.compressionStrength ?? 2.2;
    this.enableSmoothing = options.enableSmoothing ?? false;
    this.smoothingRadius = options.smoothingRadius ?? 1;
  }

  // ----------------------------------------
  // GESTIÓN
  // ----------------------------------------

  add(influence: Influence): void {
    if (!this.influences.includes(influence)) {
      this.influences.push(influence);
      this.dirty = true;
    }
  }

  remove(influence: Influence): void {
    this.influences = this.influences.filter(i => i !== influence);
    this.dirty = true;
  }

  clear(): void {
    this.influences = [];
    this.dirty = true;
  }

  removeDead(): void {
    const before = this.influences.length;
    this.influences = this.influences.filter(i => i.isAlive());

    if (before !== this.influences.length) {
      this.dirty = true;
    }
  }

  update(delta: number): void {
    for (let i = 0; i < this.influences.length; i++) {
      this.influences[i].update(delta);
    }

    this.removeDead();
  }

  // ----------------------------------------
  // APPLY
  // ----------------------------------------

  apply(
    cells: any[],
    getCellIndex: (x: number, y: number) => number
  ): void {

    if (this.dirty) {
      this.influences.sort((a, b) => b.priority - a.priority);
      this.dirty = false;
    }

    for (let i = 0; i < this.influences.length; i++) {

      const influence = this.influences[i];
      const bounds = influence.getBounds();

      const minCol = Math.max(0, Math.floor(bounds.minX / this.gap));
      const maxCol = Math.min(this.columns - 1, Math.floor(bounds.maxX / this.gap));

      const minRow = Math.max(0, Math.floor(bounds.minY / this.gap));
      const maxRow = Math.min(this.rows - 1, Math.floor(bounds.maxY / this.gap));

      for (let x = minCol; x <= maxCol; x++) {
        for (let y = minRow; y <= maxRow; y++) {

          const index = getCellIndex(x, y);
          const cell = cells[index];

          const value = influence.getInfluence(
            cell.x,
            cell.y,
            cell.maxSize
          );

          if (value <= 0) continue;

          switch (influence.blendMode) {

            case "max":
              cell.targetSize = Math.max(cell.targetSize, value);
              break;

            case "add":
              cell.targetSize += value;
              break;

            case "multiply":
              cell.targetSize = cell.targetSize === 0
                ? value
                : cell.targetSize * value;
              break;

            case "override":
              cell.targetSize = value;
              break;
          }
        }
      }
    }

    this.compressField(cells);

    if (this.enableSmoothing) {
      this.smoothField(cells, getCellIndex);
    }
  }

  // ----------------------------------------
  // COMPRESIÓN
  // ----------------------------------------

  private compressField(cells: any[]): void {

    const k = this.compressionStrength;

    for (let i = 0; i < cells.length; i++) {

      const cell = cells[i];
      const max = cell.maxSize;
      const value = cell.targetSize;

      if (value <= 0) {
        cell.targetSize = 0;
        continue;
      }

      cell.targetSize =
        max * (1 - Math.exp(-k * value / max));
    }
  }

  // ----------------------------------------
  // SMOOTH
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

        for (let dx = -this.smoothingRadius; dx <= this.smoothingRadius; dx++) {
          for (let dy = -this.smoothingRadius; dy <= this.smoothingRadius; dy++) {

            const nx = x + dx;
            const ny = y + dy;

            if (
              nx >= 0 && nx < this.columns &&
              ny >= 0 && ny < this.rows
            ) {
              const nIndex = getCellIndex(nx, ny);
              sum += cells[nIndex].targetSize;
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
