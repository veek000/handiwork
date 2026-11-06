"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { adminApi } from "@/lib/convexApi";
import { LoadingState } from "@/components/LoadingState";
import { AdminHead, dateTime, naira } from "@/components/admin/AdminParts";

const JOB_LABEL: Record<string, string> = {
  pending: "Waiting for quote",
  quoted: "Quoted",
  in_progress: "In progress (paid)",
  marked_completed: "Awaiting confirmation",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Declined",
};

/** Admin Overview: who's on the platform, job pipeline, money in escrow, and what needs attention. */
export default function AdminOverviewPage() {
  const o = useQuery(adminApi.overview, {});
  const audit = useQuery(adminApi.auditLog, {});
  if (!o) return <LoadingState />;

  const attention = [
    { n: o.users.pendingVerification, label: "vendor IDs to review", href: "/admin/verifications" },
    { n: o.jobs.byStatus.marked_completed ?? 0, label: "paid jobs awaiting customer confirmation", href: "/admin/jobs?view=attention" },
    { n: o.feedback.open, label: "unresolved feedback messages", href: "/admin/feedback" },
    { n: o.users.noRole, label: "accounts that haven't finished setup", href: "/admin/users?filter=no_role" },
  ].filter((a) => a.n > 0);

  return (
    <div className="hw-admin__page">
      <AdminHead title="Overview" lede="The whole platform at a glance. Demo accounts are counted separately." />

      <section aria-labelledby="att-title" className="hw-admin__card">
        <h2 id="att-title" className="hw-admin__subtitle">Needs attention</h2>
        {attention.length ? (
          <ul className="hw-admin__attention">
            {attention.map((a) => (
              <li key={a.href}>
                <Link href={a.href}>
                  <b>{a.n}</b> {a.label}
                  <hw-icon suppressHydrationWarning name="angle-right" variant="hollow" size="14"></hw-icon>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="hw-admin__empty">Nothing waiting. 🎉</p>
        )}
      </section>

      <div className="hw-admin__stats">
        <Stat label="Customers" value={o.users.customers} />
        <Stat label="Service providers" value={o.users.vendors} sub={`${o.users.verifiedVendors} verified`} />
        <Stat label="Open jobs" value={o.jobs.open} sub={`${o.jobs.total} all time`} />
        <Stat label="Active services" value={o.services.active} sub={`${o.services.archived} archived`} />
        <Stat label="Held in escrow" value={naira(o.money.heldInEscrow)} />
        <Stat label="Released to vendors" value={naira(o.money.releasedToVendors)} />
        <Stat label="Refunded" value={naira(o.money.refundedToCustomers)} />
        <Stat label="Platform fees earned" value={naira(o.money.platformFees)} />
        <Stat label="Suspended accounts" value={o.users.suspended} />
        <Stat label="Demo accounts" value={o.users.demo} />
      </div>

      <section aria-labelledby="pipe-title" className="hw-admin__card">
        <h2 id="pipe-title" className="hw-admin__subtitle">Job pipeline</h2>
        <ul className="hw-admin__pipeline">
          {Object.entries(JOB_LABEL).map(([k, label]) => (
            <li key={k}>
              <Link href={`/admin/jobs?status=${k}`}>
                <span className="hw-admin__pipeline-n">{o.jobs.byStatus[k] ?? 0}</span>
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-title" className="hw-admin__card">
        <div className="hw-admin__cardhead">
          <h2 id="recent-title" className="hw-admin__subtitle">Recent admin actions</h2>
          <Link href="/admin/audit" className="hw-link">View all</Link>
        </div>
        {audit === undefined ? (
          <LoadingState />
        ) : audit.length ? (
          <ul className="hw-admin__log">
            {audit.slice(0, 6).map((a) => (
              <li key={a.id}>
                <span className="hw-admin__muted">{dateTime(a.at)}</span> <b>{a.admin}</b> {a.action.replace(/_/g, " ")}
                {a.note ? <span className="hw-admin__muted"> — {a.note}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="hw-admin__empty">No admin actions yet.</p>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="hw-admin__stat">
      <span className="hw-admin__stat-label">{label}</span>
      <span className="hw-admin__stat-value">{value}</span>
      {sub ? <span className="hw-admin__muted">{sub}</span> : null}
    </div>
  );
}
