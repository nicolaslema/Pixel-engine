import { PixelBuffer } from "./PixelBuffer";

export interface GridOptions {
  width: number;
  height: number;
  pixelSize: number;
  gap: number;
}

/**
 * Construye un PixelBuffer completamente inicializado.
 */
export class GridBuilder {
  static build(options: GridOptions): PixelBuffer {
    const { width, height, pixelSize, gap } = options;

    const cell = pixelSize + gap;

    const columns = Math.floor(width / cell);
    const rows = Math.floor(height / cell);

    const count = rows * columns;

    const positions = new Float32Array(count * 2);
    const activationRead = new Float32Array(count);
    const activationWrite = new Float32Array(count);
    const baseActivation = new Float32Array(count);
    const colorIndex = new Uint16Array(count);

    let index = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const x = col * cell;
        const y = row * cell;

        positions[index * 2] = x;
        positions[index * 2 + 1] = y;

        activationRead[index] = 0;
        activationWrite[index] = 0;
        baseActivation[index] = 0;
        colorIndex[index] = 0;

        index++;
      }
    }

    return {
      count,
      positions,
      activationRead,
      activationWrite,
      baseActivation,
      colorIndex
    };
  }
}
