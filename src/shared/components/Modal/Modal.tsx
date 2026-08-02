import styles from "./Modal.module.css";

type ModalProps = {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export const Modal = ({
  children,
  open,
  onClose,
  size = "md",
  className,
}: ModalProps) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalOverlay} onClick={handleBackdropClick}></div>
      <div
        className={`${styles.modalContent} ${styles[size]} ${className || ""}`}
      >
        {children}
      </div>
    </div>
  );
};
