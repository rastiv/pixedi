import { useEffect, useRef, useState, useMemo, useLayoutEffect } from "react";
import { ChevronDown, Check } from "../../assets/icons";
import "./select.css";

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

export const Select: React.FC<SelectProps> = ({
  items,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  renderOption,
}) => {
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
        !containerRef.current.contains(event.target as Node)
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
      ?.closest<HTMLElement>(".picedi.main")
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
      className={`select-wrapper ${className}`.trim()}
      data-state={isOpen ? "open" : "closed"}
    >
      <button
        ref={triggerRef}
        type="button"
        className="select-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.fullName : placeholder}</span>
        <ChevronDown className="select-trigger-arrow" />
      </button>

      <div ref={contentRef} className="select-content">
        {items.map((item, index) => {
          if (item.options) {
            return (
              <div key={`group-${index}`}>
                {/* Group Name */}
                <div className="select-group-label semibold">{item.label}</div>
                {item.options.map((option) => (
                  <div
                    key={option.value}
                    className="select-item"
                    onClick={() => handleSelectItem(option.value)}
                  >
                    {renderOption ? (
                      renderOption(option)
                    ) : (
                      <span className="select-item-left">{option.label}</span>
                    )}
                    <div className="select-item-addon">
                      {option.rightLabel && <span>{option.rightLabel}</span>}
                      {value === option.value && (
                        <Check className="select-item-check" />
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
              className="select-item"
              onClick={() => handleSelectItem(item.value)}
            >
              {renderOption ? (
                renderOption(item)
              ) : (
                <span className="select-item-left">{item.label}1</span>
              )}
              {value === item.value && <Check className="select-item-check" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
