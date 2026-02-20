import { InfluenceManager } from "../../../influences/InfluenceManager";
import { ImageMaskInfluence } from "../../../influences/Masks/ImageMaskInfluence";
import { TextMaskInfluence } from "../../../influences/Masks/TextMaskInfluence";
import { MorphMaskInfluence } from "../../../influences/Masks/MorphMaskInfluence";
import { MaskInfluence } from "../../../influences/Masks/MaskInfluence";
import { InitialMask, ResolvedPixelGridConfig } from "../types";

type MorphState = "image" | "toText" | "text" | "toImage";

export interface MaskStateMachine {
  imageMask: ImageMaskInfluence | null;
  textMask: TextMaskInfluence | null;
  morphMask: MorphMaskInfluence | null;
  update(delta: number): void;
}

interface CreateMaskStateMachineParams {
  influenceManager: InfluenceManager;
  autoMorph: ResolvedPixelGridConfig["autoMorph"];
  initialMask: InitialMask;
  imageMask: ImageMaskInfluence | null;
  textMask: TextMaskInfluence | null;
}

export function createMaskStateMachine(
  params: CreateMaskStateMachineParams
): MaskStateMachine {
  const { influenceManager, autoMorph } = params;

  let imageMask = params.imageMask;
  let textMask = params.textMask;
  let morphMask: MorphMaskInfluence | null = null;
  let morphState: MorphState =
    params.initialMask === "image" ? "image" : "text";
  let stateTimer = 0;

  addInitialMask(influenceManager, params.initialMask, imageMask, textMask);

  const startMorph = (
    from: MaskInfluence,
    to: MaskInfluence,
    nextState: MorphState
  ) => {
    influenceManager.remove(from);
    influenceManager.remove(to);
    morphMask = new MorphMaskInfluence(from, to, autoMorph.morphDurationMs);
    influenceManager.add(morphMask);
    morphState = nextState;
    stateTimer = 0;
  };

  const update = (delta: number) => {
    if (!autoMorph.enabled) return;
    if (!imageMask || !textMask) return;

    if (morphMask && !morphMask.isAlive()) {
      influenceManager.remove(morphMask);
      morphMask = null;

      if (morphState === "toText") {
        influenceManager.add(textMask);
        morphState = "text";
      } else if (morphState === "toImage") {
        influenceManager.add(imageMask);
        morphState = "image";
      }

      stateTimer = 0;
      return;
    }

    if (morphMask) return;

    stateTimer += delta;
    const imageWaitMs = autoMorph.holdImageMs + autoMorph.intervalMs;
    const textWaitMs = autoMorph.holdTextMs + autoMorph.intervalMs;

    if (morphState === "image" && stateTimer >= imageWaitMs) {
      startMorph(imageMask, textMask, "toText");
      return;
    }

    if (morphState === "text" && stateTimer >= textWaitMs) {
      startMorph(textMask, imageMask, "toImage");
    }
  };

  return {
    get imageMask() {
      return imageMask;
    },
    get textMask() {
      return textMask;
    },
    get morphMask() {
      return morphMask;
    },
    update
  };
}

function addInitialMask(
  influenceManager: InfluenceManager,
  initialMask: InitialMask,
  imageMask: ImageMaskInfluence | null,
  textMask: TextMaskInfluence | null
): void {
  if (initialMask === "image") {
    if (imageMask) influenceManager.add(imageMask);
    else if (textMask) influenceManager.add(textMask);
    return;
  }

  if (textMask) influenceManager.add(textMask);
  else if (imageMask) influenceManager.add(imageMask);
}
