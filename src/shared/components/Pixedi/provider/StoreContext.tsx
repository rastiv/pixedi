import { createContext } from "react";
import { type PixediContextType } from "./initialState";
import type {
  Action,
  FuncSaveArgs,
  HistoryItem,
  ProcessedImage,
} from "../types";

type StoreContextType = PixediContextType & {
  onSave: FuncSaveArgs;
  onBack: () => void;
  setImage: (payload: ProcessedImage) => void;
  setCurrentAction: (payload: Action | null) => void;
  toggleCompare: () => void;
  getLastHistoryItem: () => HistoryItem;
  getLastRotation: () => number;
  getLastFilter: () => HistoryItem | null;
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
