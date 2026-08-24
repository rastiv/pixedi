import { useEffect, useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { getCropPoints } from "../utils/crop";
import type { CropRect, Direction } from "../types";
import { emitCropUpdate, emitClipPathUpdate } from "../eventBus";
import { useMobile } from "../hooks";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function pct(px: number, total: number): number {
  return (px / total) * 100;
}

function applyRect(
  el: HTMLDivElement,
  xPct: number,
  yPct: number,
  wPct: number,
  hPct: number,
): void {
  el.style.left = `${xPct}%`;
  el.style.top = `${yPct}%`;
  el.style.width = `${wPct}%`;
  el.style.height = `${hPct}%`;
}

type UseCropInteractionArgs = {
  boxRef: React.RefObject<HTMLDivElement | null>;
};

export const useCropInteraction = ({ boxRef }: UseCropInteractionArgs) => {
  const { currentAction, getLastHistoryItem, eventBus } = usePixediContext();
  const mobile = useMobile();

  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const directionRef = useRef<Direction | "">("");
  const posRef = useRef<{ xPct: number; yPct: number }>({ xPct: 0, yPct: 0 });
  const sizeRef = useRef<{ wPct: number; hPct: number }>({ wPct: 0, hPct: 0 });
  const cropRectRef = useRef<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const clipPathRef = useRef<CropRect>({ x: 0, y: 0, w: 0, h: 0 });

  const handleCropStart = (
    e: React.MouseEvent | React.TouchEvent,
    type: Direction,
    cursor?: string,
  ) => {
    if (!boxRef.current) return;

    e.stopPropagation();
    e.preventDefault();

    cropRectRef.current = {
      x: boxRef.current.offsetLeft,
      y: boxRef.current.offsetTop,
      w: boxRef.current.offsetWidth,
      h: boxRef.current.offsetHeight,
    };

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
    const handleDragStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (boxRef.current) {
        const parent = boxRef.current.parentElement;
        if (parent) {
          posRef.current = {
            xPct: pct(boxRef.current.offsetLeft, parent.offsetWidth),
            yPct: pct(boxRef.current.offsetTop, parent.offsetHeight),
          };
          sizeRef.current = {
            wPct: pct(boxRef.current.offsetWidth, parent.offsetWidth),
            hPct: pct(boxRef.current.offsetHeight, parent.offsetHeight),
          };
        }
      }
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

      const parentW = parent.offsetWidth;
      const parentH = parent.offsetHeight;

      if (directionRef.current) {
        handleResize(e, elCrop, parentW, parentH);
        return;
      }

      handleDrag(e, elCrop, parentW, parentH);
    };

    const handleResize = (
      e: MouseEvent | TouchEvent,
      elCrop: HTMLDivElement,
      parentW: number,
      parentH: number,
    ) => {
      if (
        !currentAction ||
        currentAction.name !== "crop" ||
        !startPointRef.current
      )
        return;

      const { isFree, ratio } = currentAction.args;
      const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
      const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY;
      const { x, y, w, h } = getCropPoints(
        directionRef.current as Direction,
        isFree,
        ratio,
        startPointRef.current.x,
        startPointRef.current.y,
        clientX,
        clientY,
        parentW,
        parentH,
        cropRectRef.current,
        elCrop,
      );

      const xPct = pct(x, parentW);
      const yPct = pct(y, parentH);
      const wPct = pct(w, parentW);
      const hPct = pct(h, parentH);

      applyRect(elCrop, xPct, yPct, wPct, hPct);

      const lastHistoryItem = getLastHistoryItem();
      if (!lastHistoryItem) return;
      const { width: imgW, height: imgH } = lastHistoryItem;

      emitCropUpdate(eventBus, {
        x: Math.round((xPct / 100) * imgW),
        y: Math.round((yPct / 100) * imgH),
        w: Math.round((wPct / 100) * imgW),
        h: Math.round((hPct / 100) * imgH),
      });

      clipPathRef.current = { x: xPct, y: yPct, w: wPct, h: hPct };
      emitClipPathUpdate(eventBus, clipPathRef.current);
    };

    const handleDrag = (
      e: MouseEvent | TouchEvent,
      elCrop: HTMLDivElement,
      parentW: number,
      parentH: number,
    ) => {
      if (!startPointRef.current) return;

      const { wPct, hPct } = sizeRef.current;

      const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
      const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY;
      const dxPct = pct(clientX - startPointRef.current.x, parentW);
      const dyPct = pct(clientY - startPointRef.current.y, parentH);
      startPointRef.current = { x: clientX, y: clientY };

      const maxXPct = Math.max(0, 100 - wPct);
      const maxYPct = Math.max(0, 100 - hPct);

      const leftPct = clamp(posRef.current.xPct + dxPct, 0, maxXPct);
      const topPct = clamp(posRef.current.yPct + dyPct, 0, maxYPct);

      posRef.current = { xPct: leftPct, yPct: topPct };

      applyRect(elCrop, leftPct, topPct, wPct, hPct);

      const { width: imgW, height: imgH } = getLastHistoryItem();

      emitCropUpdate(eventBus, {
        x: Math.round((leftPct / 100) * imgW),
        y: Math.round((topPct / 100) * imgH),
        w: Math.round((wPct / 100) * imgW),
        h: Math.round((hPct / 100) * imgH),
      });

      clipPathRef.current = { x: leftPct, y: topPct, w: wPct, h: hPct };
      emitClipPathUpdate(eventBus, clipPathRef.current);
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
  }, [currentAction, getLastHistoryItem, boxRef, eventBus]);

  return { handleCropStart };
};
