import { useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { Button, SaveCloseGroup } from "../ui";
import { Rotate, RotateCCW } from "../assets/icons";
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

  console.log(getLastRotation());

  const angleRef = useRef(getLastRotation());

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
      width:
        angleRef.current === 90 || angleRef.current === 270 ? height : width,
      height:
        angleRef.current === 90 || angleRef.current === 270 ? width : height,
      action: {
        name: "rotate",
        args: {
          degrees: angleRef.current,
        },
      },
    });
    setSidebar(true);
  };

  const handleClose = () => {
    setCurrentAction(null);
    setSidebar(true);
  };

  return (
    <div className={styles.rotate}>
      <div className={styles.scGroup}>
        <Button
          variant="outline"
          className={`${styles.rotateBtnH}`}
          onClick={() => handleRotate(90)}
        >
          <Rotate />
        </Button>
        <Button
          variant="outline"
          className={`${styles.rotateBtnV} `}
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
