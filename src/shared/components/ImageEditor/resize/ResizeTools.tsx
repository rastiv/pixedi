import { useEffect, useRef, useState } from "react";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import { Loader, Check, X, Lock } from "../assets/icons";
import { useImageProcessor, useMobile } from "../hooks";
import { Button } from "../ui";
import { InputPixel } from "../ui";
import "./resize.css";

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
  onResizing: (scale: number) => void;
};

export const ResizeTools = ({ onResizing }: ResizeToolsProps) => {
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
  const startVerticalSlideRef = useRef<number>(0);
  const { resize } = useImageProcessor();
  const mobile = useMobile();

  const handleChangeWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { updatedScale, updatedWidth, updatedHeight } = sizeCalculator(
      (parseInt(e.target.value) / currentWidth) * 100,
      currentWidth,
      currentHeight,
    );
    setWidth(updatedWidth);
    setHeight(updatedHeight);
    onResizing(updatedScale);
  };

  const handleChangeHeight = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { updatedScale, updatedWidth, updatedHeight } = sizeCalculator(
      (parseInt(e.target.value) / currentHeight) * 100,
      currentWidth,
      currentHeight,
    );
    setHeight(updatedHeight);
    setWidth(updatedWidth);
    onResizing(updatedScale);
  };

  const handleClose = () => {
    onResizing(100);
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
      onResizing(100);
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
      onResizing(scale);
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
  }, [currentHeight, currentWidth, loading, mobile, onResizing, width]);

  return (
    <div className="resize">
      <div className="resize-text">
        {mobile ? "Slide UP/Down to Resize" : "Scroll UP/Down to Resize"}
      </div>
      <div className="resize-border" />
      <div className="resize-tools">
        <InputPixel
          value={width}
          name="width"
          label="Width"
          disabled={loading}
          style={{ width: "88px" }}
          onChange={handleChangeWidth}
        />
        <Lock className="resize-tools-lock" />
        <InputPixel
          value={height}
          name="height"
          label="Height"
          disabled={loading}
          style={{ width: "88px" }}
          onChange={handleChangeHeight}
        />
        <div className="resize-tools-buttons">
          <Button
            variant="outline"
            className="resize-tools-save text-green"
            disabled={width === currentWidth || loading}
            onClick={() => handleSave()}
          >
            {loading ? <Loader /> : <Check />}
          </Button>
          <Button
            variant="outline"
            className="resize-tools-close text-red"
            disabled={loading}
            onClick={handleClose}
          >
            <X />
          </Button>
        </div>
      </div>
    </div>
  );
};
