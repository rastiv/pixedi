import { usePixediContext } from "../provider/usePixediContext";
import { useImageSaving } from "./useImageSaving";
import type { HistoryItem } from "../types";

export const useToolCommit = () => {
  const { singleToolUI, addToHistory, setCurrentAction, setSidebar, onBack } =
    usePixediContext();
  const { save, isSaving } = useImageSaving();

  // with a single tool there is no header, so the tool itself produces the
  // image and hands it to the consumer instead of pushing to the history
  const commit = (item: HistoryItem) => {
    if (singleToolUI) {
      return save(item);
    }
    addToHistory(item);
    setSidebar(true);
  };

  const close = () => {
    if (singleToolUI) {
      onBack();
      return;
    }
    setCurrentAction(null);
    setSidebar(true);
  };

  return { commit, close, isSaving, singleToolUI };
};
