"use client";

import { useEffect, useRef, useState } from "react";

/**
 * MultiSelect — the "What Service do you need?" picker on Book Service (Figma 6619:4273):
 * same closed control and in-page list as `Select` (shares the .hw-select* styling) but
 * each option toggles, with a checkbox mark, and the list stays open until dismissed.
 * Controlled. Styling: .hw-select* + .hw-multi*.
 */
export function MultiSelect({
  values,
  onChange,
  options,
  placeholder,
  ariaLabel,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
  placeholder?: string;
  ariaLabel?: string;
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

  const toggle = (opt: string) =>
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]);

  return (
    <div className={"hw-select hw-multi" + (open ? " is-open" : "")} ref={ref}>
      <button
        type="button"
        className="hw-input hw-select__control"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={values.length ? "hw-multi__value" : "hw-select__placeholder"}>
          {values.length ? values.join(", ") : placeholder}
        </span>
      </button>
      <span className="hw-select__chevron" aria-hidden="true">
        <hw-icon suppressHydrationWarning name="angle-down" variant="hollow" size="16"></hw-icon>
      </span>
      {open ? (
        <ul className="hw-select__list" role="listbox" aria-multiselectable="true">
          {options.map((opt) => {
            const on = values.includes(opt);
            return (
              <li
                key={opt}
                role="option"
                aria-selected={on}
                className={"hw-select__option hw-multi__option" + (on ? " is-selected" : "")}
                onClick={() => toggle(opt)}
              >
                <span className="hw-multi__check" aria-hidden="true">
                  {on ? <hw-icon suppressHydrationWarning name="checkmark" variant="filled" size="12"></hw-icon> : null}
                </span>
                {opt}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default MultiSelect;
