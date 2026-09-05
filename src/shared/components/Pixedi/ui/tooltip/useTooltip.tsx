import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  Children,
  isValidElement,
  useMemo,
} from "react";
import type { ReactNode, CSSProperties } from "react";

type Orientation = "horizontal" | "vertical";

type Size = { w: number; h: number };

type Position = { x: number; y: number };

export const useTooltip = (
  children: ReactNode,
  orientation: Orientation = "horizontal",
) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [sizes, setSizes] = useState<Size[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isVertical = orientation === "vertical";

  const titles = useMemo(() => {
    const result: string[] = [];
    Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        const { "data-tooltip": tooltip } = child.props as {
          "data-tooltip"?: string;
        };
        if (tooltip) {
          result.push(tooltip);
        }
      }
    });
    return result;
  }, [children]);

  const titlesKey = titles.join("\u0000");
  const titleCount = titles.length;

  useLayoutEffect(() => {
    const measure = () => {
      const next = titleRefs.current
        .slice(0, titleCount)
        .map((el) => ({ w: el?.offsetWidth ?? 0, h: el?.offsetHeight ?? 0 }));
      setSizes((prev) =>
        prev.length === next.length &&
        prev.every((s, i) => s.w === next[i].w && s.h === next[i].h)
          ? prev
          : next,
      );
    };

    measure();

    const track = trackRef.current;
    if (!track || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [titlesKey, titleCount]);

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

    const nextPosition = isVertical
      ? {
          x: rect.right - containerRect.left + 4,
          y: rect.top - containerRect.top + rect.height / 2,
        }
      : {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 8,
        };

    if (!isVisible) setIsAnimated(false);

    setPosition(nextPosition);
    setActiveIndex(index);
    setIsVisible(true);
  };

  const handleMouseLeave = () => setIsVisible(false);

  const index = activeIndex ?? 0;
  const activeSize = sizes[index];
  const offset = sizes
    .slice(0, index)
    .reduce((acc, s) => acc + (isVertical ? s.h : s.w), 0);

  const cssVars = {
    "--tooltip-x": position ? `${position.x}px` : "0px",
    "--tooltip-y": position ? `${position.y}px` : "0px",
    "--tooltip-opacity": isVisible ? "1" : "0",
    "--tooltip-w": activeSize?.w ? `${activeSize.w}px` : "auto",
    "--tooltip-h": activeSize?.h ? `${activeSize.h}px` : "auto",
    "--tooltip-offset": `${offset}px`,
  } as CSSProperties;

  return {
    containerRef,
    trackRef,
    titleRefs,
    titles,
    isVertical,
    isVisible,
    isAnimated,
    cssVars,
    handleMouseMove,
    handleMouseLeave,
  };
};
