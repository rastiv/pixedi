import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBellow } from "./useBellow";

describe("useBellow", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("tracks whether the observed element is below the breakpoint", () => {
    let callback: ResizeObserverCallback | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();

    vi.stubGlobal(
      "ResizeObserver",
      vi.fn(function (this: ResizeObserver, next: ResizeObserverCallback) {
        callback = next;
        this.observe = observe;
        this.disconnect = disconnect;
      }),
    );

    const element = document.createElement("div");
    const { result, unmount } = renderHook(() => useBellow("sm", element));
    const resize = (width: number) => {
      act(() => {
        callback?.(
          [{ contentRect: { width } } as ResizeObserverEntry],
          {} as ResizeObserver,
        );
      });
    };

    expect(result.current).toBe(true);
    expect(observe).toHaveBeenCalledWith(element);

    resize(479);
    expect(result.current).toBe(true);

    resize(480);
    expect(result.current).toBe(false);

    resize(320);
    expect(result.current).toBe(true);

    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
