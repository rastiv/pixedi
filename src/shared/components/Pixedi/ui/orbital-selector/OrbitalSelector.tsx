import { type PointerEvent, useLayoutEffect, useRef, useState } from "react";
import styles from "./OrbitalSelector.module.css";

type OrbitalSelectorProps = {
  value: number;
  angles?: number[];
  children?: React.ReactNode;
  className?: string;
  onChange?: (value: number) => void;
  onInput?: (value: number) => void;
};

export const OrbitalSelector = ({
  value,
  angles,
  children,
  className,
  onChange,
  onInput,
}: OrbitalSelectorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  const [currentValue, setCurrentValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  if (value !== prevValue) {
    setPrevValue(value);
    setCurrentValue(value);
  }

  useLayoutEffect(() => {
    valueRef.current = currentValue;
  }, [currentValue]);

  const updateValue = (nextValue: number) => {
    valueRef.current = nextValue;
    setCurrentValue(nextValue);
  };

  const getAngleFromPointer = (clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const deg = (Math.atan2(clientX - cx, cy - clientY) * 180) / Math.PI;
    return Math.round((deg + 360) % 360) % 360;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const angle = getAngleFromPointer(event.clientX, event.clientY);
    if (angle === valueRef.current) return;
    updateValue(angle);
    onInput?.(angle);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onChange?.(valueRef.current);
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${isDragging ? styles.dragging : ""} ${className ?? ""}`}
    >
      <div className={styles.ring} />

      <svg xmlns="http://www.w3.org/2000/svg" className={styles.arc}>
        <circle
          cx="50%"
          cy="50%"
          r="50%"
          pathLength={360}
          className={styles.activeArc}
          style={{
            strokeDashoffset: 360 - Math.min(Math.max(currentValue, 0), 360),
            opacity: currentValue > 0 ? 0.4 : 0,
          }}
        />
      </svg>

      {angles?.map((angle) => (
        <div
          key={angle}
          onClick={() => {
            updateValue(angle);
            onChange?.(angle);
          }}
          className={styles.point}
          style={{ transform: `rotate(${angle}deg)` }}
        />
      ))}
      <div
        className={styles.thumb}
        style={{ transform: `rotate(${currentValue}deg)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      {children}
    </div>
  );
};
