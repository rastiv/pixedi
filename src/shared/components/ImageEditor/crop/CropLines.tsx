import styles from "./crop.module.css";

export const CropLines = () => {
  return (
    <div className={styles.cropLinesBox}>
      <span className={`${styles.cropLine} ${styles.cropLineVertical}`} />
      <span className={`${styles.cropLine} ${styles.cropLineHorizontal}`} />
    </div>
  );
};
