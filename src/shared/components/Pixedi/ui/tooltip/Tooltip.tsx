import { useState, useRef, Children, isValidElement } from "react";
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

  const containerRef = useRef<HTMLDivElement>(null);
  const isVertical = orientation === "vertical";

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
      setActiveIndex(null);
      setPosition(null);
      return;
    }

    const parent = target.parentElement;
    if (!parent) return;
    const index = Array.from(parent.children).indexOf(target);

    const rect = target.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (containerRect && index !== -1) {
      if (isVertical) {
        setPosition({
          x: rect.right - containerRect.left + 4,
          y: rect.top - containerRect.top + rect.height / 2,
        });
      } else {
        setPosition({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 8,
        });
      }
      setActiveIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
    setPosition(null);
  };

  const cssVars = {
    "--tooltip-x": position ? `${position.x}px` : "0px",
    "--tooltip-y": position ? `${position.y}px` : "0px",
    "--tooltip-opacity": activeIndex !== null ? "1" : "0",
    "--tooltip-visibility": activeIndex !== null ? "visible" : "hidden",
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
        data-orientation={isVertical ? "vertical" : "horizontal"}
        className={`${styles.popup} ${className}`}
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
