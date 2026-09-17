import type { ActionFilter, CropRect } from "./types";

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

export const emitFilterUpdate = (
  eventBus: EventTarget,
  detail: ActionFilter,
) => {
  const event = new CustomEvent<ActionFilter>("filter-update", { detail });
  eventBus.dispatchEvent(event);
};

export const emitCompareUpdate = (eventBus: EventTarget, detail: number) => {
  const event = new CustomEvent<number>("compare-update", { detail });
  eventBus.dispatchEvent(event);
};
