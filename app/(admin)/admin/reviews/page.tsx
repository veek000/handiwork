"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { adminApi } from "@/lib/convexApi";
import { LoadingState } from "@/components/LoadingState";
import { AdminHead, Empty, NotePanel, Pill, shortDate } from "@/components/admin/AdminParts";

/** Reviews: moderate abusive or fake reviews. Hidden reviews leave the public pages and the ratings. */
export default function AdminReviewsPage() {
  const list = useQuery(adminApi.reviews, {});
  const setHidden = useMutation(adminApi.setReviewHidden);
  const [target, setTarget] = useState<{ id: string; author: string; hidden: boolean } | null>(null);

  return (
    <div className="hw-admin__page">
      <AdminHead title="Reviews" lede="Hide reviews that are abusive, fake or share personal details." />
      {list === undefined ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <Empty>No reviews yet.</Empty>
      ) : (
        <div className="hw-admin__list">
          {list.map((r) => (
            <article key={r.id} className={"hw-admin__card hw-admin__review" + (r.hidden ? " is-hidden" : "")}>
              <div className="hw-admin__cardhead">
                <span>
                  <b>{"★".repeat(r.rating)}</b>
                  <span className="hw-admin__muted">{"★".repeat(5 - r.rating)}</span> · <b>{r.author}</b> on {r.service} by {r.vendor}
                </span>
                <span className="hw-admin__pills">
                  {r.hidden ? <Pill value="hidden" /> : null}
                  <span className="hw-admin__muted">{shortDate(r.createdAt)}</span>
                </span>
              </div>
              <p className="hw-settings__row-desc">{r.body || <i>No text</i>}</p>
              {r.response ? <p className="hw-admin__muted">Reply: {r.response}</p> : null}
              <div className="hw-admin__actions">
                <button type="button" className="hw-link hw-admin__rowbtn" onClick={() => setTarget(r)}>
                  {r.hidden ? "Restore" : "Hide review"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {target ? (
        <NotePanel
          title={target.hidden ? "Restore review" : "Hide review"}
          text={target.hidden ? `Show ${target.author}'s review again?` : `Hide ${target.author}'s review from the public pages and the rating?`}
          confirmLabel={target.hidden ? "Restore" : "Hide"}
          danger={!target.hidden}
          onClose={() => setTarget(null)}
          onConfirm={(note) => setHidden({ reviewId: target.id, hidden: !target.hidden, note: note || undefined })}
        />
      ) : null}
    </div>
  );
}
