import React, { useImperativeHandle, useLayoutEffect, useRef } from "react";
import styles from "./Slider.module.css";

type CustomSliderProps = {
  min: number;
  max: number;
  value?: number;
  step?: number;
  onChange?: (value: number) => void;
};

export type SliderHandle = {
  getValue: () => number;
};

type SliderProps = CustomSliderProps &
  Omit<
    React.ComponentPropsWithoutRef<"input">,
    keyof CustomSliderProps | "type"
  > & {
    ref?: React.Ref<SliderHandle>;
  };

const getPercentage = (value: number, min: number, max: number) => {
  const total = max - min;
  return total <= 0 ? 0 : ((value - min) / total) * 100;
};

const commitKeys = new Set([
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
]);

export const Slider = ({
  min,
  max,
  value,
  step = 1,
  disabled = false,
  onChange,
  onInput,
  onPointerUp,
  onKeyUp,
  className,
  ref,
  ...rest
}: SliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialValue = value ?? min;

  const updateProgress = (currentValue: number) => {
    const percentage = getPercentage(currentValue, min, max);
    containerRef.current?.style.setProperty(
      "--slider-progress",
      `${percentage}%`,
    );
  };

  const commitValue = () => {
    if (!disabled && inputRef.current) {
      onChange?.(Number(inputRef.current.value));
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      getValue: () => Number(inputRef.current?.value ?? initialValue),
    }),
    [initialValue],
  );

  useLayoutEffect(() => {
    if (!inputRef.current) return;
    if (value !== undefined) inputRef.current.value = String(value);
    const percentage = getPercentage(Number(inputRef.current.value), min, max);
    containerRef.current?.style.setProperty(
      "--slider-progress",
      `${percentage}%`,
    );
  }, [value, min, max]);

  return (
    <div
      ref={containerRef}
      className={`${styles.sliderContainer} ${disabled ? styles.disabled : ""} ${className || ""}`}
      style={
        {
          "--slider-progress": `${getPercentage(initialValue, min, max)}%`,
        } as React.CSSProperties
      }
    >
      <div className={styles.sliderTrack}>
        <div className={styles.sliderRange} />
        <div className={styles.sliderThumb} />
      </div>
      <input
        ref={inputRef}
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={initialValue}
        disabled={disabled}
        onInput={(event) => {
          updateProgress(Number(event.currentTarget.value));
          onInput?.(event);
        }}
        onPointerUp={(event) => {
          commitValue();
          onPointerUp?.(event);
        }}
        onKeyUp={(event) => {
          if (commitKeys.has(event.key)) commitValue();
          onKeyUp?.(event);
        }}
        className={styles.hiddenInput}
        {...rest}
      />
    </div>
  );
};
