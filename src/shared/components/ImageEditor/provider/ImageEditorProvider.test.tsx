import { act, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";
import { ImageEditorProvider } from "./ImageEditorProvider";
import { useImageEditorContext } from "./useImageEditorContext";

const initialItem = {
  name: "Initial",
  base64: "data:image/png;base64,initial",
  width: 800,
  height: 600,
};

const editedItem = {
  name: "Resize",
  base64: "data:image/png;base64,edited",
  width: 400,
  height: 300,
};

const secondEditedItem = {
  name: "Crop",
  base64: "data:image/png;base64,cropped",
  width: 200,
  height: 200,
};

const wrapper = ({ children }: PropsWithChildren) => (
  <ImageEditorProvider
    base64={initialItem.base64}
    width={initialItem.width}
    height={initialItem.height}
    ext="png"
  >
    {children}
  </ImageEditorProvider>
);

describe("ImageEditorProvider", () => {
  it("initializes the image history and editor state", () => {
    const { result } = renderHook(() => useImageEditorContext(), { wrapper });

    expect(result.current.history).toEqual({ items: [initialItem], pointer: 0 });
    expect(result.current.extension).toBe("png");
    expect(result.current.currentAction).toBeNull();
    expect(result.current.getSidebar()).toBe(false);
    expect(result.current.getLastHistoryItem()).toEqual(initialItem);
  });

  it("updates the selected action and sidebar visibility", () => {
    const { result } = renderHook(() => useImageEditorContext(), { wrapper });
    const action = {
      name: "resize" as const,
      args: { width: 400, height: 300 },
    };

    act(() => {
      result.current.setCurrentAction(action);
      result.current.setSidebar(true);
    });

    expect(result.current.getCurrentAction()).toEqual(action);
    expect(result.current.getSidebar()).toBe(true);
  });

  it("adds edits, clears the action, and discards redo history", () => {
    const { result } = renderHook(() => useImageEditorContext(), { wrapper });

    act(() => {
      result.current.setCurrentAction({
        name: "resize",
        args: { width: 400, height: 300 },
      });
      result.current.addToHistory(editedItem);
      result.current.addToHistory(secondEditedItem);
      result.current.undo();
      result.current.addToHistory({ ...editedItem, name: "Replacement" });
    });

    expect(result.current.currentAction).toBeNull();
    expect(result.current.history.pointer).toBe(2);
    expect(result.current.history.items).toEqual([
      initialItem,
      editedItem,
      { ...editedItem, name: "Replacement" },
    ]);
  });

  it("moves through history without exceeding its boundaries", () => {
    const { result } = renderHook(() => useImageEditorContext(), { wrapper });

    act(() => {
      result.current.undo();
    });
    expect(result.current.history.pointer).toBe(0);

    act(() => {
      result.current.addToHistory(editedItem);
      result.current.undo();
    });
    expect(result.current.history.pointer).toBe(0);
    expect(result.current.getLastHistoryItem()).toEqual(initialItem);

    act(() => {
      result.current.redo();
      result.current.redo();
    });
    expect(result.current.history.pointer).toBe(1);
    expect(result.current.getLastHistoryItem()).toEqual(editedItem);
  });

  it("resets to the source image and resets history after saving", () => {
    const { result } = renderHook(() => useImageEditorContext(), { wrapper });

    act(() => {
      result.current.addToHistory(editedItem);
      result.current.resetHistoryAfterSave();
    });
    expect(result.current.history).toEqual({ items: [editedItem], pointer: 0 });

    act(() => {
      result.current.resetHistory();
    });
    expect(result.current.history).toEqual({ items: [initialItem], pointer: 0 });
  });
});
