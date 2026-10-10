import { useEffect, useRef } from "react";
import { useSurfaceToolOffset } from "./SurfaceToolContext";
import type { SurfaceToolOffset } from "./SurfaceToolContext";

type UseSurfaceToolArgs = {
  surfaceRef: React.RefObject<HTMLDivElement | null>;
  hasAdditional?: boolean;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// the css anchor (bottom 16px, horizontally centered) stays the origin and the
// drag is layered on top of it, so the tool keeps its place when the frame resizes
function applyOffset(el: HTMLDivElement, { dx, dy }: SurfaceToolOffset): void {
  el.style.transform = `translate(calc(-50% + ${dx}px), ${dy}px)`;
}

// the offset the tool may still travel before leaving the parent box, measured
// from the position it would sit at without any offset
function getOffsetBounds(el: HTMLDivElement, offset: SurfaceToolOffset) {
  const parent = el.parentElement;
  if (!parent) return null;

  const elRect = el.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  const baseLeft = elRect.left - parentRect.left - offset.dx;
  const baseTop = elRect.top - parentRect.top - offset.dy;

  return {
    minDx: -baseLeft,
    maxDx: Math.max(-baseLeft, parentRect.width - elRect.width - baseLeft),
    minDy: -baseTop,
    maxDy: Math.max(-baseTop, parentRect.height - elRect.height - baseTop),
  };
}

export const useSurfaceTool = ({
  surfaceRef,
  hasAdditional,
}: UseSurfaceToolArgs) => {
  const offsetRef = useSurfaceToolOffset();
  const pointerIdRef = useRef<number | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const startOffsetRef = useRef<SurfaceToolOffset>({ dx: 0, dy: 0 });
  const boundsRef = useRef<ReturnType<typeof getOffsetBounds>>(null);

  const commit = (el: HTMLDivElement, offset: SurfaceToolOffset) => {
    offsetRef.current = offset;
    applyOffset(el, offset);
  };

  // no preventDefault here: it would suppress the compatibility mousedown that
  // click-outside listeners (e.g. select dropdowns) rely on; touch-action and
  // user-select on the handle already block scrolling and text selection
  const handlePointerDown = (e: React.PointerEvent<Element>) => {
    if (pointerIdRef.current !== null || e.button !== 0) return;

    const el = surfaceRef.current;
    if (!el) return;

    const bounds = getOffsetBounds(el, offsetRef.current);
    if (!bounds) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;
    startPointRef.current = { x: e.clientX, y: e.clientY };
    startOffsetRef.current = { ...offsetRef.current };
    boundsRef.current = bounds;
  };

  const handlePointerMove = (e: React.PointerEvent<Element>) => {
    const el = surfaceRef.current;
    const start = startPointRef.current;
    const bounds = boundsRef.current;
    if (e.pointerId !== pointerIdRef.current || !el || !start || !bounds) {
      return;
    }

    commit(el, {
      dx: clamp(
        startOffsetRef.current.dx + (e.clientX - start.x),
        bounds.minDx,
        bounds.maxDx,
      ),
      dy: clamp(
        startOffsetRef.current.dy + (e.clientY - start.y),
        bounds.minDy,
        bounds.maxDy,
      ),
    });
  };

  const handlePointerEnd = (e: React.PointerEvent<Element>) => {
    if (e.pointerId !== pointerIdRef.current) return;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    pointerIdRef.current = null;
    startPointRef.current = null;
    boundsRef.current = null;
  };

  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;

    const clampToParent = () => {
      const bounds = getOffsetBounds(el, offsetRef.current);
      if (!bounds) return;
      const { dx, dy } = offsetRef.current;
      offsetRef.current = {
        dx: clamp(dx, bounds.minDx, bounds.maxDx),
        dy: clamp(dy, bounds.minDy, bounds.maxDy),
      };
      applyOffset(el, offsetRef.current);
    };

    // restore the offset a previously mounted tool was dragged to
    clampToParent();

    if (typeof ResizeObserver === "undefined" || !el.parentElement) return;

    const observer = new ResizeObserver(clampToParent);
    observer.observe(el.parentElement);
    return () => observer.disconnect();
  }, [surfaceRef, offsetRef, hasAdditional]);

  return {
    dragHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
    },
  };
};
