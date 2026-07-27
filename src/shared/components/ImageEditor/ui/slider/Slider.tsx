import React, { useMemo } from "react";
import styles from "./slider.module.css";

interface CustomSliderProps {
  min: number;
  max: number;
  value: number;
  step?: number;
  onChange: (value: number) => void;
}

interface SliderProps
  extends
    CustomSliderProps,
    Omit<
      React.ComponentPropsWithRef<"input">,
      keyof CustomSliderProps | "type"
    > {}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  value,
  step = 1,
  disabled = false,
  onChange,
  className,
  ...rest
}) => {
  const percentage = useMemo(() => {
    const total = max - min;
    return total <= 0 ? 0 : ((value - min) / total) * 100;
  }, [value, min, max]);

  const handleSlide = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newValue = Number(e.target.value);
    onChange(newValue);
  };

  return (
    <div
      className={`${styles.sliderContainer} ${disabled ? styles.disabled : ""} ${className || ""}`}
      style={{ "--slider-progress": `${percentage}%` } as React.CSSProperties}
    >
      <div className={styles.sliderTrack}>
        <div className={styles.sliderRange} />
        <div
          className={styles.sliderThumb}
          style={{ left: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={handleSlide}
        className={styles.hiddenInput}
        {...rest}
      />
    </div>
  );
};
