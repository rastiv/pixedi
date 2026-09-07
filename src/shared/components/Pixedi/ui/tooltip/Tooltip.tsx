import type { ReactNode } from "react";
import styles from "./Tooltip.module.css";
import { useTooltip } from "./useTooltip";
import type { TooltipPosition } from "./useTooltip";

interface TooltipProps {
  children: ReactNode;
  position?: TooltipPosition;
  className?: string;
  classNameTitle?: string;
  style?: React.CSSProperties;
}

export const Tooltip = ({
  children,
  position = "top",
  className = "",
  classNameTitle = "",
  style,
}: TooltipProps) => {
  const {
    containerRef,
    trackRef,
    titleRefs,
    titles,
    isAnimated,
    cssVars,
    handleMouseMove,
    handleMouseLeave,
  } = useTooltip(children, position);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onBlur={handleMouseLeave}
      className={styles.tooltip}
      style={{ ...cssVars, ...style }}
    >
      <div
        data-position={position}
        className={`${styles.container} ${className}`}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        data-position={position}
        className={`${styles.popup} ${isAnimated ? styles.animated : ""}`}
      >
        <div className={styles.mask}>
          <div ref={trackRef} data-position={position} className={styles.track}>
            {titles.map((title, i) => (
              <div
                key={i}
                ref={(el) => {
                  titleRefs.current[i] = el;
                }}
                className={`${styles.title} ${classNameTitle}`}
              >
                {title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
