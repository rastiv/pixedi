import { useEffect, useState } from "react";

const mimeToExt: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

type UseImageResult = {
  loading: boolean;
  error: string | null;
  width: number;
  height: number;
  extension: string | null;
  base64: string | null;
};

export const useImageLoader = (src: string): UseImageResult => {
  const [state, setState] = useState<UseImageResult>({
    loading: true,
    error: null,
    width: 0,
    height: 0,
    extension: null,
    base64: null,
  });

  useEffect(() => {
    let isMounted = true;

    const processImage = async () => {
      try {
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const mimeType = response.headers.get("content-type") || "";
        const cleanMime = mimeType.split(";")[0].toLowerCase().trim();
        const isImg = cleanMime.startsWith("image/");

        const extension = mimeToExt[cleanMime] || "unknown";

        if (!isImg) {
          if (isMounted) {
            setState((prev) => ({
              ...prev,
              loading: false,
              error: "The requested resource is not a valid image.",
              extension,
            }));
          }
          return;
        }

        const blob = await response.blob();
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () =>
            reject(new Error("Failed to read image data stream"));
          reader.readAsDataURL(blob);
        });

        const dimensions = await new Promise<{ width: number; height: number }>(
          (resolve, reject) => {
            const img = new Image();
            img.src = base64String;
            img.onload = () =>
              resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () =>
              reject(new Error("Failed to parse image dimensions"));
          },
        );

        if (isMounted) {
          setState({
            loading: false,
            error: null,
            width: dimensions.width,
            height: dimensions.height,
            extension,
            base64: base64String,
          });
        }
      } catch (err: unknown) {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error:
              err instanceof Error
                ? err.message
                : "An error occurred during extraction.",
          }));
        }
      }
    };

    processImage();

    return () => {
      isMounted = false;
    };
  }, [src]);

  return state;
};
