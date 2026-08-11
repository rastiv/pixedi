import type { CropRect, Sizes } from "./types";

export const eventBus = new EventTarget();

export const emitCropUpdate = (detail: CropRect) => {
  const event = new CustomEvent<CropRect>("crop-update", { detail });
  eventBus.dispatchEvent(event);
};

export const emitResizeUpdate = (detail: number) => {
  const event = new CustomEvent<number>("resize-update", { detail });
  eventBus.dispatchEvent(event);
};
