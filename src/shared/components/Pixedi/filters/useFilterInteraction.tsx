import { useEffect, useRef } from "react";
import { emitCompareUpdate } from "../eventBus";
import { useMobile } from "../hooks";
import { usePixediContext } from "../provider/usePixediContext";

type UseFilterInteractionArgs = {
  compareRef: React.RefObject<HTMLDivElement | null>;
};

export const useFilterInteraction = ({
  compareRef,
}: UseFilterInteractionArgs) => {
  const { eventBus } = usePixediContext();
  const mobile = useMobile();

  const startPointRef = useRef<number | null>(null);
  const rectRef = useRef<number>(null);

  useEffect(() => {
    rectRef.current = 0;
    emitCompareUpdate(eventBus, 0);
  }, [eventBus]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!compareRef.current) return;

    e.stopPropagation();
    e.preventDefault();

    startPointRef.current = rectRef.current;

    const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
    startPointRef.current = clientX;
    console.log("asdadadasd");
    if (!mobile) {
      document.body.style.cursor = "pointer";
    }
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!compareRef.current || !startPointRef.current) return;
      e.preventDefault();

      const parent = compareRef.current.parentElement;
      if (!parent) return;

      const clientX = "clientX" in e ? e.clientX : e.touches[0].clientX;
      const { width, left } = parent.getBoundingClientRect();

      const percent =
        (Math.min(Math.max(clientX - left, 0), width) / width) * 100;

      rectRef.current = percent;
      compareRef.current.style.left = `${percent}%`;
      emitCompareUpdate(eventBus, percent);
    };

    const handleMoveEnd = () => {
      if (!compareRef.current) return;
      startPointRef.current = null;
      document.body.style.cursor = "auto";
    };

    const controller = new AbortController();
    const { signal } = controller;

    document.addEventListener("mousemove", handleMove, { signal });
    document.addEventListener("touchmove", handleMove, {
      signal,
      passive: false,
    });
    document.addEventListener("mouseup", handleMoveEnd, { signal });
    document.addEventListener("touchend", handleMoveEnd, { signal });

    return () => controller.abort();
  }, [compareRef, eventBus]);

  return {
    handleDragStart,
  };
};
