import { forwardRef } from "react";
import "./button-crop.css";

interface ButtonCropProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
}

export const ButtonCrop = forwardRef<HTMLButtonElement, ButtonCropProps>(
  ({ className = "", active = false, icon, label, ...props }, ref) => {
    const combinedClasses = `btn-crop ${className}`.trim();

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        className={combinedClasses}
        {...props}
      >
        {icon}
        <span className="semibold">{label}</span>
      </button>
    );
  },
);

ButtonCrop.displayName = "ButtonCrop";
