import { useState } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { imageProcessor } from "../utils/imageProcessor";
import { getActions } from "../utils/preview";
import type { FuncSaveArgs } from "../types";

export const useImageSaving = (onSave: FuncSaveArgs) => {
  const [isSaving, setIsSaving] = useState(false);
  const {
    settings,
    history,
    originalBlob,
    resetHistoryAfterSave,
    setCurrentAction,
    resetHistory,
  } = usePixediContext();

  const save = async () => {
    if (!originalBlob) return;

    setIsSaving(true);

    const historyItems = history.items.slice(0, history.pointer + 1);
    const actions = getActions(historyItems);

    try {
      const processor = await imageProcessor(originalBlob);

      if (actions.crop)
        processor.crop(
          actions.crop.x,
          actions.crop.y,
          actions.crop.w,
          actions.crop.h,
        );
      if (actions.flip)
        processor.flip(actions.flip.horizontal, actions.flip.vertical);
      if (actions.rotate) processor.rotate(actions.rotate.degrees);
      if (actions.resize)
        processor.resize(actions.resize.width, actions.resize.height);

      const newImage = await processor.get(settings);
      await onSave(newImage);

      setCurrentAction(null);
      resetHistoryAfterSave();
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setCurrentAction(null);
    resetHistory();
  };

  return { save, reset, isSaving };
};
