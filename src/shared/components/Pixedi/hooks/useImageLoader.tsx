import { useState, useEffect, useRef } from "react";
import ImageLoadWorker from "../workers/imageLoad.ts?worker&inline";

type UseImageLoaderProps = {
  src: string | Blob;
  skip?: boolean;
};

type UseImageLoader = {
  loading: boolean;
  error: string;
  mimeType: string;
  width: number;
  height: number;
  originalBlob: Blob | null;
  previewUrl: string;
  isAlpha: boolean;
};

export const useImageLoader = ({
  src,
  skip = false,
}: UseImageLoaderProps): UseImageLoader => {
  const [state, setState] = useState<UseImageLoader>({
    loading: skip ? false : true,
    error: "",
    width: 0,
    height: 0,
    mimeType: "",
    originalBlob: null,
    previewUrl: "",
    isAlpha: false,
  });

  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!src || skip) {
      return;
    }

    const worker = new ImageLoadWorker();

    worker.postMessage(src);

    worker.onmessage = (
      e: MessageEvent<{
        success: boolean;
        error?: string;
        originalBlob: Blob;
        previewBlob: Blob;
        mimeType: string;
        width: number;
        height: number;
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
          mimeType: result.mimeType,
          width: result.width,
          height: result.height,
          originalBlob: result.originalBlob,
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
  }, [skip, src]);

  return state;
};
