import { useMemo, useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { Button, SaveCloseGroup } from "../ui";
import { Rotate, RotateCCW } from "../assets/icons";
import styles from "./Rotate.module.css";

export const RotateTools = () => {
  const {
    history,
    getLastHistoryItem,
    addToHistory,
    setSidebar,
    setCurrentAction,
  } = usePixediContext();
  const { width, height } = getLastHistoryItem();
  const { pointer, items } = history;

  const lastAngleInHistory = useMemo(() => {
    if (!items) return 0;
    const lastRotateItem = items
      .slice(0, pointer + 1)
      .findLast((item) => item.action.name === "rotate");
    if (lastRotateItem?.action.name === "rotate") {
      return lastRotateItem.action.args.degrees;
    }
    return 0;
  }, [pointer, items]);

  const angleRef = useRef(lastAngleInHistory);

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
    // addToHistory({
    //   width: isNewRatio ? height : width,
    //   height: isNewRatio ? width : height,
    //   action: {
    //     name: "rotate",
    //     args: {
    //       degrees: angle,
    //     },
    //   },
    // });
    // setAngle(0);
    // setSidebar(true);
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
        disabled={angleRef?.current === lastAngleInHistory}
        onSave={handleSave}
        onClose={handleClose}
      />
    </div>
  );
};
