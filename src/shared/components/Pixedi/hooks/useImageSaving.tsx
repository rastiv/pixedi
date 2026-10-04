import { useState } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { imageProcessor, blobToBase64 } from "../utils/imageProcessor";
import { getProcessingSteps } from "../utils/preview";
import type { HistoryItem } from "../types";

export const useImageSaving = () => {
  const [isSaving, setIsSaving] = useState(false);
  const {
    setImage,
    settings,
    history,
    originalBlob,
    setCurrentAction,
    resetHistory,
    onSave,
  } = usePixediContext();

  // a pending item lets a tool save a change that is not in the history yet
  const save = async (pendingItem?: HistoryItem) => {
    if (!originalBlob || isSaving) return;

    setIsSaving(true);

    const historyItems = [
      ...history.items.slice(0, history.pointer + 1),
      ...(pendingItem ? [pendingItem] : []),
    ];
    const { steps, filters } = getProcessingSteps(historyItems);
    const hasShape = steps.some((step) => step.shape);

    try {
      const processor = await imageProcessor(originalBlob);

      for (const { crop, flip, rotate, resize, shape } of steps) {
        if (crop) processor.crop(crop.x, crop.y, crop.w, crop.h);
        if (flip) processor.flip(flip.horizontal, flip.vertical);
        if (rotate) processor.rotate(rotate.degrees);
        if (resize) processor.resize(resize.width, resize.height);
        if (shape) processor.shape(shape);
      }
      if (filters) processor.filters(filters);

      // shapes leave transparent corners, which only WEBP keeps compactly
      const { newBlob, previewBlob, mimeType, width, height, isAlpha } =
        await processor.get({
          ...settings,
          saveAsWEBP: settings.saveAsWEBP || hasShape,
        });

      let base64 = "";
      if (settings.exportAs === "base64") {
        base64 = await blobToBase64(newBlob);
      }

      await onSave(base64 || newBlob);

      setImage({ newBlob, previewBlob, mimeType, width, height, isAlpha });
    } catch (error) {
      throw new Error(`Error saving image: ${error}`, { cause: error });
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
