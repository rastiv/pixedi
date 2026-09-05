import type { ReactNode } from "react";
import styles from "./Tooltip.module.css";
import { useTooltip } from "./useTooltip";

interface TooltipProps {
  children: ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
  classNameTitle?: string;
}

export const Tooltip = ({
  children,
  orientation = "horizontal",
  className = "",
  classNameTitle = "",
}: TooltipProps) => {
  const {
    containerRef,
    trackRef,
    titleRefs,
    titles,
    isVertical,
    isAnimated,
    cssVars,
    handleMouseMove,
    handleMouseLeave,
  } = useTooltip(children, orientation);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onBlur={handleMouseLeave}
      className={styles.tooltip}
      style={cssVars}
    >
      <div
        data-orientation={isVertical ? "vertical" : "horizontal"}
        className={styles.container}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        data-orientation={isVertical ? "vertical" : "horizontal"}
        className={`${styles.popup} ${isAnimated ? styles.animated : ""} ${className}`}
      >
        <div className={styles.mask}>
          <div
            ref={trackRef}
            data-orientation={isVertical ? "vertical" : "horizontal"}
            className={styles.track}
          >
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
