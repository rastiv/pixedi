import { imagesData } from "@/app/entries";
import { Pixedi } from "@/shared/components/ImageEditor";
import styles from "./PackageDemo.module.css";

export const PackageDemo = () => {
  const image = imagesData.find((img) => img.id === "78");
  //   const image = imagesData.find((img) => img.id === "26");

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
    // TODO: Navigate back
  };

  return (
    <div className={styles.packageDemo}>
      <div className={styles.packageDemoContainer}>
        <Pixedi
          image={image?.original || ""}
          onBack={handleCancel}
          onSave={handleSave}
          settings={{
            quality: 0.85,
          }}
        />
      </div>
    </div>
  );
};
