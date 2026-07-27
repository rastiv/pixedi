import { useCallback, useEffect, useRef, useState } from "react";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import { Lock } from "../assets/icons";
import { useImageProcessor, useMobile } from "../hooks";
import { SaveCloseGroup, Slider } from "../ui";
import { InputPixel } from "../ui";
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

type ResizeToolsProps = {
  frameRef: React.RefObject<HTMLDivElement | null>;
};

export const ResizeTools = ({ frameRef }: ResizeToolsProps) => {
  const { getLastHistoryItem, setCurrentAction, addToHistory, setSidebar } =
    useImageEditorContext();
  const {
    width: currentWidth,
    height: currentHeight,
    base64,
  } = getLastHistoryItem();
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);
  const [scale, setScale] = useState(100);
  const startVerticalSlideRef = useRef<number>(0);
  const { resize } = useImageProcessor();
  const mobile = useMobile();

  const handleFrameTransform = useCallback(
    (scale: number) => {
      if (frameRef.current) {
        frameRef.current.style.transition = "transform 0.2s ease";
        frameRef.current.style.transform = `scale(${scale / 100})`;
      }
    },
    [frameRef],
  );

  const handleChangeScale = (scale: number) => {
    const { updatedScale, updatedWidth, updatedHeight } = sizeCalculator(
      scale,
      currentWidth,
      currentHeight,
    );
    setWidth(updatedWidth);
    setHeight(updatedHeight);
    setScale(updatedScale);
    handleFrameTransform(updatedScale);
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
    handleFrameTransform(updatedScale);
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
    handleFrameTransform(updatedScale);
  };

  const handleClose = () => {
    handleFrameTransform(100);
    setCurrentAction(null);
    setSidebar(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const processedBase64 = await resize(base64, width, height);
      addToHistory({
        name: "Resize",
        base64: processedBase64,
        width,
        height,
      });
      handleFrameTransform(100);
      setSidebar(true);
    } catch (error) {
      console.error("Failed to process image:", error);
    } finally {
      setLoading(false);
    }
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
      handleFrameTransform(scale);
    };

    const handleWheel = (e: WheelEvent) => {
      if (loading) return;
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
      if (loading) return;
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
  }, [
    currentHeight,
    currentWidth,
    handleFrameTransform,
    loading,
    mobile,
    width,
  ]);

  return (
    <div className={styles.resize}>
      <Slider
        min={minScale}
        max={maxScale}
        value={scale}
        className={styles.resizeSlider}
        onChange={handleChangeScale}
      />
      <div className={styles.resizeTools}>
        <InputPixel
          value={width}
          name="width"
          label="Width"
          disabled={loading}
          style={{ width: "88px" }}
          onChange={handleChangeWidth}
        />
        <Lock className={styles.resizeToolsLock} />
        <InputPixel
          value={height}
          name="height"
          label="Height"
          disabled={loading}
          style={{ width: "88px" }}
          onChange={handleChangeHeight}
        />
        <SaveCloseGroup
          onSave={() => handleSave()}
          onClose={handleClose}
          saving={loading}
          disabled={width === currentWidth || loading}
        />
      </div>
    </div>
  );
};
