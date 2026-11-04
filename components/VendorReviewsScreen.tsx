"use client";

import { useMemo, useState } from "react";
import type { Review, VendorUser } from "@/types";
import { PageNav } from "@/components/PageNav";
import { ReviewSummary } from "@/components/ReviewSummary";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewFilterPanel, type ReviewStarOption } from "@/components/ReviewFilterPanel";
import { ConfirmPanel } from "@/components/ConfirmPanel";
import { SidePanel } from "@/components/SidePanel";
import { Button } from "@/components/Button";

type Panel = { kind: "filter" } | { kind: "reply" | "delete"; id: string } | null;

/** Reply / Edit response form — not drawn in Figma; follows the vendor panel pattern. */
function ResponsePanel({ initial, onSave, onClose }: { initial: string; onSave: (text: string) => void; onClose: () => void }) {
  const [text, setText] = useState(initial);
  return (
    <SidePanel
      title={initial ? "Edit Response" : "Reply to Review"}
      onClose={onClose}
      footer={
        <div className="hw-form__stack">
          <Button variant="secondary" block disabled={!text.trim()} onClick={() => onSave(text.trim())}>
            {initial ? "Save" : "Post Response"}
          </Button>
          <Button variant="primary" block onClick={onClose}>Cancel</Button>
        </div>
      }
    >
      <label className="hw-form__group">
        <span className="hw-form__label">Your Response</span>
        <textarea className="hw-input" rows={6} placeholder="Write a reply to this review" value={text} onChange={(e) => setText(e.target.value)} />
      </label>
    </SidePanel>
  );
}

/**
 * Vendor My Reviews (Figma desktop 6619:31115, mobile 6619:43248): average + per-star
 * bars, Filter By (star rating), and each review with "Your Response" (open) and Edit /
 * Delete, or Reply when unanswered. Replies are local only until Convex is wired.
 */
export function VendorReviewsScreen({ vendor, reviews: initial }: { vendor: VendorUser; reviews: Review[] }) {
  const [reviews, setReviews] = useState(initial);
  const [stars, setStars] = useState<ReviewStarOption>("");
  const [panel, setPanel] = useState<Panel>(null);
  const shown = useMemo(() => (stars ? reviews.filter((r) => r.rating === parseInt(stars, 10)) : reviews), [reviews, stars]);
  const target = panel && "id" in panel ? reviews.find((r) => r.id === panel.id) : undefined;
  const setResponse = (id: string, response?: string) => setReviews((all) => all.map((r) => (r.id === id ? { ...r, response } : r)));
  const close = () => setPanel(null);
  const me = { name: vendor.fullName, avatarUrl: vendor.avatarUrl };

  return (
    <div className="hw-jobs">
      <PageNav backHref="/vendor" crumbs={[{ label: "Home", href: "/vendor" }, { label: "My Reviews" }]} />
      <div className="hw-searchpage__titlerow">
        <h1 className="hw-jobs__title">My Reviews</h1>
        <button type="button" className={"hw-filterbtn" + (stars ? " is-active" : "")} aria-haspopup="dialog" onClick={() => setPanel({ kind: "filter" })}>
          Filter By{stars ? " (1)" : ""}
          <hw-icon suppressHydrationWarning name="angle-down" variant="hollow" size="16"></hw-icon>
        </button>
      </div>

      <ReviewSummary reviews={reviews} variant="profile" />

      {shown.length ? (
        <div className="hw-detail__reviewlist">
          {shown.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              vendor={me}
              responseLabel="Your Response"
              responseOpen
              actions={
                r.response ? (
                  <>
                    <button type="button" className="hw-jobcard__btn hw-jobcard__btn--complete" onClick={() => setPanel({ kind: "reply", id: r.id })}>Edit</button>
                    <button type="button" className="hw-jobcard__btn hw-jobcard__btn--cancel" onClick={() => setPanel({ kind: "delete", id: r.id })}>Delete</button>
                  </>
                ) : (
                  <button type="button" className="hw-jobcard__btn hw-jobcard__btn--complete hw-review__reply-btn" onClick={() => setPanel({ kind: "reply", id: r.id })}>Reply</button>
                )
              }
            />
          ))}
        </div>
      ) : (
        <p className="hw-searchpage__emptysub">{reviews.length ? "No reviews match this filter." : "No reviews yet."}</p>
      )}

      {panel?.kind === "filter" ? (
        <ReviewFilterPanel value={stars} onClose={close} onApply={(next) => { setStars(next); close(); }} />
      ) : null}
      {panel?.kind === "reply" && target ? (
        <ResponsePanel initial={target.response ?? ""} onClose={close} onSave={(text) => { setResponse(target.id, text); close(); }} />
      ) : null}
      {panel?.kind === "delete" && target ? (
        <ConfirmPanel
          title="Delete Response"
          text="Remove your reply to this review? The review itself stays visible."
          confirmLabel="Delete"
          onClose={close}
          onConfirm={() => { setResponse(target.id, undefined); close(); }}
        />
      ) : null}
    </div>
  );
}

export default VendorReviewsScreen;
