import { usePixediContext } from "../provider/usePixediContext";
import { Compare } from "../assets/icons";
import { Preview } from "../preview";
import styles from "./FilterTools.module.css";

export const FilterInteractBox = () => {
  const { showCompare, getLastHistoryItem } = usePixediContext();
  const { width, height } = getLastHistoryItem();

  return (
    <div
      className={styles.filterInteract}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <Preview />
      {showCompare && (
        <>
          <div className={styles.compare}>
            <div className={styles.compareThumb}>
              <Compare />
            </div>
          </div>
          <div className={`${styles.before} ${styles.label}`}>Before</div>
          <div className={`${styles.after} ${styles.label}`}>After</div>
        </>
      )}
    </div>
  );
};
