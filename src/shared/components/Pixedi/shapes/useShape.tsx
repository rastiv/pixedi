import { useEffect, useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { useToolCommit } from "../hooks";
import { emitShapeMaskUpdate } from "../eventBus";
import { SHAPE_BORDER } from "../constants";
import { getInitalCrop } from "../utils/crop";
import {
  ActionName,
  type CropRect,
  type ShapeMask,
  type ShapeType,
} from "../types";

const MIN_OUTLINE = 1;
const MAX_OUTLINE = 25;

export const useShape = (valueRef: React.RefObject<HTMLDivElement | null>) => {
  const { setCurrentAction, currentAction, getLastHistoryItem, eventBus } =
    usePixediContext();
  const { commit, close, isSaving } = useToolCommit();
  const { width, height } = getLastHistoryItem();
  const isShapes = currentAction?.name === ActionName.SHAPES;
  const mask: ShapeMask = isShapes
    ? {
        shape: currentAction.args.shape,
        outlined: currentAction.args.outlined,
        border: currentAction.args.border,
      }
    : { shape: "heart", outlined: false, border: SHAPE_BORDER };
  const borderPercent = Math.round(mask.border * 1000) / 10;

  const clipPathRef = useRef<CropRect>(getInitalCrop(1, width, height));

  // switching the shape or outline keeps the box, so only the image sizes
  // (and the tool being opened) reset the tracked rect
  useEffect(() => {
    if (!isShapes) return;

    clipPathRef.current = getInitalCrop(1, width, height);

    const onClipPathUpdate = (event: Event) => {
      clipPathRef.current = (event as CustomEvent<CropRect>).detail;
    };

    eventBus.addEventListener("clip-path-update", onClipPathUpdate);
    return () =>
      eventBus.removeEventListener("clip-path-update", onClipPathUpdate);
  }, [isShapes, width, height, eventBus]);

  const update = (args: Partial<ShapeMask>) =>
    setCurrentAction({ name: ActionName.SHAPES, args: { ...mask, ...args } });

  const handleChangeShape = (value: string) =>
    update({ shape: value as ShapeType });

  const handleToggleOutlined = () => update({ outlined: !mask.outlined });

  const handleSliderInput = (value: number) => {
    if (valueRef.current) {
      valueRef.current.textContent = value.toFixed(1);
    }
    emitShapeMaskUpdate(eventBus, { ...mask, border: value / 100 });
  };

  const handleSliderChange = (value: number) => update({ border: value / 100 });

  const handleSave = () => {
    if (!isShapes) return;

    const { x, y, w, h } = clipPathRef.current;
    commit({
      width: Math.round((width * w) / 100),
      height: Math.round((height * h) / 100),
      action: { name: ActionName.SHAPES, args: { ...mask, x, y, w, h } },
    });
  };

  return {
    ...mask,
    borderPercent,
    handleSliderInput,
    handleSliderChange,
    handleChangeShape,
    handleToggleOutlined,
    handleSave,
    handleClose: close,
    isSaving,
    MIN_OUTLINE,
    MAX_OUTLINE,
  };
};
