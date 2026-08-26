import type { CropRect } from "./types";

export const emitCropUpdate = (eventBus: EventTarget, detail: CropRect) => {
  const event = new CustomEvent<CropRect>("crop-update", { detail });
  eventBus.dispatchEvent(event);
};

export const emitClipPathUpdate = (eventBus: EventTarget, detail: CropRect) => {
  const event = new CustomEvent<CropRect>("clip-path-update", { detail });
  eventBus.dispatchEvent(event);
};

export const emitResizeUpdate = (eventBus: EventTarget, detail: number) => {
  const event = new CustomEvent<number>("resize-update", { detail });
  eventBus.dispatchEvent(event);
};
