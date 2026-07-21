import { useParams, useNavigate } from "react-router";
import { imagesData } from "@/app/entries";
import { ImageEditor } from "@/shared/components/ImageEditor";

export const ImageEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const image = imagesData.find((img) => img.id === id);

  if (!image) {
    return <div>Image not found</div>;
  }

  const handleSave = async (base64: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // TODO: Save the image
        console.log(base64);
        resolve();
      }, 2000);
    });
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="w-full h-screen">
      <ImageEditor
        image={image.original}
        onBack={handleCancel}
        onSave={handleSave}
      />
    </div>
  );
};
