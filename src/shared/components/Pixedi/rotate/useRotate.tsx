import { useState } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { useToolCommit } from "../hooks";
import { ActionName } from "../types";
import { closestTurn, getRotatedSizes, normalizeAngle } from "../utils/preview";

export const useRotate = () => {
  const { getLastRotation, history, setCurrentAction } = usePixediContext();
  const { commit, close, isSaving } = useToolCommit();

  const [baseDegrees] = useState(getLastRotation);
  // kept within half a turn of the opening angle, so repeated full turns of
  // the thumb never pile up (the preview animates the short way on its own)
  const [degrees, setDegrees] = useState(baseDegrees);
  const selectorValue = normalizeAngle(degrees);

  const handleRotate = (angle: number) => {
    const next = closestTurn(angle, baseDegrees);
    if (next === degrees) return;
    setDegrees(next);
    setCurrentAction({ name: ActionName.ROTATE, args: { degrees: next } });
  };

  const handleSave = () => {
    const items = history.items.slice(0, history.pointer + 1);
    commit({
      ...getRotatedSizes(items, degrees),
      action: { name: ActionName.ROTATE, args: { degrees } },
    });
  };

  return {
    selectorValue,
    isChanged: degrees !== baseDegrees,
    handleRotate,
    handleSave,
    handleClose: close,
    isSaving,
  };
};
