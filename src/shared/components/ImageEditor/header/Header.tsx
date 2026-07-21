import { useState } from "react";
import { ArrowLeft, Check, Undo, Redo, Loader } from "../assets/icons";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import { Button } from "../ui";
import type { FuncSaveArgs } from "../types";
import "./header.css";

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
    getLastHistoryItem,
  } = useImageEditorContext();

  const { base64 } = getLastHistoryItem();
  const showHistory = history.items.length > 1 && !isSaving;
  const disabledUndo = history.pointer === 0;
  const disabledRedo = history.pointer === history.items.length - 1;
  const disableSave = history.items.length < 2 || isSaving;

  const handleSave = async () => {
    if (!base64) return;
    setIsSaving(true);
    try {
      await onSave(base64);
      resetHistoryAfterSave();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="header">
      <Button variant="ghost" className="btn-rect" onClick={onBack}>
        <ArrowLeft />
      </Button>

      <div className="header-tools">
        {showHistory && (
          <div className="header-history">
            <Button
              variant="outline"
              disabled={disabledUndo}
              className="btn-rect"
              onClick={undo}
            >
              <Undo />
            </Button>
            <div className="header-history-text">
              {history.pointer + 1}/{history.items.length}
            </div>
            <Button
              variant="outline"
              disabled={disabledRedo}
              className="btn-rect"
              onClick={redo}
            >
              <Redo />
            </Button>
          </div>
        )}
        <Button variant="outline" disabled={isSaving} onClick={resetHistory}>
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
