import styles from "./Header.module.css";

const Logo = () => {
  return (
    <div className={styles.logo}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={styles.logoIcon}
      >
        <path d="M3 7V5a2 2 0 0 1 2-2h2" className={styles.logoIconC2} />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" className={styles.logoIconC1} />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" className={styles.logoIconC2} />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" className={styles.logoIconC1} />
        <rect
          width="8"
          height="8"
          x="8"
          y="8"
          rx="1"
          className={styles.logoIconC2}
        />
      </svg>
      <div className={styles.logoName}>
        <span className={styles.logoNameC1}>Pix</span>
        <span className={styles.logoNameC2}>Edi</span>
      </div>
    </div>
  );
};

export default Logo;
