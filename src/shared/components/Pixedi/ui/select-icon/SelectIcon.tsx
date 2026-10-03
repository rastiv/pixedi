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
  gridCols = 4,
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
      className={`${styles.wrapper} ${className}`.trim()}
      data-state={isOpen ? "open" : "closed"}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={toggleOpen}
      >
        12
      </button>

      <div
        ref={contentRef}
        className={styles.content}
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
      >
        {items.map((item, index) => {
          return <b key={index}>asd</b>;
          //   return (
          //     <div
          //       key={item.value}
          //       className={styles.item}
          //       onClick={() => handleSelectItem(item.value)}
          //     >
          //       {renderOption ? (
          //         renderOption(item)
          //       ) : (
          //         <span className={styles.itemLeft}>{item.label}</span>
          //       )}
          //       <div className={styles.itemAddon}>
          //         {item.rightLabel && <span>{item.rightLabel}</span>}
          //         {value === item.value && <Check className={styles.itemCheck} />}
          //         {value !== item.value && <b />}
          //       </div>
          //     </div>
          //   );
        })}
      </div>
    </div>
  );
};
