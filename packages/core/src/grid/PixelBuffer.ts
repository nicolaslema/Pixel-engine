/**
 * Representa la memoria estructurada del grid.
 * No contiene lógica.
 * Solo datos optimizados en TypedArrays.
 */
export interface PixelBuffer {
  /**
   * Cantidad total de pixels del grid.
   */
  count: number;

  /**
   * Posiciones 2D intercaladas.
   * [x0, y0, x1, y1, x2, y2 ...]
   */
  positions: Float32Array;

  /**
   * Estado de activación estable del frame actual.
   * Solo lectura para efectos.
   */
  activationRead: Float32Array;

  /**
   * Buffer donde los efectos escriben el próximo estado.
   */
  activationWrite: Float32Array;

  /**
   * Activación base permanente.
   * Se mezcla cada frame.
   */
  baseActivation: Float32Array;

  /**
   * Índice de color por pixel.
   */
  colorIndex: Uint16Array;
}