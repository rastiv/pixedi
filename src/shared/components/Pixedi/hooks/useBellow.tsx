import { useEffect, useState } from "react";
import { breakpoints, type Breakpoint } from "../types";

export function useBellow(breakpoint: Breakpoint): boolean {
  const [isBellow, setIsBellow] = useState(
    () => window.innerWidth < breakpoints[breakpoint],
  );

  useEffect(() => {
    function handleResize() {
      setIsBellow(window.innerWidth < breakpoints[breakpoint]);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isBellow;
}
