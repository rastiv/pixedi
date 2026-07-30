import type { CropRect } from "./types";

export const eventBus = new EventTarget();

export const emitCropUpdate = (detail: CropRect) => {
  const event = new CustomEvent<CropRect>("crop-update", { detail });
  eventBus.dispatchEvent(event);
};
