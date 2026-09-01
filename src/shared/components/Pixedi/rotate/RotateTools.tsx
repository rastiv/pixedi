import { useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { Button, SaveCloseGroup } from "../ui";
import { Rotate, RotateCCW } from "../assets/icons";
import { getOrientedSizes } from "../utils/crop";
import styles from "./Rotate.module.css";

export const RotateTools = () => {
  const {
    getLastRotation,
    getLastHistoryItem,
    addToHistory,
    setSidebar,
    setCurrentAction,
  } = usePixediContext();
  const { width, height } = getLastHistoryItem();

  const lastRotation = getLastRotation();
  // the rotation the stored sizes of the last history item were produced with
  const baseAngleRef = useRef(lastRotation);
  const angleRef = useRef(lastRotation);

  const handleRotate = (value: number) => {
    angleRef.current += value;
    setCurrentAction({
      name: "rotate",
      args: {
        degrees: angleRef.current,
      },
    });
  };

  const handleSave = async () => {
    addToHistory({
      ...getOrientedSizes(
        width,
        height,
        baseAngleRef.current,
        angleRef.current,
      ),
      action: {
        name: "rotate",
        args: {
          degrees: angleRef.current,
        },
      },
    });
    setSidebar(false);
  };

  const handleClose = () => {
    setCurrentAction(null);
    setSidebar(false);
  };

  return (
    <div className={styles.rotate}>
      <div className={styles.scGroup}>
        <Button
          variant="outline"
          className={`${styles.btnH}`}
          onClick={() => handleRotate(90)}
        >
          <Rotate />
        </Button>
        <Button
          variant="outline"
          className={`${styles.btnV} `}
          onClick={() => handleRotate(-90)}
        >
          <RotateCCW />
        </Button>
      </div>
      <SaveCloseGroup
        // disabled={angleRef?.current === getLastRotation()}
        onSave={handleSave}
        onClose={handleClose}
      />
    </div>
  );
};
