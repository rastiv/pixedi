import { useEffect, useRef } from "react";
import { useMobile } from "../../hooks";
import { useSurfaceToolOffset } from "./SurfaceToolContext";
import type { SurfaceToolOffset } from "./SurfaceToolContext";

type UseSurfaceToolArgs = {
  surfaceRef: React.RefObject<HTMLDivElement | null>;
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

export const useSurfaceTool = ({ surfaceRef }: UseSurfaceToolArgs) => {
  const mobile = useMobile();
  const offsetRef = useSurfaceToolOffset();
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const startOffsetRef = useRef<SurfaceToolOffset>({ dx: 0, dy: 0 });
  const boundsRef = useRef<ReturnType<typeof getOffsetBounds>>(null);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const el = surfaceRef.current;
    if (!el) return;

    e.stopPropagation();

    const bounds = getOffsetBounds(el, offsetRef.current);
    if (!bounds) return;

    const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
    const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY;
    startPointRef.current = { x: clientX, y: clientY };
    startOffsetRef.current = { ...offsetRef.current };
    boundsRef.current = bounds;

    if (!mobile) {
      document.body.style.cursor = "move";
    }
  };

  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;

    const commit = (offset: SurfaceToolOffset) => {
      offsetRef.current = offset;
      applyOffset(el, offset);
    };

    const clampToParent = () => {
      const bounds = getOffsetBounds(el, offsetRef.current);
      if (!bounds) return;
      const { dx, dy } = offsetRef.current;
      commit({
        dx: clamp(dx, bounds.minDx, bounds.maxDx),
        dy: clamp(dy, bounds.minDy, bounds.maxDy),
      });
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const start = startPointRef.current;
      const bounds = boundsRef.current;
      if (!start || !bounds) return;

      e.preventDefault();

      const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
      const clientY = "clientY" in e ? e.clientY : e.touches[0].clientY;

      commit({
        dx: clamp(
          startOffsetRef.current.dx + (clientX - start.x),
          bounds.minDx,
          bounds.maxDx,
        ),
        dy: clamp(
          startOffsetRef.current.dy + (clientY - start.y),
          bounds.minDy,
          bounds.maxDy,
        ),
      });
    };

    const handleEnd = () => {
      if (!startPointRef.current) return;
      startPointRef.current = null;
      boundsRef.current = null;
      if (!mobile) {
        document.body.style.cursor = "";
      }
    };

    // restore the offset a previously mounted tool was dragged to
    clampToParent();

    const controller = new AbortController();
    const { signal } = controller;

    document.addEventListener("mousemove", handleMove, { signal });
    document.addEventListener("touchmove", handleMove, {
      signal,
      passive: false,
    });
    document.addEventListener("mouseup", handleEnd, { signal });
    document.addEventListener("touchend", handleEnd, { signal });

    if (typeof ResizeObserver !== "undefined" && el.parentElement) {
      const observer = new ResizeObserver(clampToParent);
      observer.observe(el.parentElement);
      signal.addEventListener("abort", () => observer.disconnect());
    }

    return () => controller.abort();
  }, [surfaceRef, offsetRef, mobile]);

  return {
    handleDragStart,
  };
};
