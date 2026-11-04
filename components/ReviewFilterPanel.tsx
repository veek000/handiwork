"use client";

import { useState } from "react";
import { Select } from "@/components/auth/Select";
import { Button } from "@/components/Button";
import { SidePanel } from "@/components/SidePanel";

export const REVIEW_STAR_OPTIONS = ["5 Stars", "4 Stars", "3 Stars", "2 Stars", "1 Star"] as const;
export type ReviewStarOption = (typeof REVIEW_STAR_OPTIONS)[number] | "";

/**
 * ReviewFilterPanel — "Filter By" on the Vendor Profile Reviews tab (Figma 6619:5277
 * shows the button; no panel is drawn, so it mirrors the Search filter in the shared
 * SidePanel with the one filter reviews support: star rating). Draft + Apply/Reset.
 */
export function ReviewFilterPanel({
  value,
  onApply,
  onClose,
}: {
  value: ReviewStarOption;
  onApply: (next: ReviewStarOption) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<ReviewStarOption>(value);
  return (
    <SidePanel
      title="Filter By"
      onClose={onClose}
      footer={
        <div className="hw-form__pair">
          <Button type="button" variant="secondary" block onClick={() => setDraft("")}>Reset</Button>
          <Button type="button" variant="primary" block onClick={() => onApply(draft)}>Apply</Button>
        </div>
      }
    >
      <div className="hw-form">
        <div className="hw-form__group">
          <span className="hw-form__label">Ratings</span>
          <Select
            ariaLabel="Ratings"
            value={draft}
            placeholder="All ratings"
            options={[...REVIEW_STAR_OPTIONS]}
            onChange={(v) => setDraft(v as ReviewStarOption)}
          />
        </div>
      </div>
    </SidePanel>
  );
}

export default ReviewFilterPanel;
