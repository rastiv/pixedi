import { useCallback, useEffect, useRef, useState } from "react";
import { emitResizeUpdate } from "../eventBus";
import { usePixediContext } from "../provider/usePixediContext";
import { useToolCommit } from "../hooks";
import { ActionName } from "../types";

const MIN_SCALE = 15;
const MAX_SCALE = 200;
const WHEEL_STEP = 2;

const calculateSize = (scale: number, width: number, height: number) => {
  const updatedScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
  return {
    scale: updatedScale,
    width: Math.round(width * (updatedScale / 100)),
    height: Math.round(height * (updatedScale / 100)),
  };
};

export const useResize = (valueRef: React.RefObject<HTMLDivElement | null>) => {
  const { getLastHistoryItem, eventBus } = usePixediContext();
  const { commit, close: closeTool, isSaving } = useToolCommit();
  const { width: currentWidth, height: currentHeight } = getLastHistoryItem();
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);
  const [scale, setScale] = useState(100);
  const scaleRef = useRef(scale);
  const startVerticalSlideRef = useRef(0);
  const resizeRef = useRef<HTMLDivElement>(null);

  const updateScale = useCallback(
    (nextScale: number) => {
      const next = calculateSize(nextScale, currentWidth, currentHeight);
      setWidth(next.width);
      setHeight(next.height);
      setScale(next.scale);
      scaleRef.current = next.scale;
      if (valueRef.current) {
        valueRef.current.textContent = Math.round(next.scale).toString();
      }
      emitResizeUpdate(eventBus, next.scale);
    },
    [currentHeight, currentWidth, eventBus, valueRef],
  );

  const handleSliderInput = (value: number) => {
    if (valueRef.current) {
      valueRef.current.textContent = value.toString();
    }
    emitResizeUpdate(eventBus, value);
  };

  const handleSliderChange = (value: number) => {
    updateScale(value);
  };

  const updateFromInput = (value: string, dimension: number) => {
    const nextValue = Number.parseInt(value, 10);
    if (!Number.isFinite(nextValue)) {
      updateScale(100);
      return;
    }
    updateScale((nextValue / dimension) * 100);
  };

  const handleWidthBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    updateFromInput(event.target.value, currentWidth);
  };

  const handleHeightBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    updateFromInput(event.target.value, currentHeight);
  };

  const close = () => {
    emitResizeUpdate(eventBus, 100);
    closeTool();
  };

  const save = () => {
    commit({
      width,
      height,
      action: {
        name: ActionName.RESIZE,
        args: { width, height },
      },
    });
    emitResizeUpdate(eventBus, 100);
  };

  useEffect(() => {
    const isInsideFrame = (event: Event) => {
      const frame = resizeRef.current?.parentElement;
      const target = event.composedPath?.()[0] ?? event.target;
      return target instanceof Node && Boolean(frame?.contains(target));
    };

    const handleWheel = (event: WheelEvent) => {
      if (!isInsideFrame(event)) return;
      updateScale(scaleRef.current - Math.sign(event.deltaY) * WHEEL_STEP);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (!isInsideFrame(event)) return;
      startVerticalSlideRef.current = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isInsideFrame(event)) return;
      const y = event.touches[0].clientY;
      const deltaY = startVerticalSlideRef.current - y;
      if (Math.abs(deltaY) < 10) return;
      updateScale(scaleRef.current + Math.sign(deltaY) * WHEEL_STEP);
      startVerticalSlideRef.current = y;
    };

    const controller = new AbortController();
    const { signal } = controller;
    window.addEventListener("wheel", handleWheel, { signal });
    window.addEventListener("touchstart", handleTouchStart, { signal });
    window.addEventListener("touchmove", handleTouchMove, { signal });

    return () => controller.abort();
  }, [updateScale]);

  return {
    resizeRef,
    MIN_SCALE,
    MAX_SCALE,
    width,
    height,
    scale,
    currentWidth,
    currentHeight,
    setWidth,
    setHeight,
    handleWidthBlur,
    handleHeightBlur,
    handleSliderInput,
    handleSliderChange,
    save,
    close,
    isSaving,
  };
};
