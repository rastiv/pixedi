import { createContext } from "react";
import { type ImageEditorContextType } from "./initialState";
import type { Action, HistoryItem } from "../types";

type StoreContextType = ImageEditorContextType & {
  getCurrentAction: () => Action | null;
  setCurrentAction: (payload: Action | null) => void;
  addToHistory: (payload: HistoryItem) => void;
  getLastHistoryItem: () => HistoryItem;
  resetHistory: () => void;
  resetHistoryAfterSave: () => void;
  undo: () => void;
  redo: () => void;
  getSidebar: () => boolean;
  setSidebar: (payload: boolean) => void;
};

export const StoreContext = createContext<StoreContextType | undefined>(
  undefined,
);
