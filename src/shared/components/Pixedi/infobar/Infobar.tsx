import { usePixediContext } from "../provider/usePixediContext";
import styles from "./Infobar.module.css";

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

export const Infobar = () => {
  const { originalBlob, getLastHistoryItem } = usePixediContext();
  const { width, height } = getLastHistoryItem();

  return (
    <div className={styles.infobar}>
      <div className={styles.filesize}>
        {originalBlob ? formatFileSize(originalBlob.size) : "0 B"}
      </div>
      <div className={styles.sizes}>
        {width} / {height}
      </div>
    </div>
  );
};
