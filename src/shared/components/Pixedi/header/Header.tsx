import { ArrowLeft, Check, Undo, Redo, Loader } from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { Button } from "../ui";
import { useImageSaving } from "../hooks/useImageSaving";
import type { FuncSaveArgs } from "../types";
import buttonStyles from "../ui/button/button.module.css";
import styles from "./Header.module.css";

type HeaderProps = {
  onBack: () => void;
  onSave: FuncSaveArgs;
};

export const Header = ({ onBack, onSave }: HeaderProps) => {
  const { save, reset, isSaving } = useImageSaving(onSave);
  const { history, undo, redo } = usePixediContext();

  const showHistory = history.items.length > 1 && !isSaving;
  const disabledUndo = history.pointer === 0;
  const disabledRedo = history.pointer === history.items.length - 1;
  const disableReset = history.items.length < 2 || isSaving;
  const disableSave = disableReset || history.pointer === 0;

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
        <Button variant="outline" disabled={disableReset} onClick={reset}>
          Reset
        </Button>
        <Button disabled={disableSave} onClick={save}>
          {isSaving ? <Loader /> : <Check />}
          Save
        </Button>
      </div>
    </div>
  );
};
