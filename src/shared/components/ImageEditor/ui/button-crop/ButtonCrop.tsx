import { forwardRef } from "react";
import styles from "./button-crop.module.css";
import rootStyles from "../../index.module.css";

interface ButtonCropProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
}

export const ButtonCrop = forwardRef<HTMLButtonElement, ButtonCropProps>(
  ({ className = "", active = false, icon, label, ...props }, ref) => {
    const combinedClasses = `${styles.button} ${className}`.trim();

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        className={combinedClasses}
        {...props}
      >
        {icon}
        <span className={rootStyles.semibold}>{label}</span>
      </button>
    );
  },
);

ButtonCrop.displayName = "ButtonCrop";
