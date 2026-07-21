import { imagesData } from "@/app/entries";
import { ImageCard } from "@/shared/components/ImageCard";
import { Preloader } from "@/shared/components/ui";
import { useImagePreload } from "@/shared/hooks";

export const GalleryPage = () => {
  const isLoaded = useImagePreload(imagesData.map((image) => image.original));

  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Preloader size={64} />
      </div>
    );
  }

  return (
    <div
      className={`
        max-w-4xl mx-6 
        my-6 
        grid content-start gap-6 
        grid-cols-1 
        sm:grid-cols-2
        md:grid-cols-3 md:mx-auto
      `}
    >
      {imagesData.map((image) => (
        <ImageCard key={image.id} image={image} />
      ))}
    </div>
  );
};
