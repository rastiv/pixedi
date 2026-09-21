import { useState } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { useToolCommit } from "../hooks";
import { ActionName } from "../types";

export const useFlip = () => {
  const { getLastHistoryItem, setCurrentAction } = usePixediContext();
  const { commit, close, isSaving } = useToolCommit();
  const { width, height } = getLastHistoryItem();
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);

  const updateAction = (horizontal: boolean, vertical: boolean) => {
    setCurrentAction({
      name: ActionName.FLIP,
      args: { horizontal, vertical },
    });
  };

  const handleFlipHorizontal = () => {
    const next = !flipHorizontal;
    setFlipHorizontal(next);
    updateAction(next, flipVertical);
  };

  const handleFlipVertical = () => {
    const next = !flipVertical;
    setFlipVertical(next);
    updateAction(flipHorizontal, next);
  };

  const handleSave = () => {
    commit({
      width,
      height,
      action: {
        name: ActionName.FLIP,
        args: { horizontal: flipHorizontal, vertical: flipVertical },
      },
    });
  };

  return {
    flipHorizontal,
    flipVertical,
    handleFlipHorizontal,
    handleFlipVertical,
    handleSave,
    handleClose: close,
    isSaving,
  };
};
