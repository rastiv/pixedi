import { useState } from "react";
import { Pixedi } from "@/shared/components/Pixedi";
import { Modal } from "@/shared/components/Modal";
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
  const [selectedImage, setSelectedImage] = useState<string>("");

  const handleSave = async (image: Blob | string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // TODO: Save the image
        console.log(image);
        resolve();
      }, 2000);
    });
  };

  const handleCancel = () => {
    setOpenModal(false);
  };

  const handleClickImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const src = (e.target as HTMLImageElement).src;
    setSelectedImage(src);
    setOpenModal(true);
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
        {/* <div className={styles.packageDemoContainer}>
          <Pixedi
            image={image?.original || ""}
            onBack={handleCancel}
            onSave={handleSave}
            settings={{
              quality: 0.85,
            }}
          />
        </div> */}
      </div>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        size="lg"
        className={styles.modal}
      >
        <Pixedi
          image={selectedImage || ""}
          onBack={handleCancel}
          onSave={handleSave}
          settings={{
            quality: 0.85,
          }}
        />
      </Modal>
    </>
  );
};
