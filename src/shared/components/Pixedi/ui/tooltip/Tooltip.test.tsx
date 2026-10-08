import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip } from "./Tooltip";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const renderTooltip = (delay?: number) => {
  const view = render(
    <Tooltip delay={delay}>
      <button type="button" data-tooltip="First">
        A
      </button>
      <button type="button" data-tooltip="Second">
        B
      </button>
    </Tooltip>,
  );
  const tooltip = view.container.firstElementChild as HTMLElement;
  const opacity = () => tooltip.style.getPropertyValue("--tooltip-opacity");
  return { ...view, tooltip, opacity };
};

describe("Tooltip", () => {
  it("shows after the default 500ms delay", () => {
    const { getByText, opacity } = renderTooltip();

    fireEvent.mouseMove(getByText("A"));
    act(() => vi.advanceTimersByTime(499));
    expect(opacity()).toBe("0");

    act(() => vi.advanceTimersByTime(1));
    expect(opacity()).toBe("1");
  });

  it("respects a custom delay", () => {
    const { getByText, opacity } = renderTooltip(100);

    fireEvent.mouseMove(getByText("A"));
    act(() => vi.advanceTimersByTime(100));

    expect(opacity()).toBe("1");
  });

  it("shows immediately with a zero delay", () => {
    const { getByText, opacity } = renderTooltip(0);

    fireEvent.mouseMove(getByText("A"));

    expect(opacity()).toBe("1");
  });

  it("cancels a pending show when the pointer leaves", () => {
    const { getByText, tooltip, opacity } = renderTooltip();

    fireEvent.mouseMove(getByText("A"));
    fireEvent.mouseLeave(tooltip);
    act(() => vi.advanceTimersByTime(500));

    expect(opacity()).toBe("0");
  });

  it("switches anchors without delay once visible", () => {
    const { getByText, tooltip, opacity } = renderTooltip();

    fireEvent.mouseMove(getByText("A"));
    act(() => vi.advanceTimersByTime(500));
    fireEvent.mouseMove(getByText("B"));

    expect(opacity()).toBe("1");
    expect(tooltip.textContent).toContain("Second");
  });
});
