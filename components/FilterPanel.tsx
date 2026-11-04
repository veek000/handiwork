"use client";

import { useState } from "react";
import { Select } from "@/components/auth/Select";
import { Button } from "@/components/Button";
import { SidePanel } from "@/components/SidePanel";
import {
  EMPTY_FILTERS,
  RATING_OPTIONS,
  SORT_OPTIONS,
  type RatingOption,
  type SearchFilters,
  type SortOption,
} from "@/lib/search";

/**
 * FilterPanel — "Filter By" for Search (Figma desktop 6619:3694 / mobile 6619:18887),
 * in the shared SidePanel (right drawer ≥1024px, bottom sheet below). Edits a draft;
 * Apply commits it, Reset clears the draft. Styling: .hw-form* (shared form rows).
 *
 * Figma's Ratings placeholder reads "Choose an area" (copied from the address form);
 * "Choose a rating" is used instead.
 */
export function FilterPanel({
  value,
  onApply,
  onClose,
}: {
  value: SearchFilters;
  onApply: (next: SearchFilters) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<SearchFilters>(value);
  const set = <K extends keyof SearchFilters>(k: K, v: SearchFilters[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const digits = (v: string) => v.replace(/[^\d]/g, "");

  return (
    <SidePanel
      title="Filter By"
      onClose={onClose}
      footer={
        <div className="hw-form__pair">
          <Button type="button" variant="secondary" block onClick={() => setDraft(EMPTY_FILTERS)}>
            Reset
          </Button>
          <Button type="button" variant="primary" block onClick={() => onApply(draft)}>
            Apply
          </Button>
        </div>
      }
    >
      <div className="hw-form">
        <div className="hw-form__group">
          <span className="hw-form__label">Sort by</span>
          <Select
            ariaLabel="Sort by"
            value={draft.sort}
            placeholder="Popularity"
            options={[...SORT_OPTIONS]}
            onChange={(v) => set("sort", v as SortOption)}
          />
        </div>

        <div className="hw-form__group">
          <span className="hw-form__label">Price Range</span>
          <div className="hw-form__pair">
            <input
              className="hw-input"
              inputMode="numeric"
              placeholder="Min"
              aria-label="Minimum price (NGN)"
              value={draft.min}
              onChange={(e) => set("min", digits(e.target.value))}
            />
            <input
              className="hw-input"
              inputMode="numeric"
              placeholder="Max"
              aria-label="Maximum price (NGN)"
              value={draft.max}
              onChange={(e) => set("max", digits(e.target.value))}
            />
          </div>
        </div>

        <div className="hw-form__group">
          <span className="hw-form__label">Ratings</span>
          <Select
            ariaLabel="Ratings"
            value={draft.rating}
            placeholder="Choose a rating"
            options={[...RATING_OPTIONS]}
            onChange={(v) => set("rating", v as RatingOption)}
          />
        </div>
      </div>
    </SidePanel>
  );
}

export default FilterPanel;
