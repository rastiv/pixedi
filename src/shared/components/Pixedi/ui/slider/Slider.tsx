import React, { useLayoutEffect, useRef, useState } from "react";
import styles from "./Slider.module.css";

type SliderProps = {
  min: number;
  max: number;
  value?: number;
  step?: number;
  disabled?: boolean;
  isTooltip?: boolean;
  unit?: string;
  className?: string;
  onChange?: (value: number) => void;
  onInput?: (value: number) => void;
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
  isTooltip = false,
  unit = "",
  className,
  onChange,
  onInput,
}: SliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialValue = value ?? min;
  const [currentValue, setCurrentValue] = useState(initialValue);

  const updateProgress = (nextValue: number) => {
    setCurrentValue(nextValue);
    const percentage = getPercentage(nextValue, min, max);
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

  useLayoutEffect(() => {
    if (!inputRef.current) return;
    if (value !== undefined) inputRef.current.value = String(value);
    const nextValue = Number(inputRef.current.value);
    setCurrentValue(nextValue);
    const percentage = getPercentage(nextValue, min, max);
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
        {isTooltip && (
          <div className={styles.sliderTooltip}>{`${currentValue}${unit}`}</div>
        )}
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
          const value = Number(event.currentTarget.value);
          updateProgress(value);
          onInput?.(value);
        }}
        onPointerUp={() => {
          commitValue();
        }}
        onKeyUp={(event) => {
          if (commitKeys.has(event.key)) commitValue();
        }}
        className={styles.hiddenInput}
      />
    </div>
  );
};
