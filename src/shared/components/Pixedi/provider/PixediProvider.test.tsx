import { act, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";
import { PixediProvider } from "./PixediProvider";
import { usePixediContext } from "./usePixediContext";

const initialItem = {
  width: 800,
  height: 600,
  action: { name: "initial" as const, args: null },
};

const editedItem = {
  width: 400,
  height: 300,
  action: { name: "resize" as const, args: { width: 400, height: 300 } },
};

const secondEditedItem = {
  width: 200,
  height: 200,
  action: {
    name: "crop" as const,
    args: { id: "crop-1", ratio: 1, isFree: true, x: 0, y: 0, w: 200, h: 200 },
  },
};

const wrapper = ({ children }: PropsWithChildren) => (
  <PixediProvider
    mimeType="png"
    previewUrl="data:image/png;base64,initial"
    originalBlob={new Blob([], { type: "image/png" })}
    width={initialItem.width}
    height={initialItem.height}
    settings={{}}
    isAlpha={false}
  >
    {children}
  </PixediProvider>
);

describe("PixediProvider", () => {
  it("initializes the image history and editor state", () => {
    const { result } = renderHook(() => usePixediContext(), { wrapper });

    expect(result.current.history).toEqual({
      items: [initialItem],
      pointer: 0,
    });
    expect(result.current.mimeType).toBe("png");
    expect(result.current.currentAction).toBeNull();
    expect(result.current.getLastHistoryItem()).toEqual(initialItem);
  });

  it("updates the selected action and sidebar visibility", () => {
    const { result } = renderHook(() => usePixediContext(), { wrapper });
    const action = {
      name: "resize" as const,
      args: { width: 400, height: 300 },
    };

    act(() => {
      result.current.setCurrentAction(action);
      result.current.setSidebar(true);
    });

    expect(result.current.currentAction).toEqual(action);
  });

  it("adds edits, clears the action, and discards redo history", () => {
    const { result } = renderHook(() => usePixediContext(), { wrapper });

    act(() => {
      result.current.setCurrentAction({
        name: "resize",
        args: { width: 400, height: 300 },
      });
      result.current.addToHistory(editedItem);
      result.current.addToHistory(secondEditedItem);
      result.current.undo();
      result.current.addToHistory({
        ...editedItem,
        action: {
          name: "rotate" as const,
          args: { degrees: 90 },
        },
      });
    });

    expect(result.current.currentAction).toBeNull();
    expect(result.current.history.pointer).toBe(2);
    expect(result.current.history.items).toEqual([
      initialItem,
      editedItem,
      {
        ...editedItem,
        action: {
          name: "rotate" as const,
          args: { degrees: 90 },
        },
      },
    ]);
  });

  it("moves through history without exceeding its boundaries", () => {
    const { result } = renderHook(() => usePixediContext(), { wrapper });

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

  it("resets to the last saved image after saving", () => {
    const { result } = renderHook(() => usePixediContext(), { wrapper });

    act(() => {
      result.current.setState({
        ...result.current,
        history: { items: [editedItem], pointer: 0 },
      });
    });
    expect(result.current.history).toEqual({ items: [editedItem], pointer: 0 });

    act(() => {
      result.current.addToHistory(secondEditedItem);
    });
    expect(result.current.history).toEqual({
      items: [editedItem, secondEditedItem],
      pointer: 1,
    });

    act(() => {
      result.current.resetHistory();
    });
    expect(result.current.history).toEqual({
      items: [editedItem],
      pointer: 0,
    });
  });
});
