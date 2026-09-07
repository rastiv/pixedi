import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  options?: SelectOption[];
  rightLabel?: string;
  fullName?: string;
}

type UseSelectArgs = {
  items: SelectOption[];
  value: string;
  onChange: (value: string) => void;
};

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

export const useSelect = ({ items, value, onChange }: UseSelectArgs) => {
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

  const selectedOption = allOptions.find((option) => option.value === value);
  const selectedLabel = selectedOption?.fullName ?? selectedOption?.label;

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

  const handleSelectItem = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  const toggleOpen = () => setIsOpen((open) => !open);

  return {
    isOpen,
    selectedLabel,
    containerRef,
    triggerRef,
    contentRef,
    handleSelectItem,
    toggleOpen,
  };
};
