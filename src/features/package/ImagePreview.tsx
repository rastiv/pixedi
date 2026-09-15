import styles from "./ImagePreview.module.css";

type ImagePreviewProps = {
  blob: Blob;
  onClose: () => void;
  onDownload: () => void;
};

export const ImagePreview = ({
  blob,
  onClose,
  onDownload,
}: ImagePreviewProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.frame}>
        <div>
          <img src={URL.createObjectURL(blob)} alt="preview" />
        </div>
      </div>
      <div className={styles.footer}>
        <button
          type="button"
          className={`${styles.btn} ${styles.ghost}`}
          onClick={onDownload}
        >
          Download
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.primary}`}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};
