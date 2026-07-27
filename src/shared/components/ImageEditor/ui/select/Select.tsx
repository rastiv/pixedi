import { useEffect, useRef, useState, useMemo, useLayoutEffect } from "react";
import { ChevronDown, Check } from "../../assets/icons";
import styles from "./select.module.css";
import rootStyles from "../../index.module.css";

export interface SelectOption {
  value: string;
  label: string;
  options?: SelectOption[];
  rightLabel?: string;
  fullName?: string;
}

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
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const allOptions = useMemo(() => {
    const flatten = (list: SelectOption[]): SelectOption[] => {
      return list.reduce<SelectOption[]>((acc, item) => {
        if (item.options) {
          return [
            ...acc,
            ...flatten(
              item.options.map((option) => ({
                ...option,
                fullName: `${item.label} ${option.label}`,
              })),
            ),
          ];
        }
        return [...acc, item];
      }, []);
    };
    return flatten(items);
  }, [items]);

  const selectedOption = allOptions.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !event.composedPath().includes(containerRef.current)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !contentRef.current) return;

    const editorRect = containerRef.current
      ?.closest<HTMLElement>(`.${rootStyles.main}`)
      ?.getBoundingClientRect();
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const availableBottom = (editorRect?.bottom ?? window.innerHeight) - 16;
    const contentBottom = triggerRect.bottom + contentRect.height + 4;

    let contentTop = "calc(100% + 4px)";
    if (contentBottom > availableBottom) {
      const diff = contentBottom - availableBottom;
      contentTop = `calc(100% + 4px - ${diff}px)`;
    }

    contentRef.current.style.top = contentTop;
  }, [isOpen, items]);

  const handleSelectItem = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

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
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.fullName : placeholder}</span>
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
              {value === item.value && <Check className={styles.itemCheck} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
