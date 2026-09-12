import { ChevronDown, Check } from "../../assets/icons";
import styles from "./Select.module.css";
import rootStyles from "../../index.module.css";
import { useSelect } from "./useSelect";
import type { SelectOption } from "./useSelect";

export type { SelectOption } from "./useSelect";

interface SelectProps {
  items: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  renderOption?: (option: SelectOption) => React.ReactNode;
}

export const Select = ({
  items,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  renderOption,
}: SelectProps) => {
  const {
    isOpen,
    selectedLabel,
    containerRef,
    triggerRef,
    contentRef,
    handleSelectItem,
    toggleOpen,
  } = useSelect({ items, value, onChange });

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
        <span>{selectedLabel ?? placeholder}</span>
        <ChevronDown className={styles.triggerArrow} />
      </button>

      <div ref={contentRef} className={styles.content}>
        {items.map((item, index) => {
          if (item.options) {
            return (
              <div key={`group-${index}`}>
                {/* Group Name */}
                <div className={`${styles.groupLabel} ${rootStyles.semibold}`}>
                  {item.label}
                </div>
                {item.options.map((option) => (
                  <div
                    key={option.value}
                    className={styles.item}
                    onClick={() => handleSelectItem(option.value)}
                  >
                    {renderOption ? (
                      renderOption(option)
                    ) : (
                      <span className={styles.itemLeft}>{option.label}</span>
                    )}
                    <div className={styles.itemAddon}>
                      {option.rightLabel && <span>{option.rightLabel}</span>}
                      {value === option.value && (
                        <Check className={styles.itemCheck} />
                      )}
                      {value !== option.value && <b />}
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div
              key={item.value}
              className={styles.item}
              onClick={() => handleSelectItem(item.value)}
            >
              {renderOption ? (
                renderOption(item)
              ) : (
                <span className={styles.itemLeft}>{item.label}</span>
              )}
              <div className={styles.itemAddon}>
                {item.rightLabel && <span>{item.rightLabel}</span>}
                {value === item.value && <Check className={styles.itemCheck} />}
                {value !== item.value && <b />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
