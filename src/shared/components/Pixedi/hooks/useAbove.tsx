import { useEffect, useState } from "react";
import { breakpoints, type Breakpoint } from "../types";

export function useAbove(breakpoint: Breakpoint): boolean {
  const [isAbove, setIsAbove] = useState(
    () => window.innerWidth >= breakpoints[breakpoint],
  );

  useEffect(() => {
    function handleResize() {
      setIsAbove(window.innerWidth >= breakpoints[breakpoint]);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isAbove;
}
