import { useState } from "react";
import { flushSync } from "react-dom";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import { useImageProcessor } from "../hooks";
import { Button, SaveCloseGroup } from "../ui";
import { FlipH, FlipV } from "../assets/icons";

import styles from "./flip.module.css";

type FlipToolsProps = {
  frameRef: React.RefObject<HTMLDivElement | null>;
};

export const FlipTools = ({ frameRef }: FlipToolsProps) => {
  const { getLastHistoryItem, setCurrentAction, addToHistory, setSidebar } =
    useImageEditorContext();
  const { flip } = useImageProcessor();
  const [loading, setLoading] = useState(false);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const { base64, width, height, ext } = getLastHistoryItem();

  const enableAnimation = () => {
    if (frameRef.current) {
      frameRef.current.style.transition = "all 0.2s ease";
    }
  };

  const disableAnimation = () => {
    if (frameRef.current) {
      frameRef.current.style.transition = "none";
    }
  };

  const handleFrameTransform = (
    horizontal: boolean = false,
    vertical: boolean = false,
  ) => {
    if (frameRef.current) {
      frameRef.current.style.transform = `scale(${horizontal ? -1 : 1}, ${vertical ? -1 : 1})`;
    }
  };

  const handleFlipHorizontal = () => {
    setFlipHorizontal((prev) => !prev);
    enableAnimation();
    handleFrameTransform(!flipHorizontal, flipVertical);
  };

  const handleFlipVertical = () => {
    setFlipVertical((prev) => !prev);
    enableAnimation();
    handleFrameTransform(flipHorizontal, !flipVertical);
  };

  const handleClose = () => {
    setCurrentAction(null);
    enableAnimation();
    handleFrameTransform(false, false);
    setSidebar(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const processedBase64 = await flip(base64, flipHorizontal, flipVertical);
      disableAnimation();
      flushSync(() => {
        addToHistory({
          name: "Flip",
          base64: processedBase64,
          width,
          height,
          ext,
        });
      });
      handleFrameTransform(false, false);
      setFlipHorizontal(false);
      setFlipVertical(false);
      setSidebar(true);
    } catch (error) {
      console.error("Failed to process image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.flip}>
      <div className={styles.scGroup}>
        <Button
          variant="outline"
          className={`${styles.flipBtnH}`}
          disabled={loading}
          onClick={handleFlipHorizontal}
        >
          <FlipH
            style={{
              color: flipHorizontal
                ? "var(--accent-blue)"
                : "var(--foreground)",
            }}
          />
        </Button>
        <Button
          variant="outline"
          className={`${styles.flipBtnV} `}
          disabled={loading}
          onClick={handleFlipVertical}
        >
          <FlipV
            style={{
              color: flipVertical ? "var(--accent-blue)" : "var(--foreground)",
            }}
          />
        </Button>
      </div>
      <SaveCloseGroup
        saving={loading}
        disabled={loading || (!flipHorizontal && !flipVertical)}
        onSave={handleSave}
        onClose={handleClose}
      />
    </div>
  );
};
