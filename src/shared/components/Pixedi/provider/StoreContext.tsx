import { createContext } from "react";
import { type PixediContextType } from "./initialState";
import type { Action, HistoryItem, ProcessedImage } from "../types";

type StoreContextType = PixediContextType & {
  setImage: (payload: ProcessedImage) => void;
  setCurrentAction: (payload: Action | null) => void;
  getLastHistoryItem: () => HistoryItem;
  getLastRotation: () => number;
  addToHistory: (payload: HistoryItem) => void;
  resetHistory: () => void;
  undo: () => void;
  redo: () => void;
  setSidebar: (payload: boolean) => void;
  eventBus: EventTarget;
};

export const StoreContext = createContext<StoreContextType | undefined>(
  undefined,
);
