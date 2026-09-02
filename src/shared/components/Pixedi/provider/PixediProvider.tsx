import { useEffect, useMemo, useRef, useState } from "react";
import { getInitialState } from "./initialState";
import { StoreContext } from "./StoreContext";
import type { PixediContextType } from "./initialState";
import {
  ActionName,
  type Action,
  type HistoryItem,
  type ProcessedImage,
  type Settings,
} from "../types";

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

  // the previewUrl prop is owned by the caller (useImageLoader); only urls
  // created by setImage below belong to this provider and may be revoked here
  const ownedPreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (ownedPreviewUrlRef.current) {
        URL.revokeObjectURL(ownedPreviewUrlRef.current);
        ownedPreviewUrlRef.current = null;
      }
    };
  }, []);

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
        action: { name: ActionName.INITIAL, args: null },
      }
    );
  };

  const getLastRotation = (): number => {
    const { items, pointer } = state.history;
    if (items.length === 0 || pointer < 0) return 0;
    const lastRotateItem = items
      .slice(0, pointer + 1)
      .findLast((item) => item.action.name === ActionName.ROTATE);
    if (lastRotateItem?.action.name === ActionName.ROTATE) {
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

  const setImage = (payload: ProcessedImage) => {
    if (ownedPreviewUrlRef.current) {
      URL.revokeObjectURL(ownedPreviewUrlRef.current);
    }
    ownedPreviewUrlRef.current = URL.createObjectURL(payload.previewBlob);
    setState(
      getInitialState(
        payload.mimeType,
        payload.width,
        payload.height,
        payload.newBlob,
        ownedPreviewUrlRef.current,
        payload.isAlpha,
        settings,
      ),
    );
  };

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
