import styles from "./Crop.module.css";

export const CropLines = () => {
  return (
    <div className={styles.linesBox}>
      <span className={`${styles.line} ${styles.lineV}`} />
      <span className={`${styles.line} ${styles.lineH}`} />
    </div>
  );
};
