"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Select — a custom dropdown (NOT a native <select>, whose OS popup spills outside
 * the browser window). Renders an in-page, scrollable list contained within the
 * document. Controlled: parent holds the value. Styling: .hw-select*.
 */
export function Select({
  id,
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className={"hw-select" + (open ? " is-open" : "") + (className ? " " + className : "")} ref={ref}>
      <button
        type="button"
        id={id}
        className="hw-input hw-select__control"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? undefined : "hw-select__placeholder"}>{value || placeholder}</span>
      </button>

      <span className="hw-select__chevron" aria-hidden="true">
        <hw-icon suppressHydrationWarning name="angle-down" variant="hollow" size="16"></hw-icon>
      </span>

      {open ? (
        <ul className="hw-select__list" role="listbox">
          {options.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={opt === value}
              className={"hw-select__option" + (opt === value ? " is-selected" : "")}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default Select;
