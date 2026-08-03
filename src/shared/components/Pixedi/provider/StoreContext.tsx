import { createContext } from "react";
import { type PixediContextType } from "./initialState";
import type { Action, HistoryItem, Settings } from "../types";

type StoreContextType = PixediContextType & {
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
  getSettings: () => Settings;
  getAlpha: () => boolean;
};

export const StoreContext = createContext<StoreContextType | undefined>(
  undefined,
);
