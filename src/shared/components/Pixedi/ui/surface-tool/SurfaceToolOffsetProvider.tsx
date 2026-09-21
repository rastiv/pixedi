import { useRef } from "react";
import { SurfaceToolOffsetContext } from "./SurfaceToolContext";
import type { SurfaceToolOffset } from "./SurfaceToolContext";

type SurfaceToolOffsetProviderProps = {
  children: React.ReactNode;
};

// every tool renders its own SurfaceTool, so the dragged offset lives above them
// to survive unmounting; one ref per provider keeps editor instances independent
export const SurfaceToolOffsetProvider = ({
  children,
}: SurfaceToolOffsetProviderProps) => {
  const offsetRef = useRef<SurfaceToolOffset>({ dx: 0, dy: 0 });

  return (
    <SurfaceToolOffsetContext value={offsetRef}>
      {children}
    </SurfaceToolOffsetContext>
  );
};
