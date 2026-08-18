import { useState, useEffect } from "react";
import { usePixediContext } from "../provider/usePixediContext";

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
  isAlpha: boolean;
}

export const useImageSave = (): UseImageResult => {
  const { history, extension, originalBase64 } = usePixediContext();
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
    isAlpha: false,
  });

  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/imageSave.ts", import.meta.url),
      { type: "module" },
    );

    worker.postMessage(history, extension, originalBase64);

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
        isAlpha: boolean;
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

    // clean up the web worker
    return () => {
      worker.terminate();
    };
  }, [history]);

  return state;
};
