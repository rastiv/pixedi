import { useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { ActionName } from "../types";
import { getOrientedSizes } from "../utils/crop";

export const useRotate = () => {
  const {
    getLastRotation,
    getLastHistoryItem,
    addToHistory,
    setSidebar,
    setCurrentAction,
  } = usePixediContext();
  const { width, height } = getLastHistoryItem();

  const lastRotation = getLastRotation();
  const baseAngleRef = useRef(lastRotation);
  const angleRef = useRef(lastRotation);

  const handleRotate = (value: number) => {
    angleRef.current += value;
    setCurrentAction({
      name: ActionName.ROTATE,
      args: { degrees: angleRef.current },
    });
  };

  const handleSave = () => {
    addToHistory({
      ...getOrientedSizes(
        width,
        height,
        baseAngleRef.current,
        angleRef.current,
      ),
      action: {
        name: ActionName.ROTATE,
        args: { degrees: angleRef.current },
      },
    });
    setSidebar(true);
  };

  const handleClose = () => {
    setCurrentAction(null);
    setSidebar(true);
  };

  return {
    handleRotate,
    handleSave,
    handleClose,
  };
};
