import { useLayoutEffect, useRef, useState } from "react";

type UseOrbitalSelectorArgs = {
  value: number;
  onChange?: (value: number) => void;
  onInput?: (value: number) => void;
};

// 0deg at 12 o'clock, growing clockwise, matching `rotate(${value}deg)`
function getAngle(el: HTMLElement, clientX: number, clientY: number): number {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const deg = (Math.atan2(clientX - cx, cy - clientY) * 180) / Math.PI;
  return Math.round((deg + 360) % 360) % 360;
}

export const useOrbitalSelector = ({
  value,
  onChange,
  onInput,
}: UseOrbitalSelectorArgs) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const valueRef = useRef(value);
  const [currentValue, setCurrentValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  if (value !== prevValue) {
    setPrevValue(value);
    setCurrentValue(value);
  }

  useLayoutEffect(() => {
    valueRef.current = currentValue;
  }, [currentValue]);

  const updateValue = (nextValue: number) => {
    valueRef.current = nextValue;
    setCurrentValue(nextValue);
  };

  const selectAngle = (angle: number) => {
    updateValue(angle);
    onChange?.(angle);
  };

  // no preventDefault here: it would suppress the compatibility mousedown that
  // click-outside listeners rely on; touch-action/user-select cover the rest
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== null || e.button !== 0) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (e.pointerId !== pointerIdRef.current || !container) return;

    const angle = getAngle(container, e.clientX, e.clientY);
    if (angle === valueRef.current) return;
    updateValue(angle);
    onInput?.(angle);
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== pointerIdRef.current) return;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    pointerIdRef.current = null;
    setIsDragging(false);
    onChange?.(valueRef.current);
  };

  return {
    containerRef,
    currentValue,
    isDragging,
    selectAngle,
    thumbHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
    },
  };
};
