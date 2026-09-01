import { useEffect, useRef, useState, useMemo, useLayoutEffect } from "react";
import { ChevronDown, Check } from "../../assets/icons";
import styles from "./Select.module.css";
import rootStyles from "../../index.module.css";

// the dropdown is rendered inside the editor, so it can only grow inside the
// closest clipping ancestors (the frame has overflow hidden)
const getClipBounds = (element: HTMLElement) => {
  let top = 0;
  let bottom = window.innerHeight;

  for (
    let parent = element.parentElement;
    parent;
    parent = parent.parentElement
  ) {
    const { overflow, overflowY } = getComputedStyle(parent);
    if (overflow === "visible" && overflowY === "visible") continue;
    const rect = parent.getBoundingClientRect();
    top = Math.max(top, rect.top);
    bottom = Math.min(bottom, rect.bottom);
  }

  return { top, bottom };
};

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
    const wrapper = containerRef.current;
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (!isOpen || !wrapper || !trigger || !content) return;

    content.style.removeProperty("top");
    content.style.removeProperty("max-height");

    const gap = 4;
    const inset = 8;
    const { top: clipTop, bottom: clipBottom } = getClipBounds(wrapper);
    const wrapperTop = wrapper.getBoundingClientRect().top;
    const triggerRect = trigger.getBoundingClientRect();
    const contentHeight = content.offsetHeight;
    const spaceBelow = clipBottom - inset - triggerRect.bottom - gap;
    const spaceAbove = triggerRect.top - gap - clipTop - inset;

    let top = triggerRect.bottom + gap;
    let maxHeight = 0;

    if (contentHeight > spaceBelow) {
      if (contentHeight <= spaceAbove) {
        top = triggerRect.top - gap - contentHeight;
      } else if (spaceAbove > spaceBelow) {
        maxHeight = Math.max(spaceAbove, 0);
        top = triggerRect.top - gap - maxHeight;
      } else {
        maxHeight = Math.max(spaceBelow, 0);
      }
    }

    if (maxHeight) content.style.maxHeight = `${maxHeight}px`;
    content.style.top = `${top - wrapperTop}px`;
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
