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
    isSaving,
    i18n,
  } = useFlip();

  return (
    <SurfaceTool>
      <div className={styles.scGroup}>
        <Tooltip position="top">
          <Button
            variant="outline"
            className={styles.btnH}
            onClick={handleFlipHorizontal}
            aria-label={i18n("horizontal")}
            data-tooltip={i18n("horizontal")}
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
            aria-label={i18n("vertical")}
            data-tooltip={i18n("vertical")}
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
        saving={isSaving}
        onSave={handleSave}
        onClose={handleClose}
      />
    </SurfaceTool>
  );
};
