import styles from "./OrbitalSelector.module.css";

type OrbitalSelectorProps = {
  value: number;
  angles?: number[];
  children?: React.ReactNode;
  className?: string;
  onChange?: (value: number) => void;
  onInput?: (value: number) => void;
};

const generateArcPath = (angleInDegrees: number): string => {
  const cx = 12;
  const cy = 12;
  const radius = 11;

  const radians = ((angleInDegrees - 90) * Math.PI) / 180;

  const endX = cx + radius * Math.cos(radians);
  const endY = cy + radius * Math.sin(radians);

  const largeArcFlag = angleInDegrees > 180 ? 1 : 0;

  const startX = 12;
  const startY = 1;

  return `M ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag},1 ${endX.toFixed(4)},${endY.toFixed(4)}`;
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

      <svg xmlns="http://w3.org" viewBox="0 0 24 24" className={styles.arc}>
        {value > 0 && (
          <path d={generateArcPath(value)} className={styles.activeArc} />
        )}
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
