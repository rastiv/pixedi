import { useState, useEffect } from "react";

export interface UseImageResult {
  loading: boolean;
  error: string;
  extension: string;
  width: number;
  height: number;
  originalBase64: string;
  originalSize: number;
  reducedBase64: string;
  reducedSize: number;
}

export const useImageLoader = (src: string): UseImageResult => {
  const [state, setState] = useState<UseImageResult>({
    loading: true,
    error: "",
    width: 0,
    height: 0,
    extension: "",
    originalBase64: "",
    originalSize: 0,
    reducedBase64: "",
    reducedSize: 0,
  });

  useEffect(() => {
    if (!src) {
      return;
    }

    const worker = new Worker(
      new URL("../workers/imageLoad.ts", import.meta.url),
      {
        type: "module",
      },
    );

    worker.postMessage(src);

    worker.onmessage = (
      e: MessageEvent<{
        success: boolean;
        error?: string;
        originalBase64: string;
        originalWidth: number;
        originalHeight: number;
        originalSize: number;
        originalMime: string;
        reducedBase64: string;
        reducedSize: number;
      }>,
    ) => {
      const result = e.data;

      if (result.success) {
        setState({
          loading: false,
          error: "",
          extension: result.originalMime,
          width: result.originalWidth,
          height: result.originalHeight,
          originalBase64: result.originalBase64,
          originalSize: result.originalSize,
          reducedBase64: result.reducedBase64,
          reducedSize: result.reducedSize,
        });
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.error || "Error processing image.",
        }));
      }
    };

    // clean up the web worker
    return () => {
      worker.terminate();
    };
  }, [src]);

  return state;
};
