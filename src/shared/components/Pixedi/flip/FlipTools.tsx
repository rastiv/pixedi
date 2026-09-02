import { Button, SaveCloseGroup } from "../ui";
import { FlipH, FlipV } from "../assets/icons";
import { useFlip } from "./useFlip";
import styles from "./Flip.module.css";

export const FlipTools = () => {
  const {
    flipHorizontal,
    flipVertical,
    handleFlipHorizontal,
    handleFlipVertical,
    handleSave,
    handleClose,
  } = useFlip();

  return (
    <div className={styles.flip}>
      <div className={styles.scGroup}>
        <Button
          variant="outline"
          className={styles.btnH}
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
          className={styles.btnV}
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
