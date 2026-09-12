import { cleanup, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Slider, type SliderHandle } from "./Slider";

afterEach(cleanup);

const getElements = (container: HTMLElement) => ({
  slider: container.firstElementChild as HTMLDivElement,
  input: container.querySelector("input")!,
});

describe("Slider", () => {
  it("updates progress during pointer movement and commits once on release", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Slider min={0} max={100} value={25} onChange={onChange} />,
    );
    const { slider, input } = getElements(container);

    fireEvent.input(input, { target: { value: "75" } });

    expect(slider.style.getPropertyValue("--slider-progress")).toBe("75%");
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.pointerUp(input);

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(75);
  });

  it("exposes the current native input value", () => {
    const ref = createRef<SliderHandle>();
    const { container } = render(
      <Slider ref={ref} min={-100} max={100} value={0} />,
    );
    const { input } = getElements(container);

    fireEvent.input(input, { target: { value: "40" } });

    expect(ref.current?.getValue()).toBe(40);
  });

  it("commits keyboard changes only when a value key is released", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Slider min={0} max={100} value={50} onChange={onChange} />,
    );
    const { input } = getElements(container);

    fireEvent.input(input, { target: { value: "51" } });
    fireEvent.keyUp(input, { key: "Shift" });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyUp(input, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(51);
  });

  it("synchronizes external value and range changes", () => {
    const ref = createRef<SliderHandle>();
    const { container, rerender } = render(
      <Slider ref={ref} min={0} max={100} value={25} />,
    );
    const { slider, input } = getElements(container);

    rerender(<Slider ref={ref} min={0} max={200} value={150} />);

    expect(input.value).toBe("150");
    expect(ref.current?.getValue()).toBe(150);
    expect(slider.style.getPropertyValue("--slider-progress")).toBe("75%");
  });

  it("does not commit when disabled", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Slider min={0} max={100} value={50} disabled onChange={onChange} />,
    );
    const { input } = getElements(container);

    fireEvent.pointerUp(input);
    fireEvent.keyUp(input, { key: "ArrowRight" });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("uses zero progress for an invalid range", () => {
    const { container } = render(<Slider min={10} max={10} value={10} />);
    const { slider } = getElements(container);

    expect(slider.style.getPropertyValue("--slider-progress")).toBe("0%");
  });
});
