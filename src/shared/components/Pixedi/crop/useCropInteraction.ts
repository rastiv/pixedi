import { useEffect, useMemo, useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { getCropPoints, getInitalCrop, snapRectToRatio } from "../utils/crop";
import type { CropRect, Direction } from "../types";
import { ActionName } from "../types";
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
  const isCrop = currentAction?.name === ActionName.CROP;
  const ratio = isCrop ? currentAction.args.ratio : 1;
  const isFree = isCrop ? currentAction.args.isFree : true;

  const initialCrop = useMemo(
    () => getInitalCrop(ratio, width, height),
    [ratio, width, height],
  );

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

  const handleCropStart = (
    e: React.MouseEvent | React.TouchEvent,
    type: Direction,
    cursor?: string,
  ) => {
    if (!boxRef.current) return;

    e.stopPropagation();
    e.preventDefault();

    startRectRef.current = rectRef.current;

    const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
    const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY;
    startPointRef.current = { x: clientX, y: clientY };
    directionRef.current = type;

    if (!mobile) {
      boxRef.current.style.cursor = `${cursor}-resize`;
      document.body.style.cursor = `${cursor}-resize`;
    }
  };

  useEffect(() => {
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

    const handleDragStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      startRectRef.current = rectRef.current;
      const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
      const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY;
      startPointRef.current = { x: clientX, y: clientY };
      document.body.style.cursor = "move";
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!boxRef.current || !startPointRef.current) return;

      e.preventDefault();

      const elCrop = boxRef.current;
      const parent = elCrop.parentElement;
      if (!parent) return;

      const { frameW, frameH } = getFrameSize(parent);

      if (directionRef.current) {
        handleResize(e, elCrop, frameW, frameH);
        return;
      }

      handleDrag(e, elCrop, frameW, frameH);
    };

    const handleResize = (
      e: MouseEvent | TouchEvent,
      elCrop: HTMLDivElement,
      frameW: number,
      frameH: number,
    ) => {
      if (!startPointRef.current) return;

      const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
      const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY;
      const resized = getCropPoints(
        directionRef.current as Direction,
        isFree,
        ratio,
        startPointRef.current.x,
        startPointRef.current.y,
        clientX,
        clientY,
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
    };

    const handleDrag = (
      e: MouseEvent | TouchEvent,
      elCrop: HTMLDivElement,
      frameW: number,
      frameH: number,
    ) => {
      if (!startPointRef.current) return;

      const { x, y, w, h } = startRectRef.current;
      const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
      const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY;
      const dx = ((clientX - startPointRef.current.x) / frameW) * 100;
      const dy = ((clientY - startPointRef.current.y) / frameH) * 100;

      commit(elCrop, {
        x: clamp(x + dx, 0, Math.max(0, 100 - w)),
        y: clamp(y + dy, 0, Math.max(0, 100 - h)),
        w,
        h,
      });
    };

    const handleMoveEnd = () => {
      if (!boxRef.current) return;
      startPointRef.current = null;
      directionRef.current = "";
      boxRef.current.style.cursor = "move";
      document.body.style.cursor = "auto";
    };

    if (!boxRef.current) return;

    const controller = new AbortController();
    const { signal } = controller;

    boxRef.current.addEventListener("mousedown", handleDragStart, { signal });
    boxRef.current.addEventListener("touchstart", handleDragStart, {
      signal,
      passive: false,
    });
    document.addEventListener("mousemove", handleMove, { signal });
    document.addEventListener("touchmove", handleMove, {
      signal,
      passive: false,
    });
    document.addEventListener("mouseup", handleMoveEnd, { signal });
    document.addEventListener("touchend", handleMoveEnd, { signal });

    return () => controller.abort();
  }, [isFree, ratio, width, height, boxRef, eventBus]);

  return { handleCropStart, initialCrop };
};
