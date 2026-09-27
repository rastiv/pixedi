import { useEffect, useState } from "react";
import { breakpoints, type Breakpoint } from "../types";

export function useBelow(
  breakpoint: Breakpoint,
  element: HTMLElement | null,
): boolean {
  const [isBelow, setIsBelow] = useState(true);

  useEffect(() => {
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setIsBelow(entry.contentRect.width < breakpoints[breakpoint]);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [breakpoint, element]);

  return isBelow;
}
