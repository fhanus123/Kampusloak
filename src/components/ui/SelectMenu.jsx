import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export default function SelectMenu({
  value,
  options,
  onChange,
  labelId,
  ariaLabel,
  placeholder,
  className = "",
  onBlur,
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const optionRefs = useRef([]);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedLabel = options[selectedIndex]?.label ?? placeholder;

  const openMenu = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const selectOption = (option) => {
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex(
        (index) => (index + direction + options.length) % options.length,
      );
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      if (!open) openMenu();
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        openMenu();
      } else if (options[activeIndex]) {
        selectOption(options[activeIndex]);
      }
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return undefined;

    const closeOutside = (event) => {
      if (
        !triggerRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-labelledby={labelId}
        aria-valuetext={selectedLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? `${id}-listbox` : undefined}
        aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
        onBlur={onBlur}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-ink/20 bg-white px-3 py-2.5 text-left text-sm outline-none transition-colors duration-150 hover:border-brand hover:bg-page focus-visible:ring-2 focus-visible:ring-brand active:bg-brand/10 motion-reduce:transition-none ${className}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 transition-transform duration-150 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div
          ref={menuRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-labelledby={labelId}
          aria-label={ariaLabel}
          className="absolute left-0 top-full z-30 mt-2 max-h-72 w-full min-w-48 overflow-y-auto rounded-xl border border-ink/15 bg-white p-1.5 text-ink shadow-xl animate-[category-menu-in_140ms_ease-out] motion-reduce:animate-none"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <div
                key={option.value}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 hover:bg-page hover:text-brand motion-reduce:transition-none ${
                  isSelected ? "bg-nav-sub/10 font-semibold text-nav-sub" : ""
                } ${isActive ? "outline outline-2 outline-brand outline-offset-[-2px]" : ""}`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
