import { useEffect, useRef } from "react";
import { emitCompareUpdate } from "../eventBus";
import { usePixediContext } from "../provider/usePixediContext";

type UseFilterInteractionArgs = {
  compareRef: React.RefObject<HTMLDivElement | null>;
};

export const useFilterInteraction = ({
  compareRef,
}: UseFilterInteractionArgs) => {
  const { eventBus } = usePixediContext();
  const pointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    emitCompareUpdate(eventBus, 0);
  }, [eventBus]);

  // no preventDefault here: it would suppress the compatibility mousedown that
  // click-outside listeners rely on; touch-action/user-select cover the rest
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== null || e.button !== 0) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const compare = compareRef.current;
    const parent = compare?.parentElement;
    if (e.pointerId !== pointerIdRef.current || !compare || !parent) return;

    const { width, left } = parent.getBoundingClientRect();
    const percent =
      (Math.min(Math.max(e.clientX - left, 0), width) / width) * 100;

    compare.style.left = `${percent}%`;
    emitCompareUpdate(eventBus, percent);
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== pointerIdRef.current) return;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    pointerIdRef.current = null;
  };

  return {
    dragHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
    },
  };
};
