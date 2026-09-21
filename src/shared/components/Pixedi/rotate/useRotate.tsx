import { useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { useToolCommit } from "../hooks";
import { ActionName } from "../types";
import { getOrientedSizes } from "../utils/crop";

export const useRotate = () => {
  const { getLastRotation, getLastHistoryItem, setCurrentAction } =
    usePixediContext();
  const { commit, close, isSaving } = useToolCommit();
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
    commit({
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
  };

  return {
    handleRotate,
    handleSave,
    handleClose: close,
    isSaving,
  };
};
