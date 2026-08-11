import { createContext } from "react";
import { type PixediContextType } from "./initialState";
import type { Action, HistoryItem } from "../types";

type StoreContextType = PixediContextType & {
  setOriginalBase64: (payload: string) => void;
  setReducedBase64: (payload: string) => void;
  setCurrentAction: (payload: Action | null) => void;
  getLastHistoryItem: () => HistoryItem;
  addToHistory: (payload: HistoryItem) => void;
  resetHistory: () => void;
  resetHistoryAfterSave: () => void;
  undo: () => void;
  redo: () => void;
  setSidebar: (payload: boolean) => void;
};

export const StoreContext = createContext<StoreContextType | undefined>(
  undefined,
);
