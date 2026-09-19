import { useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { Compare } from "../assets/icons";
import { Preview } from "../preview";
import { useFilterInteraction } from "./useFilterInteraction";
import styles from "./FilterTools.module.css";

export const FilterInteractBox = () => {
  const { showCompare, getLastHistoryItem } = usePixediContext();
  const { width, height } = getLastHistoryItem();
  const compareRef = useRef<HTMLDivElement>(null);

  const { handleDragStart } = useFilterInteraction({ compareRef });

  return (
    <div
      className={styles.filterInteract}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <Preview isFilter={true} />
      {showCompare && (
        <>
          <div
            ref={compareRef}
            className={styles.compare}
            style={{ left: "50%" }}
          >
            <div
              className={styles.compareThumb}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <Compare />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
