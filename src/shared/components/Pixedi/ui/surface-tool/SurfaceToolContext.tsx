import { createContext, useContext, useRef } from "react";

export type SurfaceToolOffset = { dx: number; dy: number };

export const SurfaceToolOffsetContext = createContext<
  React.RefObject<SurfaceToolOffset> | undefined
>(undefined);

export const useSurfaceToolOffset = (): React.RefObject<SurfaceToolOffset> => {
  const sharedRef = useContext(SurfaceToolOffsetContext);
  const localRef = useRef<SurfaceToolOffset>({ dx: 0, dy: 0 });

  return sharedRef ?? localRef;
};
