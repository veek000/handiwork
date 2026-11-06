"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { adminApi, type AdminVerification } from "@/lib/convexApi";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/Button";
import { AdminHead, Empty, NotePanel, dateTime } from "@/components/admin/AdminParts";

/**
 * Verification queue: vendors who uploaded an ID, oldest first. Check the document
 * against the name and number, then Approve (badge appears) or Reject with a reason
 * (shown to the vendor, who can upload again). Both notify the vendor and are logged.
 */
export default function VerificationsPage() {
  const queue = useQuery(adminApi.verificationQueue, {});
  const decide = useMutation(adminApi.decideVerification);
  const [panel, setPanel] = useState<{ kind: "approve" | "reject"; v: AdminVerification } | null>(null);

  return (
    <div className="hw-admin__page">
      <AdminHead title="Verifications" lede="Check each vendor's ID against their name and number before approving." />
      {queue === undefined ? (
        <LoadingState />
      ) : queue.length === 0 ? (
        <Empty>No IDs waiting for review.</Empty>
      ) : (
        <div className="hw-admin__grid">
          {queue.map((v) => (
            <article key={v.id} className="hw-admin__card hw-admin__verify">
              <div className="hw-admin__verify-doc">
                {v.documentUrl && v.documentType?.startsWith("image/") ? (
                  <a href={v.documentUrl} target="_blank" rel="noreferrer" title="Open full size">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.documentUrl} alt={`ID document uploaded by ${v.name}`} />
                  </a>
                ) : v.documentUrl ? (
                  <a className="hw-button hw-button--secondary" href={v.documentUrl} target="_blank" rel="noreferrer">
                    Open PDF document
                  </a>
                ) : (
                  <span className="hw-admin__muted">Document missing</span>
                )}
              </div>
              <dl className="hw-admin__facts">
                <div><dt>Name</dt><dd>{v.name}</dd></div>
                <div><dt>Email</dt><dd>{v.email || "—"}</dd></div>
                <div><dt>ID number</dt><dd className="hw-admin__mono">{v.idNumber || "—"}</dd></div>
                <div><dt>Service</dt><dd>{v.service || "—"}{v.yearsOfExperience ? ` · ${v.yearsOfExperience}` : ""}</dd></div>
                <div><dt>Location</dt><dd>{v.location || "—"}</dd></div>
                <div><dt>Submitted</dt><dd>{v.submittedAt ? dateTime(v.submittedAt) : "—"}</dd></div>
              </dl>
              <div className="hw-admin__actions">
                <Button variant="primary" onClick={() => setPanel({ kind: "approve", v })}>Approve</Button>
                <Button variant="secondary" className="hw-settings__danger-btn" onClick={() => setPanel({ kind: "reject", v })}>Reject</Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {panel?.kind === "approve" ? (
        <NotePanel
          title="Approve ID"
          text={`Mark ${panel.v.name} as verified? The badge appears on their profile and services, and they're notified.`}
          confirmLabel="Approve"
          onClose={() => setPanel(null)}
          onConfirm={(note) => decide({ userId: panel.v.id, decision: "verified", note: note || undefined })}
        />
      ) : null}
      {panel?.kind === "reject" ? (
        <NotePanel
          title="Reject ID"
          text={`Tell ${panel.v.name} what's wrong (e.g. "photo is blurry", "name doesn't match"). They'll see this and can upload again.`}
          confirmLabel="Reject"
          danger
          noteLabel="Reason (shown to the vendor)"
          noteRequired
          onClose={() => setPanel(null)}
          onConfirm={(note) => decide({ userId: panel.v.id, decision: "rejected", note })}
        />
      ) : null}
    </div>
  );
}
