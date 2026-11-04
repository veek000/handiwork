"use client";

import { useState, type FormEvent } from "react";

/**
 * SearchField — the full-width 48px search box on the Search screen (Figma 6619:3461 /
 * 6619:3488). Empty: magnifying-glass + placeholder. Filled: the query with a circled-x
 * clear button on the right. Enter submits. Styling: .hw-searchfield*.
 */
export function SearchField({
  initialValue = "",
  onSubmit,
  onClear,
}: {
  initialValue?: string;
  onSubmit: (value: string) => void;
  onClear: () => void;
}) {
  const [value, setValue] = useState(initialValue);

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit(value.trim());
  }

  return (
    <form className={"hw-searchfield" + (value ? " is-filled" : "")} role="search" onSubmit={submit}>
      {!value ? (
        <span className="hw-searchfield__icon" aria-hidden="true">
          <hw-icon suppressHydrationWarning name="magnifying-glass" variant="hollow" size="16"></hw-icon>
        </span>
      ) : null}
      <input
        className="hw-input hw-searchfield__input"
        type="search"
        enterKeyHint="search"
        placeholder="Search by role, skills or keywords"
        aria-label="Search services"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value ? (
        <button
          type="button"
          className="hw-searchfield__clear"
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            onClear();
          }}
        >
          <hw-icon suppressHydrationWarning name="circle-x" variant="filled" size="16"></hw-icon>
        </button>
      ) : null}
    </form>
  );
}

export default SearchField;
