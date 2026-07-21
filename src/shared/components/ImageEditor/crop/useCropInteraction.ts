import { useEffect, useRef } from "react";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import { getCropPoints } from "../utils";
import type { CropRect, Direction } from "../types";
import { emitCropUpdate } from "../eventBus";
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

function applyClipPath(
  img: HTMLImageElement,
  xPct: number,
  yPct: number,
  wPct: number,
  hPct: number,
): void {
  img.style.clipPath = `xywh(${xPct}% ${yPct}% ${wPct}% ${hPct}%)`;
}

type UseCropInteractionArgs = {
  imgRef: React.RefObject<HTMLImageElement | null>;
  cropRef: React.RefObject<HTMLDivElement | null>;
};

export const useCropInteraction = ({
  imgRef,
  cropRef,
}: UseCropInteractionArgs) => {
  const { getCurrentAction, getLastHistoryItem } = useImageEditorContext();
  const mobile = useMobile();

  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const directionRef = useRef<Direction | "">("");
  const posRef = useRef<{ xPct: number; yPct: number }>({ xPct: 0, yPct: 0 });
  const cropRectRef = useRef<CropRect>({ x: 0, y: 0, w: 0, h: 0 });

  const handleCropStart = (
    e: React.MouseEvent | React.TouchEvent,
    type: Direction,
    cursor?: string,
  ) => {
    if (!cropRef.current) return;

    e.stopPropagation();

    cropRectRef.current = {
      x: cropRef.current.offsetLeft,
      y: cropRef.current.offsetTop,
      w: cropRef.current.offsetWidth,
      h: cropRef.current.offsetHeight,
    };

    const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
    const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY;
    startPointRef.current = { x: clientX, y: clientY };
    directionRef.current = type;

    if (!mobile) {
      cropRef.current.style.cursor = `${cursor}-resize`;
      document.body.style.cursor = `${cursor}-resize`;
    }
  };

  useEffect(() => {
    const handleDragStart = (e: MouseEvent | TouchEvent) => {
      if (cropRef.current) {
        const parent = cropRef.current.parentElement;
        if (parent) {
          posRef.current = {
            xPct: pct(cropRef.current.offsetLeft, parent.offsetWidth),
            yPct: pct(cropRef.current.offsetTop, parent.offsetHeight),
          };
        }
      }
      const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
      const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY;
      startPointRef.current = { x: clientX, y: clientY };
      document.body.style.cursor = "move";
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!imgRef.current || !cropRef.current || !startPointRef.current) return;

      const elCrop = cropRef.current;
      const elImage = imgRef.current;
      const parent = elCrop.parentElement;
      if (!parent) return;

      const parentW = parent.offsetWidth;
      const parentH = parent.offsetHeight;

      if (directionRef.current) {
        handleResize(e, elCrop, elImage, parentW, parentH);
        return;
      }

      handleDrag(e, elCrop, elImage, parentW, parentH);
    };

    const handleResize = (
      e: MouseEvent | TouchEvent,
      elCrop: HTMLDivElement,
      elImage: HTMLImageElement,
      parentW: number,
      parentH: number,
    ) => {
      const action = getCurrentAction();
      if (!action || action.name !== "crop" || !startPointRef.current) return;

      const { isFree, ratio } = action.args;
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
      applyClipPath(elImage, xPct, yPct, wPct, hPct);

      const lastHistoryItem = getLastHistoryItem();
      if (!lastHistoryItem) return;
      const { width: imgW, height: imgH } = lastHistoryItem;
      emitCropUpdate({
        x: Math.round((xPct / 100) * imgW),
        y: Math.round((yPct / 100) * imgH),
        w: Math.round((wPct / 100) * imgW),
        h: Math.round((hPct / 100) * imgH),
      });
    };

    const handleDrag = (
      e: MouseEvent | TouchEvent,
      elCrop: HTMLDivElement,
      elImage: HTMLImageElement,
      parentW: number,
      parentH: number,
    ) => {
      if (!startPointRef.current) return;
      console.log("HandleDrag");
      const frmWidth = elCrop.offsetWidth;
      const frmHeight = elCrop.offsetHeight;

      const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
      const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY;
      const dxPct = pct(clientX - startPointRef.current.x, parentW);
      const dyPct = pct(clientY - startPointRef.current.y, parentH);
      startPointRef.current = { x: clientX, y: clientY };

      const maxXPct = pct(parentW - frmWidth, parentW);
      const maxYPct = pct(parentH - frmHeight, parentH);

      const leftPct = clamp(posRef.current.xPct + dxPct, 0, maxXPct);
      const topPct = clamp(posRef.current.yPct + dyPct, 0, maxYPct);
      const wPct = pct(frmWidth, parentW);
      const hPct = pct(frmHeight, parentH);

      posRef.current = { xPct: leftPct, yPct: topPct };

      applyRect(elCrop, leftPct, topPct, wPct, hPct);
      applyClipPath(elImage, leftPct, topPct, wPct, hPct);

      const { width: imgW, height: imgH } = getLastHistoryItem();
      emitCropUpdate({
        x: Math.round((leftPct / 100) * imgW),
        y: Math.round((topPct / 100) * imgH),
        w: Math.round((wPct / 100) * imgW),
        h: Math.round((hPct / 100) * imgH),
      });
    };

    const handleMoveEnd = () => {
      if (!cropRef.current) return;

      startPointRef.current = null;
      directionRef.current = "";
      cropRef.current.style.cursor = "move";
      document.body.style.cursor = "auto";
    };

    if (!cropRef.current) return;

    const controller = new AbortController();
    const { signal } = controller;

    cropRef.current.addEventListener("mousedown", handleDragStart, { signal });
    cropRef.current.addEventListener("touchstart", handleDragStart, { signal });
    document.addEventListener("mousemove", handleMove, { signal });
    document.addEventListener("touchmove", handleMove, { signal });
    document.addEventListener("mouseup", handleMoveEnd, { signal });
    document.addEventListener("touchend", handleMoveEnd, { signal });

    return () => controller.abort();
  }, [getCurrentAction, getLastHistoryItem, imgRef, cropRef]);

  return { handleCropStart };
};
