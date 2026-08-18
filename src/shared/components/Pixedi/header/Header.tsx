import { useState } from "react";
import { ArrowLeft, Check, Undo, Redo, Loader } from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { Button } from "../ui";
import { useImageProcessor } from "../hooks";
import type { FuncSaveArgs } from "../types";
import buttonStyles from "../ui/button/button.module.css";
import styles from "./Header.module.css";
import { getPreview } from "@/shared/components/Pixedi/utils/preview";

type HeaderProps = {
  onBack: () => void;
  onSave: FuncSaveArgs;
};

export const Header = ({ onBack, onSave }: HeaderProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const {
    history,
    undo,
    redo,
    resetHistory,
    resetHistoryAfterSave,
    setCurrentAction,
  } = usePixediContext();
  const { save } = useImageProcessor(true);

  const showHistory = history.items.length > 1 && !isSaving;
  const disabledUndo = history.pointer === 0;
  const disabledRedo = history.pointer === history.items.length - 1;
  const disableSave = history.items.length < 2 || isSaving;

  const handleReset = () => {
    setCurrentAction(null);
    resetHistory();
  };

  const handleSave = async () => {
    const p = getPreview(history.items);
    // setIsSaving(true);
    // try {
    //   const processedBase64 = await save(base64, quality);
    //   await await onSave(processedBase64);
    //   setCurrentAction(null);
    //   resetHistoryAfterSave();
    // } finally {
    //   setIsSaving(false);
    // }
  };

  return (
    <div className={styles.header}>
      <Button variant="ghost" className={buttonStyles.rect} onClick={onBack}>
        <ArrowLeft />
      </Button>

      <div className={styles.tools}>
        {showHistory && (
          <div className={styles.history}>
            <Button
              variant="outline"
              disabled={disabledUndo}
              className={buttonStyles.rect}
              onClick={undo}
            >
              <Undo />
            </Button>
            <div className={styles.historyText}>
              {history.pointer + 1}/{history.items.length}
            </div>
            <Button
              variant="outline"
              disabled={disabledRedo}
              className={buttonStyles.rect}
              onClick={redo}
            >
              <Redo />
            </Button>
          </div>
        )}
        <Button variant="outline" disabled={disableSave} onClick={handleReset}>
          Reset
        </Button>
        <Button disabled={disableSave} onClick={handleSave}>
          {isSaving ? <Loader /> : <Check />}
          Save
        </Button>
      </div>
    </div>
  );
};
