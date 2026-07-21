import { forwardRef } from "react";
import "./input-pixel.css";
import { Input } from "../../ui";

interface InputPixelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
}

export const InputPixel = forwardRef<HTMLInputElement, InputPixelProps>(
  ({ label, className = "", style, ...props }, ref) => {
    return (
      <div
        className={`input-pixel-container ${className}`.trim()}
        style={style}
      >
        <span className="input-pixel-legend">{label}</span>
        <Input ref={ref} type="number" {...props} />
        <span className="input-pixel-suffix">px</span>
      </div>
    );
  },
);
