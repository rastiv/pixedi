import { Button, SaveCloseGroup, Tooltip } from "../ui";
import { Rotate, RotateCCW } from "../assets/icons";
import { useRotate } from "./useRotate";
import styles from "./Rotate.module.css";

export const RotateTools = () => {
  const { handleRotate, handleSave, handleClose } = useRotate();

  return (
    <div className={styles.rotate}>
      <div className={styles.scGroup}>
        <Tooltip orientation="horizontal" className={styles.tooltip}>
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
      <SaveCloseGroup onSave={handleSave} onClose={handleClose} />
    </div>
  );
};
