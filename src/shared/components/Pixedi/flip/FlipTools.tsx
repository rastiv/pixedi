import { Button, SaveCloseGroup, SurfaceTool, Tooltip } from "../ui";
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
    <SurfaceTool>
      <div className={styles.scGroup}>
        <Tooltip position="top">
          <Button
            variant="outline"
            className={styles.btnH}
            onClick={handleFlipHorizontal}
            aria-label="Horizontal"
            data-tooltip="Horizontal"
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
            aria-label="Vertical"
            data-tooltip="Vertical"
          >
            <FlipV
              style={{
                color: flipVertical
                  ? "var(--accent-blue)"
                  : "var(--foreground)",
              }}
            />
          </Button>
        </Tooltip>
      </div>
      <SaveCloseGroup
        disabled={!flipHorizontal && !flipVertical}
        onSave={handleSave}
        onClose={handleClose}
      />
    </SurfaceTool>
  );
};
