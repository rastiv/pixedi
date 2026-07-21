import { useState, useEffect } from "react";

export function useImagePreload(
  imageUrls: string[],
  delay: number = 1000,
): boolean {
  const [loadedUrls, setLoadedUrls] = useState<string[]>([]);

  const isAlreadyLoaded =
    imageUrls.length === loadedUrls.length &&
    imageUrls.every((url, i) => url === loadedUrls[i]);

  useEffect(() => {
    if (imageUrls.length === 0 || isAlreadyLoaded) {
      return;
    }

    let isMounted = true;

    const minimumDelayPromise = new Promise((resolve) =>
      setTimeout(resolve, delay),
    );

    const imagePromises = imageUrls.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    });

    Promise.all([...imagePromises, minimumDelayPromise]).then(() => {
      if (isMounted) {
        setLoadedUrls(imageUrls);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [imageUrls, isAlreadyLoaded]);

  if (imageUrls.length === 0) {
    return true;
  }

  return isAlreadyLoaded;
}
