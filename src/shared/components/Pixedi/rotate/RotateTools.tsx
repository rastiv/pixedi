import { Button, SaveCloseGroup, SurfaceTool, Tooltip } from "../ui";
import { Rotate, RotateCCW } from "../assets/icons";
import { useRotate } from "./useRotate";
import styles from "./Rotate.module.css";

export const RotateTools = () => {
  const { handleRotate, handleSave, handleClose, isSaving } = useRotate();

  return (
    <SurfaceTool>
      <div className={styles.scGroup}>
        <Tooltip position="top">
          <Button
            variant="outline"
            className={styles.btnH}
            onClick={() => handleRotate(90)}
            aria-label="+90°"
            data-tooltip="+90°"
          >
            <Rotate />
          </Button>
          <Button
            variant="outline"
            className={styles.btnV}
            onClick={() => handleRotate(-90)}
            aria-label="-90°"
            data-tooltip="-90°"
          >
            <RotateCCW />
          </Button>
        </Tooltip>
      </div>
      <SaveCloseGroup
        onSave={handleSave}
        onClose={handleClose}
        saving={isSaving}
      />
    </SurfaceTool>
  );
};
