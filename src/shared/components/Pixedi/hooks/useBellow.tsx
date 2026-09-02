import { useEffect, useState } from "react";
import { breakpoints, type Breakpoint } from "../types";

export function useBellow(
  breakpoint: Breakpoint,
  element: HTMLElement | null,
): boolean {
  const [isBellow, setIsBellow] = useState(true);

  useEffect(() => {
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setIsBellow(entry.contentRect.width < breakpoints[breakpoint]);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [breakpoint, element]);

  return isBellow;
}
