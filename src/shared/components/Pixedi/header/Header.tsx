import {
  ArrowLeft,
  Check,
  Undo,
  Redo,
  Loader,
  SidebarOpen,
  SidebarClose,
} from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { Button } from "../ui";
import { useImageSaving } from "../hooks/useImageSaving";
import type { FuncSaveArgs } from "../types";
import buttonStyles from "../ui/button/Button.module.css";
import styles from "./Header.module.css";

type HeaderProps = {
  onBack: () => void;
  onSave: FuncSaveArgs;
  isMobile: boolean;
};

export const Header = ({ onBack, onSave, isMobile }: HeaderProps) => {
  const { save, reset, isSaving } = useImageSaving(onSave);
  const { sidebar, history, undo, redo, setSidebar, setCurrentAction } =
    usePixediContext();

  const showHistory = history.items.length > 1 && !isSaving;
  const disabledUndo = history.pointer === 0;
  const disabledRedo = history.pointer === history.items.length - 1;
  const disableReset = history.items.length < 2 || isSaving;
  const disableSave = disableReset || history.pointer === 0;

  const handleToggleSidebar = () => {
    setSidebar(!sidebar);
  };

  const handleUndo = () => {
    undo();
    setCurrentAction(null);
  };

  const handleRedo = () => {
    redo();
    setCurrentAction(null);
  };

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <div
          className={`${styles.sidebarToggle} ${isMobile ? styles.mobile : ""}`}
          onClick={handleToggleSidebar}
        >
          {!sidebar ? (
            <SidebarOpen className={styles.sidebarIcon} />
          ) : (
            <SidebarClose className={styles.sidebarIcon} />
          )}
        </div>
        <Button variant="ghost" className={buttonStyles.rect} onClick={onBack}>
          <ArrowLeft />
        </Button>
      </div>

      <div className={styles.tools}>
        {showHistory && (
          <div className={styles.history}>
            <Button
              variant="outline"
              disabled={disabledUndo}
              className={buttonStyles.rect}
              onClick={handleUndo}
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
              onClick={handleRedo}
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
