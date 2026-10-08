import type { ReactNode } from "react";
import styles from "./Tooltip.module.css";
import { TOOLTIP_DELAY, useTooltip } from "./useTooltip";
import type { TooltipPosition } from "./useTooltip";

type TooltipProps = {
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
  classNameTitle?: string;
  style?: React.CSSProperties;
};

export const Tooltip = ({
  children,
  position = "top",
  delay = TOOLTIP_DELAY,
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
  } = useTooltip(children, position, delay);

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
                <span>{title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
