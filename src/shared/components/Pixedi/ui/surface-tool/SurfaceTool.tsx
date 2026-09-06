import type { ReactNode } from "react";
import styles from "./SurfaceTool.module.css";

type SurfaceToolProps = {
  children: ReactNode;
  className?: string;
  ref?: React.RefObject<HTMLDivElement | null>;
};

export const SurfaceTool = ({
  children,
  className = "",
  ref,
}: SurfaceToolProps) => {
  return (
    <div ref={ref} className={`${styles.surfaceTool} ${className}`}>
      {children}
    </div>
  );
};
