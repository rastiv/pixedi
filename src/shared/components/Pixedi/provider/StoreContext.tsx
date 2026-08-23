import { createContext } from "react";
import { type PixediContextType } from "./initialState";
import type { Action, HistoryItem } from "../types";

type StoreContextType = PixediContextType & {
  setImageData: (payload: {
    originalBlob: Blob | null;
    previewUrl: string;
    extension: string;
    width: number;
    height: number;
    isAlpha: boolean;
  }) => void;
  setCurrentAction: (payload: Action | null) => void;
  getLastHistoryItem: () => HistoryItem;
  getLastRotation: () => number;
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
