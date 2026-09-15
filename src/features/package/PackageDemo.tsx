import { useState } from "react";
import { Pixedi } from "@/shared/components/Pixedi";
import { Modal } from "@/shared/components/Modal";
import { ImagePreview } from "./ImagePreview";
import styles from "./PackageDemo.module.css";

const imagesData = [
  { id: "1", original: "/bird.jpg" },
  { id: "2", original: "/butterfly.jpg" },
  { id: "4", original: "/leafs.jpg" },
  { id: "5", original: "/parrot.jpg" },
  { id: "6", original: "/sunset.png" },
  { id: "3", original: "/flowers.png" },
];

export const PackageDemo = () => {
  const [openModal, setOpenModal] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const handleSave = async (image: Blob | string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setBlob(image as Blob);
        resolve();
      }, 500);
    });
  };

  const handleCancel = () => {
    setOpenModal(false);
  };

  const handleClose = () => {
    setBlob(null);
    setOpenModal(false);
  };

  const handleClickImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const src = (e.target as HTMLImageElement).src;
    setSelectedImage(src);
    setBlob(null);
    setOpenModal(true);
  };

  const handleDownload = () => {
    if (!blob) return;
    const mimeToExt: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/gif": "gif",
      "image/webp": "webp",
    };
    const mimeType = blob.type || "image/webp";
    const ext = mimeToExt[mimeType] || "webp";
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `picture-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className={`${styles.packageDemo} ${styles.container}`}>
        <h3>Click on a image to edit it</h3>
        <div className={styles.grid}>
          {imagesData.map((image) => (
            <div key={image.id} className={styles.gridItem}>
              <img
                src={image.original}
                alt={image.id}
                className={styles.gridItemImg}
                onClick={handleClickImage}
              />
            </div>
          ))}
        </div>
        <h3>OR</h3>
        {/* TODO: Add upload button */}
      </div>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        size="lg"
        className={styles.modal}
      >
        {blob && (
          <ImagePreview
            blob={blob}
            onClose={handleClose}
            onDownload={handleDownload}
          />
        )}
        {!blob && (
          <Pixedi
            image={selectedImage || ""}
            onBack={handleCancel}
            onSave={handleSave}
            settings={{
              quality: 0.85,
            }}
          />
        )}
      </Modal>
    </>
  );
};
