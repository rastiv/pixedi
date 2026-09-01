import { useEffect, useRef } from "react";
import { presetsData } from "../constants";
import { usePixediContext } from "../provider/usePixediContext";
import { ActionName, type CropRect } from "../types";
import { getInitalCrop } from "../utils/crop";

const presetOptions = presetsData.map((p) => p.options).flat();
const flattenPresets = () => presetOptions;

export const usePreset = () => {
  const {
    currentAction,
    getLastHistoryItem,
    addToHistory,
    setSidebar,
    setCurrentAction,
    eventBus,
  } = usePixediContext();
  const { width, height } = getLastHistoryItem();
  const currentValue =
    currentAction?.name === ActionName.PRESET_CROP &&
    presetOptions.some((preset) => preset.value === currentAction.args.id)
      ? currentAction.args.id
      : "";

  const clipPathRef = useRef<CropRect>({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    if (currentAction?.name !== ActionName.PRESET_CROP) {
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

  const handleChange = (value: string | null) => {
    if (!value) {
      return;
    }

    const option = flattenPresets().find((po) => po.value === value);
    if (!option) {
      return;
    }

    const args = {
      id: value,
      ratio: option.w / option.h,
      isFree: false,
      preset: { width: option.w, height: option.h },
    };

    setCurrentAction({ name: ActionName.PRESET_CROP, args });
    setSidebar(false);
  };

  const handleSave = () => {
    if (!currentAction || currentAction.name !== ActionName.PRESET_CROP) {
      return;
    }

    addToHistory({
      width: currentAction.args?.preset?.width || 0,
      height: currentAction.args?.preset?.height || 0,
      action: {
        name: ActionName.CROP,
        args: { ...currentAction.args, ...clipPathRef.current },
      },
    });

    setSidebar(false);
  };

  const handleClose = () => {
    setCurrentAction(null);
    setSidebar(false);
  };

  return {
    currentValue,
    presetsData,
    handleChange,
    handleSave,
    handleClose,
  };
};
