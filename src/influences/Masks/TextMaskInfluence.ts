import { MaskInfluence } from "./MaskInfluence";

interface TextMaskOptions {
  font: string;
  strength?: number;
  blurRadius?: number;
}

export class TextMaskInfluence extends MaskInfluence {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private text: string;
  private font: string;
  private blurRadius: number;

  constructor(
    text: string,
    centerX: number,
    centerY: number,
    options: TextMaskOptions
  ) {
    super(centerX, centerY, options.strength ?? 1);

    this.text = text;
    this.font = options.font;
    this.blurRadius = options.blurRadius ?? 0;

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;

    this.generateMask();
  }

  update(): void {}

  generateMask(): void {
    this.ctx.font = this.font;

    const metrics = this.ctx.measureText(this.text);

    this.width = Math.ceil(metrics.width);
    this.height = Math.ceil(
      metrics.actualBoundingBoxAscent +
      metrics.actualBoundingBoxDescent
    );

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.ctx.font = this.font;
    this.ctx.fillStyle = "white";
    this.ctx.fillText(
      this.text,
      0,
      metrics.actualBoundingBoxAscent
    );

    const imageData = this.ctx.getImageData(
      0,
      0,
      this.width,
      this.height
    );

    const data = imageData.data;

    this.buffer = new Float32Array(
      this.width * this.height
    );

    for (let i = 0; i < this.buffer.length; i++) {
      const alpha = data[i * 4 + 3] / 255;
      this.buffer[i] = alpha;
    }

    if (this.blurRadius > 0) {
      this.applyBlur();
    }
  }

  private applyBlur() {
    const temp = new Float32Array(this.buffer.length);

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        let sum = 0;
        let count = 0;

        for (
          let dx = -this.blurRadius;
          dx <= this.blurRadius;
          dx++
        ) {
          for (
            let dy = -this.blurRadius;
            dy <= this.blurRadius;
            dy++
          ) {
            const nx = x + dx;
            const ny = y + dy;

            if (
              nx >= 0 &&
              nx < this.width &&
              ny >= 0 &&
              ny < this.height
            ) {
              sum +=
                this.buffer[
                  ny * this.width + nx
                ];
              count++;
            }
          }
        }

        temp[y * this.width + x] =
          sum / count;
      }
    }

    this.buffer = temp;
  }
}
