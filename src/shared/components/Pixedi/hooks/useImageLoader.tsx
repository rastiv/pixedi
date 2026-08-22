import { useState, useEffect, useRef } from "react";

export interface UseImageResult {
  loading: boolean;
  error: string;
  extension: string;
  width: number;
  height: number;
  originalBlob: Blob | null;
  originalSize: number;
  previewUrl: string;
  isAlpha: boolean;
}

export const useImageLoader = (src: string): UseImageResult => {
  const [state, setState] = useState<UseImageResult>({
    loading: true,
    error: "",
    width: 0,
    height: 0,
    extension: "",
    originalBlob: null,
    originalSize: 0,
    previewUrl: "",
    isAlpha: false,
  });

  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!src) {
      return;
    }

    const worker = new Worker(
      new URL("../workers/imageLoad.ts", import.meta.url),
      { type: "module" },
    );

    worker.postMessage(src);

    worker.onmessage = (
      e: MessageEvent<{
        success: boolean;
        error?: string;
        originalBlob: Blob;
        originalWidth: number;
        originalHeight: number;
        originalSize: number;
        originalMime: string;
        previewBlob: Blob;
        isAlpha: boolean;
      }>,
    ) => {
      const result = e.data;

      if (result.success) {
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
        }
        previewUrlRef.current = URL.createObjectURL(result.previewBlob);
        setState({
          loading: false,
          error: "",
          extension: result.originalMime,
          width: result.originalWidth,
          height: result.originalHeight,
          originalBlob: result.originalBlob,
          originalSize: result.originalSize,
          previewUrl: previewUrlRef.current,
          isAlpha: result.isAlpha,
        });
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.error || "Error processing image.",
        }));
      }
    };

    // clean up the web worker and object URL
    return () => {
      worker.terminate();
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [src]);

  return state;
};
