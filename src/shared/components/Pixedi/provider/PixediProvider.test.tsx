import { act, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("never revokes the previewUrl it does not own", () => {
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, revokeObjectURL });

    const { unmount } = renderHook(() => usePixediContext(), { wrapper });
    unmount();

    expect(revokeObjectURL).not.toHaveBeenCalledWith(
      "data:image/png;base64,initial",
    );
  });

  it("revokes only the preview urls it created through setImage", () => {
    const revokeObjectURL = vi.fn();
    const createObjectURL = vi
      .fn()
      .mockReturnValueOnce("blob:first")
      .mockReturnValueOnce("blob:second");
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });

    const { result, unmount } = renderHook(() => usePixediContext(), {
      wrapper,
    });

    const processed = {
      mimeType: "png",
      width: 400,
      height: 300,
      newBlob: new Blob([], { type: "image/png" }),
      previewBlob: new Blob([], { type: "image/webp" }),
      isAlpha: false,
    };

    act(() => {
      result.current.setImage(processed);
    });
    expect(result.current.previewUrl).toBe("blob:first");
    expect(revokeObjectURL).not.toHaveBeenCalled();

    act(() => {
      result.current.setImage(processed);
    });
    expect(result.current.previewUrl).toBe("blob:second");
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith("blob:first");

    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:second");
  });

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

  it("resets history to the initial item", () => {
    const { result } = renderHook(() => usePixediContext(), { wrapper });

    act(() => {
      result.current.addToHistory(editedItem);
    });
    expect(result.current.history).toEqual({
      items: [initialItem, editedItem],
      pointer: 1,
    });

    act(() => {
      result.current.addToHistory(secondEditedItem);
    });
    expect(result.current.history).toEqual({
      items: [initialItem, editedItem, secondEditedItem],
      pointer: 2,
    });

    act(() => {
      result.current.resetHistory();
    });
    expect(result.current.history).toEqual({
      items: [initialItem],
      pointer: 0,
    });
  });
});
