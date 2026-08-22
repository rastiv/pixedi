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
  originalBlob: Blob | null;
  originalSize: number;
  previewUrl: string;
  isAlpha: boolean;
  settings: Settings;
};

export const PixediProvider = ({
  children,
  extension,
  width,
  height,
  originalBlob,
  originalSize,
  previewUrl,
  isAlpha,
  settings,
}: PixediProviderProps) => {
  const [state, setState] = useState<PixediContextType>(
    getInitialState(
      extension,
      width,
      height,
      previewUrl,
      originalBlob,
      originalSize,
      settings,
      isAlpha,
    ),
  );

  const setOriginalBlob = (payload: Blob | null) =>
    setState((store) => ({ ...store, originalBlob: payload }));

  const setPreviewUrl = (payload: string) =>
    setState((store) => ({ ...store, previewUrl: payload }));

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

  const getLastRotation = () => {
    const { items, pointer } = state.history;
    if (!items) return 0;
    const lastRotateItem = items
      .slice(0, pointer + 1)
      .findLast((item) => item.action.name === "rotate");
    if (lastRotateItem?.action.name === "rotate") {
      return lastRotateItem.action.args.degrees;
    }
    return 0;
  };

  const resetHistory = () =>
    setState((store) => ({
      ...store,
      history: getInitialState(
        extension,
        width,
        height,
        previewUrl,
        originalBlob,
        originalSize,
        settings,
        isAlpha,
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

  const setSidebar = (payload: boolean) =>
    setState((store) => ({ ...store, sidebar: payload }));

  const value = {
    ...state,
    setOriginalBlob,
    setPreviewUrl,
    setCurrentAction,
    getLastHistoryItem,
    getLastRotation,
    addToHistory,
    resetHistory,
    resetHistoryAfterSave,
    undo,
    redo,
    setSidebar,
  };

  return <StoreContext value={value}>{children}</StoreContext>;
};
