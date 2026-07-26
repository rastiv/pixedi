import { forwardRef } from "react";
import styles from "./input.module.css";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hideArrows?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type = "text", hideArrows = true, ...props }, ref) => {
    const numberClass =
      type === "number" && hideArrows ? styles.numberClean : "";
    const combinedClasses =
      `${styles.input} ${numberClass} ${className}`.trim();

    return (
      <input ref={ref} type={type} className={combinedClasses} {...props} />
    );
  },
);

Input.displayName = "Input";
