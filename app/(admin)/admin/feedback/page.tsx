"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { adminApi } from "@/lib/convexApi";
import { LoadingState } from "@/components/LoadingState";
import { AdminHead, Empty, Pill, Toolbar, dateTime } from "@/components/admin/AdminParts";

/** Feedback sent from the dashboards' Feedback screen. Mark each one resolved once handled. */
export default function AdminFeedbackPage() {
  const [view, setView] = useState("open");
  const list = useQuery(adminApi.feedback, { showResolved: view === "all" });
  const setResolved = useMutation(adminApi.setFeedbackResolved);

  return (
    <div className="hw-admin__page">
      <AdminHead title="Feedback" lede="Suggestions, problems and compliments from users. An email shows only if they agreed to be contacted." />
      <Toolbar filters={[{ value: "open", label: "Open" }, { value: "all", label: "All" }]} filter={view} onFilter={setView} />
      {list === undefined ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <Empty>No feedback here.</Empty>
      ) : (
        <div className="hw-admin__list">
          {list.map((f) => (
            <article key={f.id} className="hw-admin__card">
              <div className="hw-admin__cardhead">
                <span className="hw-admin__pills">
                  <Pill value={f.kind === "problem" ? "rejected" : f.kind === "compliment" ? "verified" : "quoted"} label={f.kind} />
                  {f.rating ? <span>{"★".repeat(f.rating)}</span> : null}
                  <b>{f.from}</b>
                  {f.role ? <span className="hw-admin__muted">({f.role === "vendor" ? "provider" : f.role})</span> : null}
                </span>
                <span className="hw-admin__muted">{dateTime(f.createdAt)}</span>
              </div>
              <p className="hw-settings__row-desc">{f.message}</p>
              <div className="hw-admin__actions">
                {f.email ? <a className="hw-link" href={`mailto:${f.email}?subject=Your%20Handiwork%20feedback`}>Reply to {f.email}</a> : <span className="hw-admin__muted">No contact permission</span>}
                {f.page ? <span className="hw-admin__muted">Sent from {f.page}</span> : null}
                <button type="button" className="hw-link hw-admin__rowbtn" onClick={() => setResolved({ feedbackId: f.id, resolved: !f.resolved })}>
                  {f.resolved ? "Reopen" : "Mark resolved"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
