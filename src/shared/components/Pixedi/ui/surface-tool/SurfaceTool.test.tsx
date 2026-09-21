import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SurfaceTool } from "./SurfaceTool";
import { SurfaceToolOffsetProvider } from "./SurfaceToolOffsetProvider";

afterEach(cleanup);

const PARENT = { width: 400, height: 300 };
// where the css anchor (bottom 16px, horizontally centered) puts a 100x20 tool
const TOOL = { left: 150, top: 264, width: 100, height: 20 };

const stubRect = (el: HTMLElement, rect: Partial<DOMRect>) => {
  el.getBoundingClientRect = () => ({ ...new DOMRect(), ...rect }) as DOMRect;
};

const Harness = ({ label = "tool" }: { label?: string }) => (
  <SurfaceToolOffsetProvider>
    <div data-testid="parent">
      <SurfaceTool key={label}>{label}</SurfaceTool>
    </div>
  </SurfaceToolOffsetProvider>
);

const setup = (container: HTMLElement) => {
  const parent = container.querySelector<HTMLElement>(
    "[data-testid='parent']",
  )!;
  const tool = parent.firstElementChild as HTMLElement;
  const handle = tool.querySelector("svg")!;

  stubRect(parent, { left: 0, top: 0, ...PARENT });
  stubRect(tool, TOOL);

  return { tool, handle };
};

describe("SurfaceTool", () => {
  it("moves by the pointer delta when dragged from the handle", () => {
    const { container } = render(<Harness />);
    const { tool, handle } = setup(container);

    fireEvent.mouseDown(handle, { clientX: 200, clientY: 200 });
    fireEvent.mouseMove(document, { clientX: 250, clientY: 190 });
    fireEvent.mouseUp(document);

    expect(tool.style.transform).toBe("translate(calc(-50% + 50px), -10px)");
  });

  it("keeps the tool inside its parent", () => {
    const { container } = render(<Harness />);
    const { tool, handle } = setup(container);

    fireEvent.mouseDown(handle, { clientX: 200, clientY: 200 });
    fireEvent.mouseMove(document, { clientX: 5000, clientY: 5000 });

    expect(tool.style.transform).toBe("translate(calc(-50% + 150px), 16px)");

    fireEvent.mouseMove(document, { clientX: -5000, clientY: -5000 });

    expect(tool.style.transform).toBe("translate(calc(-50% + -150px), -264px)");
  });

  it("ignores pointer moves that did not start on the handle", () => {
    const { container } = render(<Harness />);
    const { tool } = setup(container);

    fireEvent.mouseMove(document, { clientX: 250, clientY: 190 });

    expect(tool.style.transform).toBe("translate(calc(-50% + 0px), 0px)");
  });

  it("restores the dragged offset on the next mounted tool", () => {
    const { container, rerender } = render(<Harness label="first" />);
    const { handle } = setup(container);

    fireEvent.mouseDown(handle, { clientX: 200, clientY: 200 });
    fireEvent.mouseMove(document, { clientX: 250, clientY: 190 });
    fireEvent.mouseUp(document);

    rerender(<Harness label="second" />);
    const { tool } = setup(container);

    expect(tool.textContent).toContain("second");
    expect(tool.style.transform).toBe("translate(calc(-50% + 50px), -10px)");
  });
});
