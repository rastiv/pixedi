import { useState } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { useImageProcessor } from "../hooks";
import { SaveCloseGroup, Slider } from "../ui";
import styles from "./rotate.module.css";

type RotateToolsProps = {
  frameRef: React.RefObject<HTMLDivElement | null>;
  imageRef: React.RefObject<HTMLImageElement | null>;
};

export const RotateTools = ({ frameRef, imageRef }: RotateToolsProps) => {
  const { getLastHistoryItem, addToHistory, setSidebar, setCurrentAction } =
    usePixediContext();
  const { width, height, base64, ext } = getLastHistoryItem();
  const { rotate } = useImageProcessor(false);
  const [angle, setAngle] = useState(0);
  const [transparency, setTransparency] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRotate = (value: number) => {
    if (!frameRef.current) return;
    if (!imageRef.current) return;
    setAngle(value);

    let aspectRatio = `${width} / ${height}`;
    let scale = 1;
    if ((value >= 90 && value < 180) || (value >= 270 && value < 360)) {
      aspectRatio = `${height} / ${width}`;
      scale = Math.max(width / height, height / width);
    }

    frameRef.current.style.aspectRatio = aspectRatio;
    imageRef.current.style.transform = `rotate(${value}deg) scale(${scale})`;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const processedBase64 = await rotate(base64, angle);
      const isNewRatio =
        (angle >= 90 && angle < 180) || (angle >= 270 && angle < 360);

      addToHistory({
        name: "Rotate",
        base64: processedBase64,
        width: isNewRatio ? height : width,
        height: isNewRatio ? width : height,
        ext: ["jpg", "jpeg"].includes(ext) ? "webp" : ext,
      });

      setAngle(0);
      setSidebar(true);
    } catch (error) {
      console.error("Failed to process image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAngle(0);
    setCurrentAction(null);
    setSidebar(true);
  };

  const handleTransparancy = () => {
    setTransparency((prev) => !prev);
    if (frameRef.current) {
      frameRef.current.style.background = transparency
        ? "var(--color-black)"
        : "transparent";
    }
  };

  return (
    <div
      className={styles.rotate}
      style={{ display: "flex", flexDirection: "row", gap: "1rem" }}
    >
      <Slider
        min={0}
        max={360}
        value={angle}
        className={styles.resizeSlider}
        onChange={handleRotate}
      />
      <SaveCloseGroup
        saving={loading}
        disabled={loading || angle === 0 || angle === 360}
        onSave={handleSave}
        onClose={handleClose}
      />
      <input
        type="checkbox"
        checked={transparency}
        onChange={handleTransparancy}
      />
    </div>
  );
};
