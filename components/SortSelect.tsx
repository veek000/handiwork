"use client";

import { useState, useRef, useEffect, useLayoutEffect, type ReactNode } from "react";

/**
 * SortSelect — controlled dropdown (Sort by on Vendor Home). Renders a button trigger + an
 * absolutely-positioned list of options. Closes on outside click or option pick.
 *
 * Distinct from components/auth/Select (the form-field dropdown): different API
 * (value/label option objects, viewport flip) and a compact sort-control use case.
 *
 * Placement: anchors to the trigger’s right edge and flips above the trigger when there
 * isn’t enough room below (stops the menu from opening off-screen).
 * Styling: .hw-select* (orders-sort scoped styles in dashboard.css).
 */
export function SortSelect({
  label,
  value,
  options,
  onChange,
}: {
  /** Optional prefix inside the trigger (e.g. "Sort by:"). Omit when the label lives outside. */
  label?: ReactNode;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  /** open upward when the list would overflow the bottom of the viewport */
  const [placeAbove, setPlaceAbove] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Measure after open paint so we know real list height vs viewport space.
  useLayoutEffect(() => {
    if (!open || !ref.current) {
      setPlaceAbove(false);
      return;
    }
    const trigger = ref.current.getBoundingClientRect();
    const listH = listRef.current?.offsetHeight ?? 120;
    const gap = 8;
    const spaceBelow = window.innerHeight - trigger.bottom - gap;
    const spaceAbove = trigger.top - gap;
    setPlaceAbove(spaceBelow < listH && spaceAbove > spaceBelow);
  }, [open, options.length]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={"hw-select" + (open ? " is-open" : "")} ref={ref}>
      <button
        type="button"
        className="hw-select__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {label ? <span className="hw-select__label">{label}</span> : null}
        <span className="hw-select__value">{selected?.label ?? value}</span>
        <hw-icon
          suppressHydrationWarning
          name="angle-down"
          variant="hollow"
          size="14"
        ></hw-icon>
      </button>

      {open ? (
        <ul
          ref={listRef}
          className={
            "hw-select__list" + (placeAbove ? " hw-select__list--above" : "")
          }
          role="listbox"
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                className={
                  "hw-select__option" + (opt.value === value ? " is-active" : "")
                }
                role="option"
                aria-selected={opt.value === value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default SortSelect;
