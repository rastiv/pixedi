import { useRef, type ReactNode } from "react";
import { Drag } from "../../assets/icons";
import { useSurfaceTool } from "./useSurfaceTool";
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
  // dragging always needs the element, so it is tracked here and mirrored into
  // the optional caller ref
  const surfaceRef = useRef<HTMLDivElement>(null);
  const { handleDragStart } = useSurfaceTool({ surfaceRef });

  const setRef = (node: HTMLDivElement | null) => {
    surfaceRef.current = node;
    if (ref) ref.current = node;
  };

  return (
    <div ref={setRef} className={styles.surfaceTool}>
      <Drag
        className={styles.drag}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      />
      <div className={`${styles.content} ${className}`}>{children}</div>
    </div>
  );
};
