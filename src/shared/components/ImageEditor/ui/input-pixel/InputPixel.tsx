import { forwardRef } from "react";
import styles from "./input-pixel.module.css";
import { Input } from "../../ui";

interface InputPixelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
}

export const InputPixel = forwardRef<HTMLInputElement, InputPixelProps>(
  ({ label, className = "", style, ...props }, ref) => {
    return (
      <div className={`${styles.container} ${className}`.trim()} style={style}>
        <span className={styles.legend}>{label}</span>
        <Input ref={ref} type="number" {...props} />
        <span className={styles.suffix}>px</span>
      </div>
    );
  },
);
