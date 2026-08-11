import { useEffect, useRef, useState } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { Lock } from "../assets/icons";
import { useMobile } from "../hooks";
import { emitResizeUpdate } from "../eventBus";
import { SaveCloseGroup, Slider, InputPixel } from "../ui";
import styles from "./resize.module.css";

const minScale = 10;
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
  const { getLastHistoryItem, setCurrentAction, addToHistory, setSidebar } =
    usePixediContext();
  const { width: currentWidth, height: currentHeight } = getLastHistoryItem();
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);
  const [scale, setScale] = useState(100);
  const startVerticalSlideRef = useRef<number>(0);
  const mobile = useMobile();

  const handleChangeScale = (scale: number) => {
    const { updatedScale, updatedWidth, updatedHeight } = sizeCalculator(
      scale,
      currentWidth,
      currentHeight,
    );
    setWidth(updatedWidth);
    setHeight(updatedHeight);
    setScale(updatedScale);
    emitResizeUpdate(updatedScale);
  };

  const handleChangeWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { updatedScale, updatedWidth, updatedHeight } = sizeCalculator(
      (parseInt(e.target.value) / currentWidth) * 100,
      currentWidth,
      currentHeight,
    );
    setWidth(updatedWidth);
    setHeight(updatedHeight);
    setScale(updatedScale);
    emitResizeUpdate(updatedScale);
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
    emitResizeUpdate(updatedScale);
  };

  const handleClose = () => {
    emitResizeUpdate(100);
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
    emitResizeUpdate(100);
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
      emitResizeUpdate(scale);
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
      updateScale(updatedScale);
      startVerticalSlideRef.current = y;
    };

    const controller = new AbortController();
    const { signal } = controller;

    window.addEventListener("wheel", handleWheel, { signal });
    window.addEventListener("touchstart", handleTouchStart, { signal });
    window.addEventListener("touchmove", handleTouchMove, { signal });

    return () => controller.abort();
  }, [currentHeight, currentWidth, mobile, width]);

  return (
    <div className={styles.resize}>
      <Slider
        min={minScale}
        max={maxScale}
        value={scale}
        className={styles.slider}
        onChange={handleChangeScale}
      />
      <div className={styles.tools}>
        <InputPixel
          value={width}
          name="width"
          label="Width"
          style={{ width: "88px" }}
          onChange={handleChangeWidth}
        />
        <Lock className={styles.toolsLock} />
        <InputPixel
          value={height}
          name="height"
          label="Height"
          style={{ width: "88px" }}
          onChange={handleChangeHeight}
        />
        <SaveCloseGroup
          onSave={() => handleSave()}
          onClose={handleClose}
          disabled={width === currentWidth}
        />
      </div>
    </div>
  );
};
