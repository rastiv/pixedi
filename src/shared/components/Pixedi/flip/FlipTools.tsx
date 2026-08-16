import { useState } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { Button, SaveCloseGroup } from "../ui";
import { FlipH, FlipV } from "../assets/icons";
import { ActionName } from "../types";
import styles from "./Flip.module.css";

export const FlipTools = () => {
  const { getLastHistoryItem, setCurrentAction, addToHistory, setSidebar } =
    usePixediContext();
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const { width, height } = getLastHistoryItem();

  const handleFlipHorizontal = () => {
    setFlipHorizontal((prev) => !prev);
    setCurrentAction({
      name: ActionName.FLIP,
      args: { horizontal: !flipHorizontal, vertical: flipVertical },
    });
  };

  const handleFlipVertical = () => {
    setFlipVertical((prev) => !prev);
    setCurrentAction({
      name: "flip",
      args: { horizontal: flipHorizontal, vertical: !flipVertical },
    });
  };

  const handleClose = () => {
    setCurrentAction(null);
    setSidebar(true);
  };

  const handleSave = () => {
    addToHistory({
      width,
      height,
      action: {
        name: "flip",
        args: { horizontal: flipHorizontal, vertical: flipVertical },
      },
    });
  };

  return (
    <div className={styles.flip}>
      <div className={styles.scGroup}>
        <Button
          variant="outline"
          className={`${styles.flipBtnH}`}
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
        disabled={!flipHorizontal && !flipVertical}
        onSave={handleSave}
        onClose={handleClose}
      />
    </div>
  );
};
