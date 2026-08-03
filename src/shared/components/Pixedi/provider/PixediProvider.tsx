import { useState } from "react";
import { getInitialState } from "./initialState";
import { StoreContext } from "./StoreContext";
import type { PixediContextType } from "./initialState";
import type { Action, HistoryItem, Settings } from "../types";

type PixediProviderProps = {
  children: React.ReactNode;
  extension: string;
  width: number;
  height: number;
  originalBase64: string;
  originalSize: number;
  reducedBase64: string;
  settings: Settings;
};

export const PixediProvider = ({
  children,
  extension,
  width,
  height,
  originalBase64,
  originalSize,
  reducedBase64,
  settings,
}: PixediProviderProps) => {
  const [state, setState] = useState<PixediContextType>(
    getInitialState(
      extension,
      width,
      height,
      reducedBase64,
      originalBase64,
      originalSize,
      settings,
    ),
  );

  const getCurrentAction = () => state.currentAction;

  const setCurrentAction = (payload: Action | null) =>
    setState((store) => ({ ...store, currentAction: payload }));

  const addToHistory = (payload: HistoryItem) =>
    setState((store) => {
      const incrementedPointer = store.history.pointer + 1;
      const updatedItems = [
        ...store.history.items.slice(0, incrementedPointer),
        payload,
      ];
      return {
        ...store,
        currentAction: null,
        history: {
          items: updatedItems,
          pointer: incrementedPointer,
        },
      };
    });

  const getLastHistoryItem = () =>
    state.history.items.at(state.history.pointer)!;

  const resetHistory = () =>
    setState((store) => ({
      ...store,
      history: getInitialState(
        extension,
        width,
        height,
        reducedBase64,
        originalBase64,
        originalSize,
        settings,
      ).history,
    }));

  const resetHistoryAfterSave = () =>
    setState((store) => {
      const savedHistoryItem = store.history.items.at(store.history.pointer)!;
      return {
        ...store,
        history: {
          items: [savedHistoryItem],
          pointer: 0,
        },
      };
    });

  const undo = () =>
    setState((store) => {
      if (store.history.pointer <= 0) return store;
      return {
        ...store,
        history: { ...store.history, pointer: store.history.pointer - 1 },
      };
    });

  const redo = () =>
    setState((store) => {
      if (store.history.pointer >= store.history.items.length - 1) return store;
      return {
        ...store,
        history: { ...store.history, pointer: store.history.pointer + 1 },
      };
    });

  const getSidebar = () => state.sidebar;

  const setSidebar = (payload: boolean) =>
    setState((store) => ({ ...store, sidebar: payload }));

  const getSettings = () => state.settings;

  const value = {
    ...state,
    getCurrentAction,
    setCurrentAction,
    addToHistory,
    resetHistory,
    resetHistoryAfterSave,
    undo,
    redo,
    getLastHistoryItem,
    getSidebar,
    setSidebar,
    getSettings,
  };

  return <StoreContext value={value}>{children}</StoreContext>;
};
