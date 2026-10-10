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
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.ring} />

      <svg xmlns="http://www.w3.org/2000/svg" className={styles.arc}>
        <circle
          cx="50%"
          cy="50%"
          r="50%"
          pathLength={360}
          className={styles.activeArc}
          style={{
            strokeDashoffset: 360 - Math.min(Math.max(value, 0), 360),
            opacity: value > 0 ? 0.4 : 0,
          }}
        />
      </svg>

      {angles?.map((angle) => (
        <div
          key={angle}
          onClick={() => {
            onChange?.(angle);
          }}
          className={styles.point}
          style={{ transform: `rotate(${angle}deg)` }}
        />
      ))}
      <div
        className={styles.thumb}
        style={{ transform: `rotate(${value}deg)` }}
      />
      {children}
    </div>
  );
};
