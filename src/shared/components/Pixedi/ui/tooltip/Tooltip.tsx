import { useState, useRef, useEffect, Children, isValidElement } from "react";
import type { ReactNode } from "react";
import styles from "./Tooltip.module.css";

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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isVertical = orientation === "vertical";

  // The first placement must be instant, so sliding transitions are enabled
  // only once the popup has been committed at its initial position.
  useEffect(() => {
    if (!isVisible || isAnimated) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setIsAnimated(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [isVisible, isAnimated]);

  const titles: string[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      const { "data-tooltip": tooltip } = child.props as {
        "data-tooltip"?: string;
      };
      if (tooltip) {
        titles.push(tooltip);
      }
    }
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest(
      "[data-tooltip]",
    ) as HTMLElement | null;

    if (!target) {
      setIsVisible(false);
      return;
    }

    const parent = target.parentElement;
    if (!parent) return;
    const index = Array.from(parent.children).indexOf(target);
    if (index === -1 || (isVisible && index === activeIndex)) return;

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    const rect = target.getBoundingClientRect();

    // Appearing from hidden must not animate the jump to the hovered item.
    if (!isVisible) setIsAnimated(false);

    setPosition(
      isVertical
        ? {
            x: rect.right - containerRect.left + 4,
            y: rect.top - containerRect.top + rect.height / 2,
          }
        : {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top - 8,
          },
    );
    setActiveIndex(index);
    setIsVisible(true);
  };

  // Keep the last position/index so the popup fades out in place.
  const handleMouseLeave = () => setIsVisible(false);

  const cssVars = {
    "--tooltip-x": position ? `${position.x}px` : "0px",
    "--tooltip-y": position ? `${position.y}px` : "0px",
    "--tooltip-opacity": isVisible ? "1" : "0",
    "--tooltip-index": String(activeIndex ?? 0),
  } as React.CSSProperties;

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
        <div
          data-orientation={isVertical ? "vertical" : "horizontal"}
          className={styles.track}
        >
          {titles.map((title, i) => (
            <div key={i} className={`${styles.title} ${classNameTitle}`}>
              {title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
