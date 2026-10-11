import { useEffect, useMemo, useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import {
  getCropPoints,
  getCropSettings,
  getInitalCrop,
  snapRectToRatio,
} from "../utils/crop";
import type { CropRect, Direction } from "../types";
import { emitCropUpdate, emitClipPathUpdate } from "../eventBus";
import { useMobile } from "../hooks";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function applyRect(el: HTMLDivElement, { x, y, w, h }: CropRect): void {
  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
  el.style.width = `${w}%`;
  el.style.height = `${h}%`;
}

// offsetWidth/offsetLeft are rounded to whole pixels, which is enough to skew
// a fixed ratio by several image pixels, so read the fractional box instead
function getFrameSize(el: HTMLElement): { frameW: number; frameH: number } {
  const { width, height } = el.getBoundingClientRect();
  return { frameW: width, frameH: height };
}

function toPixels(
  { x, y, w, h }: CropRect,
  frameW: number,
  frameH: number,
): CropRect {
  return {
    x: (x / 100) * frameW,
    y: (y / 100) * frameH,
    w: (w / 100) * frameW,
    h: (h / 100) * frameH,
  };
}

function toPercent(
  { x, y, w, h }: CropRect,
  frameW: number,
  frameH: number,
): CropRect {
  return {
    x: (x / frameW) * 100,
    y: (y / frameH) * 100,
    w: (w / frameW) * 100,
    h: (h / frameH) * 100,
  };
}

type UseCropInteractionArgs = {
  boxRef: React.RefObject<HTMLDivElement | null>;
};

export const useCropInteraction = ({ boxRef }: UseCropInteractionArgs) => {
  const { currentAction, getLastHistoryItem, eventBus } = usePixediContext();
  const mobile = useMobile();

  const { width, height } = getLastHistoryItem();
  const { ratio, isFree } = getCropSettings(currentAction) ?? {
    ratio: 1,
    isFree: true,
  };

  const initialCrop = useMemo(
    () => getInitalCrop(ratio, width, height),
    [ratio, width, height],
  );

  const pointerIdRef = useRef<number | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const directionRef = useRef<Direction | "">("");
  // the crop rect lives here in frame percentages and is never read back from
  // the dom, so repeated gestures cannot accumulate layout rounding errors
  const rectRef = useRef<CropRect>(initialCrop);
  const startRectRef = useRef<CropRect>(initialCrop);

  useEffect(() => {
    rectRef.current = initialCrop;
    emitClipPathUpdate(eventBus, initialCrop);
  }, [initialCrop, eventBus]);

  const commit = (elCrop: HTMLDivElement, rect: CropRect) => {
    rectRef.current = rect;
    applyRect(elCrop, rect);

    emitCropUpdate(eventBus, {
      x: Math.round((rect.x / 100) * width),
      y: Math.round((rect.y / 100) * height),
      w: Math.round((rect.w / 100) * width),
      h: Math.round((rect.h / 100) * height),
    });
    emitClipPathUpdate(eventBus, rect);
  };

  // handles call this before the event bubbles up to the box, which then
  // starts the gesture as a resize instead of a move
  const handleCropStart = (type: Direction, cursor?: string) => {
    if (pointerIdRef.current !== null) return;
    directionRef.current = type;
    if (!mobile && boxRef.current) {
      boxRef.current.style.cursor = `${cursor}-resize`;
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== null) return;
    if (e.button !== 0) {
      directionRef.current = "";
      e.currentTarget.style.cursor = "";
      return;
    }

    // no preventDefault: it would suppress the compatibility mousedown that
    // click-outside listeners rely on; touch-action/user-select cover the rest
    e.currentTarget.setPointerCapture(e.pointerId);

    pointerIdRef.current = e.pointerId;
    startRectRef.current = rectRef.current;
    startPointRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== pointerIdRef.current || !startPointRef.current) return;

    const elCrop = e.currentTarget;
    const parent = elCrop.parentElement;
    if (!parent) return;

    const { frameW, frameH } = getFrameSize(parent);
    const start = startPointRef.current;

    if (directionRef.current) {
      const resized = getCropPoints(
        directionRef.current,
        isFree,
        ratio,
        start.x,
        start.y,
        e.clientX,
        e.clientY,
        frameW,
        frameH,
        toPixels(startRectRef.current, frameW, frameH),
        toPixels(rectRef.current, frameW, frameH),
      );
      const rect = toPercent(resized, frameW, frameH);
      commit(
        elCrop,
        isFree ? rect : snapRectToRatio(rect, ratio, width, height),
      );
      return;
    }

    const { x, y, w, h } = startRectRef.current;
    const dx = ((e.clientX - start.x) / frameW) * 100;
    const dy = ((e.clientY - start.y) / frameH) * 100;

    commit(elCrop, {
      x: clamp(x + dx, 0, Math.max(0, 100 - w)),
      y: clamp(y + dy, 0, Math.max(0, 100 - h)),
      w,
      h,
    });
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== pointerIdRef.current) return;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    pointerIdRef.current = null;
    startPointRef.current = null;
    directionRef.current = "";
    e.currentTarget.style.cursor = "";
  };

  const boxHandlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
  };

  return { handleCropStart, boxHandlers, initialCrop };
};
