import { PixelBuffer } from "./PixelBuffer";

/**
 * Copia activationWrite hacia activationRead.
 * Luego limpia activationWrite.
 */
export function swapBuffers(buffer: PixelBuffer) {
  const { count, activationRead, activationWrite } = buffer;

  for (let i = 0; i < count; i++) {
    activationRead[i] = activationWrite[i];
    activationWrite[i] = 0;
  }
}

/**
 * Mezcla el estado base con el estado actual.
 * baseActivation actúa como mínimo permanente.
 */
export function applyBaseActivation(buffer: PixelBuffer) {
  const { count, activationRead, baseActivation } = buffer;

  for (let i = 0; i < count; i++) {
    activationRead[i] = Math.max(
      activationRead[i],
      baseActivation[i]
    );
  }
}
