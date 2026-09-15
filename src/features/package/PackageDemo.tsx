import { useRef, useState } from "react";
import { Pixedi } from "@/shared/components/Pixedi";
import { Modal } from "@/shared/components/Modal";
import { ImagePreview } from "./ImagePreview";
import { ImageList } from "./ImageList";
import { UploadImage } from "./UploadImage";
import styles from "./PackageDemo.module.css";

export const PackageDemo = () => {
  const [openModal, setOpenModal] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const uploadUrlRef = useRef<string | null>(null);

  const handleSave = async (image: Blob | string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setBlob(image as Blob);
        resolve();
      }, 500);
    });
  };

  const revokeUploadUrl = () => {
    if (uploadUrlRef.current) {
      URL.revokeObjectURL(uploadUrlRef.current);
      uploadUrlRef.current = null;
    }
  };

  const handleCancel = () => {
    setOpenModal(false);
    revokeUploadUrl();
  };

  const handleClose = () => {
    setBlob(null);
    setOpenModal(false);
    revokeUploadUrl();
  };

  const handleClickImage = (src: string) => {
    revokeUploadUrl();
    setSelectedImage(src);
    setBlob(null);
    setOpenModal(true);
  };

  const openFileForEdit = (file: File) => {
    revokeUploadUrl();
    const url = URL.createObjectURL(file);
    uploadUrlRef.current = url;
    setSelectedImage(url);
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
        <ImageList onImageClick={handleClickImage} />
        <h3>OR</h3>
        <UploadImage onFileSelect={openFileForEdit} />
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
