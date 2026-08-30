import { useEffect, useRef, useState } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { Lock } from "../assets/icons";
import { useMobile } from "../hooks";
import { emitResizeUpdate } from "../eventBus";
import { SaveCloseGroup, InputPixel } from "../ui";
import styles from "./Resize.module.css";

const minScale = 15;
const maxScale = 200;

const sizeCalculator = (scale: number, width: number, height: number) => {
  if (scale < minScale) scale = minScale;
  if (scale > maxScale) scale = maxScale;
  return {
    updatedScale: scale,
    updatedWidth: Math.round(width * (scale / 100)),
    updatedHeight: Math.round(height * (scale / 100)),
  };
};

export const ResizeTools = () => {
  const {
    getLastHistoryItem,
    setCurrentAction,
    addToHistory,
    setSidebar,
    eventBus,
  } = usePixediContext();
  const { width: currentWidth, height: currentHeight } = getLastHistoryItem();
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);
  const [scale, setScale] = useState(100);
  const startVerticalSlideRef = useRef<number>(0);
  const mobile = useMobile();

  const handleChangeWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { updatedScale, updatedWidth, updatedHeight } = sizeCalculator(
      (parseInt(e.target?.value ?? "1") / currentWidth) * 100,
      currentWidth,
      currentHeight,
    );
    setWidth(updatedWidth);
    setHeight(updatedHeight);
    setScale(updatedScale);
    emitResizeUpdate(eventBus, updatedScale);
  };

  const handleChangeHeight = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { updatedScale, updatedWidth, updatedHeight } = sizeCalculator(
      (parseInt(e.target.value) / currentHeight) * 100,
      currentWidth,
      currentHeight,
    );
    setHeight(updatedHeight);
    setWidth(updatedWidth);
    setScale(updatedScale);
    emitResizeUpdate(eventBus, updatedScale);
  };

  const handleClose = () => {
    emitResizeUpdate(eventBus, 100);
    setCurrentAction(null);
    setSidebar(true);
  };

  const handleSave = () => {
    addToHistory({
      width,
      height,
      action: {
        name: "resize",
        args: {
          width,
          height,
        },
      },
    });
    emitResizeUpdate(eventBus, 100);
    setSidebar(true);
  };

  useEffect(() => {
    let updatedScale = Math.round((width / currentWidth) * 100);

    const updateScale = (scale: number) => {
      const { updatedHeight, updatedWidth } = sizeCalculator(
        scale,
        currentWidth,
        currentHeight,
      );
      setHeight(updatedHeight);
      setWidth(updatedWidth);
      setScale(scale);
      emitResizeUpdate(eventBus, scale);
    };

    const handleWheel = (e: WheelEvent) => {
      const direction = Math.sign(e.deltaY);
      updatedScale -= direction * 2;
      if (updatedScale <= minScale) updatedScale = minScale;
      if (updatedScale >= maxScale) updatedScale = maxScale;
      updateScale(updatedScale);
    };

    const handleTouchStart = (e: TouchEvent) => {
      startVerticalSlideRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      const deltaY = startVerticalSlideRef.current - y;
      if (Math.abs(deltaY) < 10) return;
      const direction = Math.sign(deltaY);
      updatedScale += direction * 2;
      if (updatedScale <= minScale) updatedScale = minScale;
      if (updatedScale >= maxScale) updatedScale = maxScale;

      console.log("updatedScale", updatedScale);
      startVerticalSlideRef.current = y;
    };

    const controller = new AbortController();
    const { signal } = controller;

    window.addEventListener("wheel", handleWheel, { signal });
    window.addEventListener("touchstart", handleTouchStart, { signal });
    window.addEventListener("touchmove", handleTouchMove, { signal });

    return () => controller.abort();
  }, [currentHeight, currentWidth, mobile, width, eventBus]);

  return (
    <div className={styles.resize}>
      <div className={styles.indicatorWrapper}>
        <div className={styles.indicator} style={{ width: `${scale / 2}%` }} />
      </div>
      <InputPixel
        value={width}
        name="width"
        label="Width"
        style={{ width: "88px" }}
        onChange={(e) => setWidth(Number(e.target.value))}
        onBlur={handleChangeWidth}
      />
      <Lock className={styles.toolsLock} />
      <InputPixel
        value={height}
        name="height"
        label="Height"
        style={{ width: "88px" }}
        onChange={(e) => setHeight(Number(e.target.value))}
        onBlur={handleChangeHeight}
      />
      <SaveCloseGroup
        onSave={() => handleSave()}
        onClose={handleClose}
        disabled={width === currentWidth}
      />
    </div>
  );
};
