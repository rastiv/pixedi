import { useEffect, useMemo, useState } from "react";
import { getInitialState } from "./initialState";
import { StoreContext } from "./StoreContext";
import type { PixediContextType } from "./initialState";
import type { Action, HistoryItem, ProcessedImage, Settings } from "../types";

type PixediProviderProps = {
  children: React.ReactNode;
  mimeType: string;
  width: number;
  height: number;
  originalBlob: Blob | null;
  previewUrl: string;
  isAlpha: boolean;
  settings: Settings;
};

export const PixediProvider = ({
  children,
  mimeType,
  width,
  height,
  originalBlob,
  previewUrl,
  isAlpha,
  settings,
}: PixediProviderProps) => {
  const [state, setState] = useState<PixediContextType>(
    getInitialState(
      mimeType,
      width,
      height,
      originalBlob,
      previewUrl,
      isAlpha,
      settings,
    ),
  );

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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

  const getLastHistoryItem = (): HistoryItem => {
    const { items, pointer } = state.history;
    return (
      items.at(pointer) ??
      items.at(0) ?? {
        width: 0,
        height: 0,
        action: { name: "initial", args: null },
      }
    );
  };

  const getLastRotation = (): number => {
    const { items, pointer } = state.history;
    if (items.length === 0 || pointer < 0) return 0;
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
      history: {
        items: [store.history.items[0]],
        pointer: 0,
      },
    }));

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

  const eventBus = useMemo(() => new EventTarget(), []);

  const setImage = (payload: ProcessedImage) =>
    setState(
      getInitialState(
        payload.mimeType,
        payload.width,
        payload.height,
        payload.newBlob,
        URL.createObjectURL(payload.previewBlob),
        payload.isAlpha,
        settings,
      ),
    );

  const value = {
    ...state,
    setImage,
    setCurrentAction,
    getLastHistoryItem,
    getLastRotation,
    addToHistory,
    resetHistory,
    undo,
    redo,
    setSidebar,
    eventBus,
  };

  return <StoreContext value={value}>{children}</StoreContext>;
};
