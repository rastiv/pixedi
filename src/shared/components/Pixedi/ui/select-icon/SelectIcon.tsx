import type { SelectIconOption } from "./useSelectIcon";
import { useSelectIcon } from "./useSelectIcon";
import styles from "./SelectIcon.module.css";

type SelectIconProps = {
  items: SelectIconOption[];
  value: string;
  className?: string;
  gridCols?: number;
  onChange: (value: string) => void;
};

export const SelectIcon = ({
  items,
  value,
  className = "",
  gridCols = 5,
  onChange,
}: SelectIconProps) => {
  const {
    isOpen,
    containerRef,
    triggerRef,
    contentRef,
    handleSelectItem,
    toggleOpen,
  } = useSelectIcon({ items, onChange });

  return (
    <div
      ref={containerRef}
      className={styles.wrapper}
      data-state={isOpen ? "open" : "closed"}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={toggleOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1 1"
          className={styles.svg}
        >
          <path d={items.find((item) => item.value === value)?.label || ""} />
        </svg>
      </button>

      <div
        ref={contentRef}
        className={`${styles.content} ${className}`.trim()}
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
      >
        {items.map((item, index) => {
          return (
            <div
              key={index}
              className={`${styles.item} ${item.value === value ? styles.selected : ""}`}
              onClick={() => handleSelectItem(item.value)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1 1"
                className={styles.svg}
              >
                <path d={item.label} />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
};
