"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { adminApi } from "@/lib/convexApi";
import { LoadingState } from "@/components/LoadingState";
import { SidePanel } from "@/components/SidePanel";
import { Button } from "@/components/Button";
import { AdminHead, Empty, NotePanel, Pill, Toolbar, dateTime, naira, shortDate } from "@/components/admin/AdminParts";

const FILTERS = [
  { value: "attention", label: "Needs attention" },
  { value: "all", label: "All" },
  { value: "pending", label: "Waiting for quote" },
  { value: "quoted", label: "Quoted" },
  { value: "in_progress", label: "In progress" },
  { value: "marked_completed", label: "Awaiting confirmation" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Declined" },
];

/**
 * Jobs & Disputes: every job with its parties and payment. Open one to read the full
 * chat and payment record, and — for disputes, no-shows or stuck confirmations — settle
 * it: refund the customer in full (job cancelled) or release escrow to the provider
 * (job completed). Both post a "Support Decision" in the chat, notify both sides and
 * are logged.
 */
export default function AdminJobsPage() {
  const [filter, setFilter] = useState("attention");
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = p.get("status") ?? (p.get("view") === "attention" ? "attention" : null);
    if (s && FILTERS.some((f) => f.value === s)) setFilter(s);
  }, []);
  const jobs = useQuery(adminApi.jobs, filter === "attention" ? { disputesOnly: true } : { status: filter });

  return (
    <div className="hw-admin__page">
      <AdminHead title="Jobs & Disputes" lede="“Needs attention” lists paid jobs still waiting on completion or confirmation." />
      <Toolbar filters={FILTERS} filter={filter} onFilter={setFilter} />
      {jobs === undefined ? (
        <LoadingState />
      ) : jobs.length === 0 ? (
        <Empty>No jobs here.</Empty>
      ) : (
        <div className="hw-admin__tablewrap">
          <table className="hw-admin__table">
            <thead>
              <tr><th>Job</th><th>Customer</th><th>Provider</th><th>Status</th><th>Amount</th><th>Created</th></tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} tabIndex={0} onClick={() => setOpenId(j.id)} onKeyDown={(e) => e.key === "Enter" && setOpenId(j.id)}>
                  <td><b>{j.title}</b></td>
                  <td>{j.customer}</td>
                  <td>{j.vendor}</td>
                  <td><Pill value={j.status} /></td>
                  <td>{naira(j.amount)}{j.paymentStatus ? <span className="hw-admin__muted"> · {j.paymentStatus}</span> : null}</td>
                  <td>{shortDate(j.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {openId ? <JobPanel id={openId} onClose={() => setOpenId(null)} /> : null}
    </div>
  );
}

function JobPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const j = useQuery(adminApi.jobDetail, { id });
  const resolve = useMutation(adminApi.resolveJob);
  const [confirm, setConfirm] = useState<"refund" | "release" | null>(null);
  const open = j && ["pending", "quoted", "in_progress", "marked_completed"].includes(j.status);
  const paid = j && (j.status === "in_progress" || j.status === "marked_completed");
  const held = j?.payments.find((p) => p.status === "held");

  if (confirm && j) {
    return confirm === "refund" ? (
      <NotePanel
        title="Refund customer"
        text={`Close "${j.title}" and refund ${held ? naira(held.total) + " (the full total, no fee kept)" : "nothing (no payment held)"} to ${j.customer.name}. Both sides are notified.`}
        confirmLabel="Close & Refund"
        danger
        noteLabel="Decision note (shown in the chat)"
        noteRequired
        onClose={() => setConfirm(null)}
        onConfirm={(note) => resolve({ jobId: j.id, outcome: "refund_customer", note })}
      />
    ) : (
      <NotePanel
        title="Release to provider"
        text={`Complete "${j.title}" and release ${held ? naira(held.amount) : "the escrow"} to ${j.vendor.name}. Both sides are notified.`}
        confirmLabel="Complete & Release"
        noteLabel="Decision note (shown in the chat)"
        noteRequired
        onClose={() => setConfirm(null)}
        onConfirm={(note) => resolve({ jobId: j.id, outcome: "release_vendor", note })}
      />
    );
  }

  return (
    <SidePanel
      title={j?.title ?? "Job"}
      onClose={onClose}
      footer={
        open ? (
          <div className="hw-form__stack">
            {paid ? <Button variant="primary" block onClick={() => setConfirm("release")}>Release to Provider</Button> : null}
            <Button variant="secondary" block className="hw-settings__danger-btn" onClick={() => setConfirm("refund")}>
              {paid ? "Refund Customer" : "Close Job"}
            </Button>
          </div>
        ) : undefined
      }
    >
      {j === undefined ? (
        <LoadingState />
      ) : j === null ? (
        <Empty>This job no longer exists.</Empty>
      ) : (
        <div className="hw-settings__form">
          <div className="hw-admin__pills">
            <Pill value={j.status} />
            {j.cancelledBy ? <Pill value="cancelled" label={`cancelled by ${j.cancelledBy}`} /> : null}
          </div>
          <dl className="hw-admin__facts">
            <div><dt>Customer</dt><dd>{j.customer.name}</dd></div>
            <div><dt>Provider</dt><dd>{j.vendor.name}</dd></div>
            <div><dt>Preferred</dt><dd>{j.preferred}</dd></div>
            <div><dt>Requested</dt><dd>{dateTime(j.createdAt)}</dd></div>
          </dl>
          <p className="hw-settings__row-desc">{j.description}</p>

          <h3 className="hw-settings__group-title">Payments</h3>
          {j.payments.length ? (
            j.payments.map((p) => (
              <dl key={p.id} className="hw-admin__facts hw-admin__facts--box">
                <div><dt>Status</dt><dd><Pill value={p.status} /> <span className="hw-admin__muted">{p.provider}</span></dd></div>
                <div><dt>Quote</dt><dd>{naira(p.amount)}</dd></div>
                <div><dt>Fees</dt><dd>{naira(p.serviceFee)} service · {naira(p.processingFee)} processing</dd></div>
                <div><dt>Total paid</dt><dd>{naira(p.total)}</dd></div>
                {p.refundAmount != null ? <div><dt>Refunded</dt><dd>{naira(p.refundAmount)}{p.retainedFee ? ` (kept ${naira(p.retainedFee)})` : ""}</dd></div> : null}
              </dl>
            ))
          ) : (
            <p className="hw-admin__muted">No payment yet.</p>
          )}

          <h3 className="hw-settings__group-title">Chat ({j.messages.length})</h3>
          <ol className="hw-admin__chat">
            {j.messages.map((m) => (
              <li key={m.id} className={m.kind === "system" ? "is-system" : undefined}>
                <span className="hw-admin__muted">{dateTime(m.at)} · {m.from}</span>
                <p>{m.body}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </SidePanel>
  );
}
