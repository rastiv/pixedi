import { forwardRef } from "react";
import styles from "./separator.module.css";

interface SeparatorProps extends React.ComponentPropsWithoutRef<"hr"> {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export const Separator = forwardRef<HTMLHRElement, SeparatorProps>(
  ({ className = "", orientation = "horizontal", ...props }, ref) => {
    const combinedClasses = `${styles.separator} ${className}`.trim();

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
