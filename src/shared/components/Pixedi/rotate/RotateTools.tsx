import { Button, SaveCloseGroup } from "../ui";
import { Rotate, RotateCCW } from "../assets/icons";
import { useRotate } from "./useRotate";
import styles from "./Rotate.module.css";

export const RotateTools = () => {
  const { handleRotate, handleSave, handleClose } = useRotate();

  return (
    <div className={styles.rotate}>
      <div className={styles.scGroup}>
        <Button
          variant="outline"
          className={styles.btnH}
          onClick={() => handleRotate(90)}
        >
          <Rotate />
        </Button>
        <Button
          variant="outline"
          className={styles.btnV}
          onClick={() => handleRotate(-90)}
        >
          <RotateCCW />
        </Button>
      </div>
      <SaveCloseGroup onSave={handleSave} onClose={handleClose} />
    </div>
  );
};
