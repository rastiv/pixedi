import { createContext } from "react";
import { type PixediContextType } from "./initialState";
import type { Action, HistoryItem } from "../types";

type StoreContextType = PixediContextType & {
  setState: (payload: PixediContextType) => void;
  setCurrentAction: (payload: Action | null) => void;
  getLastHistoryItem: () => HistoryItem;
  getLastRotation: () => number;
  addToHistory: (payload: HistoryItem) => void;
  resetHistory: () => void;
  undo: () => void;
  redo: () => void;
  setSidebar: (payload: boolean) => void;
};

export const StoreContext = createContext<StoreContextType | undefined>(
  undefined,
);
