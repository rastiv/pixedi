import React, { useMemo } from "react";
import styles from "./Slider.module.css";

interface CustomSliderProps {
  min: number;
  max: number;
  value?: number;
  step?: number;
  onChange?: (value: number) => void;
  onDrag?: (value: number) => void;
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
  onDrag,
  className,
  ...rest
}) => {
  const percentage = useMemo(() => {
    const total = max - min;
    return total <= 0 ? 0 : ((value - min) / total) * 100;
  }, [value, min, max]);

  const handleChange = (
    e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>,
  ) => {
    if (disabled) return;
    const newValue = Number(e.currentTarget.value);
    onChange?.(newValue);
  };

  const handleDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newValue = Number(e.target.value);
    onDrag?.(newValue);
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
        onChange={handleDrag}
        onMouseUp={handleChange}
        onTouchEnd={handleChange}
        className={styles.hiddenInput}
        {...rest}
      />
    </div>
  );
};
