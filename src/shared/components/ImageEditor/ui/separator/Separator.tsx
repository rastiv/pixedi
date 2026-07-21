import { forwardRef } from "react";
import "./separator.css";

interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export const Separator = forwardRef<HTMLHRElement, SeparatorProps>(
  ({ className = "", orientation = "horizontal", ...props }, ref) => {
    // Сглобяваме чистите класове
    const combinedClasses = `separator ${className}`.trim();

    return (
      <hr
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        data-orientation={orientation}
        className={combinedClasses}
        {...props}
      />
    );
  },
);

Separator.displayName = "Separator";
