import { useEffect, useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { ActionName, type CropRect } from "../types";
import { getInitalCrop } from "../utils/crop";

export const useCrop = () => {
  const {
    setCurrentAction,
    currentAction,
    getLastHistoryItem,
    addToHistory,
    setSidebar,
    eventBus,
  } = usePixediContext();
  const { width, height } = getLastHistoryItem();
  const { name, args } = currentAction || {};
  const currentValue = name === ActionName.CROP ? (args?.id as string) : "";
  const originRatio = width / height;

  const clipPathRef = useRef<CropRect>({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    if (currentAction?.name !== ActionName.CROP) {
      return;
    }

    const initialCrop = getInitalCrop(currentAction.args.ratio, width, height);
    clipPathRef.current = initialCrop;

    const onClipPathUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<CropRect>;
      clipPathRef.current = customEvent.detail;
    };

    eventBus.addEventListener("clip-path-update", onClipPathUpdate);

    return () => {
      eventBus.removeEventListener("clip-path-update", onClipPathUpdate);
    };
  }, [currentAction, width, height, eventBus]);

  const handleSave = () => {
    if (!currentAction || currentAction.name !== ActionName.CROP) {
      return;
    }

    const updatedWidth =
      currentAction.args?.preset?.width ||
      Math.round((width * clipPathRef.current.w) / 100);
    const updatedHeight =
      currentAction.args?.preset?.height ||
      Math.round((height * clipPathRef.current.h) / 100);

    addToHistory({
      width: updatedWidth,
      height: updatedHeight,
      action: {
        name: ActionName.CROP,
        args: { ...currentAction.args, ...clipPathRef.current },
      },
    });

    setSidebar(true);
  };

  const handleClose = () => {
    setCurrentAction(null);
    setSidebar(true);
  };

  const handleChange = (value: string) => {
    if (value === currentValue) {
      return;
    }

    setCurrentAction({
      name: ActionName.CROP,
      args: {
        id: value,
        ratio: /^\d+:\d+$/.test(value)
          ? value
              .split(":")
              .map(Number)
              .reduce((a, b) => a / b)
          : originRatio,
        isFree: value === "freeform",
      },
    });
    setSidebar(true);
  };

  return {
    currentValue,
    handleChange,
    handleSave,
    handleClose,
  };
};
