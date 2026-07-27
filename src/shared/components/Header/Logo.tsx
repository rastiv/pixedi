import styles from "./Header.module.css";

const Logo = () => {
  return (
    <div className={styles.logo}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={styles.logoIcon}
      >
        <path d="M3 8V3h5" className={styles.logoIconC2} />
        <path d="M16 3h5v5" className={styles.logoIconC1} />
        <path d="M21 16v5h-5" className={styles.logoIconC2} />
        <path d="M8 21H3v-5" className={styles.logoIconC1} />
        <rect width="8" height="8" x="8" y="8" className={styles.logoIconC1} />
      </svg>
      <div className={styles.logoName}>
        <span className={styles.logoNameC1}>Pix</span>
        <span className={styles.logoNameC2}>Edi</span>
      </div>
    </div>
  );
};

export default Logo;
