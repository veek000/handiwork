"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import type { Job, User } from "@/types";
import { live } from "@/lib/convexApi";
import { useRunner } from "@/lib/useRunner";
import { ActionError } from "@/components/ActionError";
import { PageNav } from "@/components/PageNav";
import { SegmentedControl } from "@/components/SegmentedControl";
import { SortSelect } from "@/components/SortSelect";
import { JobCard } from "@/components/JobCard";
import { ConfirmPanel } from "@/components/ConfirmPanel";
import { formatStamp } from "@/lib/time";

type Tab = "active" | "requests";
type Panel = { kind: "complete" | "cancel"; jobId: string } | null;

// Active Job = work in hand; Service Request = waiting on the vendor's quote (pending)
// or on the customer's answer to it (quoted).
const ACTIVE: Job["status"][] = ["in_progress", "marked_completed"];
const REQUESTS: Job["status"][] = ["pending", "quoted"];
const PAGE_SIZE = 8;

/**
 * Vendor My Orders (Figma desktop 6619:31395 / 31694, mobile 6619:43443 / 43557).
 * Active Job: Mark as Completed (→ confirm → "Marked as Completed", awaiting the
 * customer) + Cancel Job (→ confirm). Service Request: request stamp + Review Request
 * → Job Details. 2-up on desktop, 8 per page, Sort Recent/Oldest. Actions call Convex
 * (jobs:markCompleted / jobs:cancel); the list is live.
 */
export function VendorOrdersScreen({ jobs, customers }: { jobs: Job[]; customers: User[] }) {
  const { run, busy, error, clearError } = useRunner();
  const markCompleted = useMutation(live.markCompleted);
  const cancelJob = useMutation(live.cancelJob);
  const [tab, setTab] = useState<Tab>("active");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState<Panel>(null);

  const customerOf = (job: Job) => customers.find((c) => c.id === job.customerId);
  const list = useMemo(
    () =>
      jobs
        .filter((j) => (tab === "active" ? ACTIVE : REQUESTS).includes(j.status))
        .sort((a, b) => (sort === "recent" ? 1 : -1) * b.createdAt.localeCompare(a.createdAt)),
    [jobs, tab, sort],
  );
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const shown = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const panelJob = panel ? jobs.find((j) => j.id === panel.jobId) : undefined;

  return (
    <div className="hw-jobs">
      <PageNav backHref="/vendor" crumbs={[{ label: "Home", href: "/vendor" }, { label: "My Orders" }]} />
      <h1 className="hw-jobs__title">My Orders</h1>

      <SegmentedControl<Tab>
        ariaLabel="My Orders"
        value={tab}
        onChange={(t) => {
          setTab(t);
          setPage(1);
        }}
        options={[
          { value: "active", label: "Active Job", panelId: "hw-orders-list" },
          { value: "requests", label: "Service Request", panelId: "hw-orders-list" },
        ]}
      />

      <div className="hw-orders-sort">
        <span className="hw-orders-sort__label">Sort by</span>
        <SortSelect
          value={sort}
          onChange={(v) => {
            setSort(v);
            setPage(1);
          }}
          options={[
            { value: "recent", label: "Recent" },
            { value: "oldest", label: "Oldest" },
          ]}
        />
      </div>

      <div id="hw-orders-list" role="tabpanel" className="hw-jobs__grid">
        {shown.length ? (
          shown.map((job) => {
            const party = { label: "Requested by", name: customerOf(job)?.fullName ?? "—" };
            return tab === "active" ? (
              <JobCard key={job.id} job={job} party={party} compact>
                {job.status === "in_progress" ? (
                  <div className="hw-jobcard__actions">
                    <button type="button" className="hw-jobcard__btn hw-jobcard__btn--complete" onClick={() => setPanel({ kind: "complete", jobId: job.id })}>
                      Mark as Completed
                    </button>
                    <button type="button" className="hw-jobcard__btn hw-jobcard__btn--cancel" onClick={() => setPanel({ kind: "cancel", jobId: job.id })}>
                      Cancel Job
                    </button>
                  </div>
                ) : (
                  <div className="hw-jobcard__actions hw-jobcard__actions--one">
                    <Link href={`/vendor/messages?job=${job.id}`} className="hw-jobcard__btn hw-jobcard__btn--complete">
                      View Chat
                    </Link>
                  </div>
                )}
              </JobCard>
            ) : (
              <JobCard key={job.id} job={job} party={party} compact stamp={formatStamp(job.createdAt)}>
                <div className="hw-jobcard__actions hw-jobcard__actions--one">
                  <Link href={`/vendor/orders/${job.id}`} className="hw-jobcard__btn hw-jobcard__btn--complete">
                    Review Request
                  </Link>
                </div>
              </JobCard>
            );
          })
        ) : (
          <p className="hw-searchpage__emptysub">
            {tab === "active" ? "No active jobs right now." : "No new service requests."}
          </p>
        )}
      </div>

      {pages > 1 ? (
        <nav className="hw-pager" aria-label="Pagination">
          <button type="button" className="hw-pager__btn" aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)}>
            <hw-icon suppressHydrationWarning name="arrow-left" variant="hollow" size="16"></hw-icon>
          </button>
          <span className="hw-pager__label">Page {current} of {pages}</span>
          <button type="button" className="hw-pager__btn" aria-label="Next page" disabled={current === pages} onClick={() => setPage(current + 1)}>
            <hw-icon suppressHydrationWarning name="arrow-right" variant="hollow" size="16"></hw-icon>
          </button>
        </nav>
      ) : null}

      {panel?.kind === "complete" && panelJob ? (
        <ConfirmPanel
          art="/assets/illustration/illustration-24.svg"
          title="Confirm Job Completion"
          text={`Let ${customerOf(panelJob)?.fullName.split(" ")[0] ?? "the customer"} know this job is done? They'll confirm before the escrow payment is released to you.`}
          onClose={() => setPanel(null)}
          onConfirm={async () => {
            if (busy) return;
            if (await run(() => markCompleted({ id: panelJob.id }))) setPanel(null);
          }}
        />
      ) : null}
      {panel?.kind === "cancel" && panelJob ? (
        <ConfirmPanel
          title="Confirm Job Cancellation"
          onClose={() => setPanel(null)}
          text="Cancel this job? The customer gets a full refund of anything they paid into escrow."
          onConfirm={async () => {
            if (busy) return;
            if (await run(() => cancelJob({ id: panelJob.id }))) setPanel(null);
          }}
        />
      ) : null}
      <ActionError error={error} onDismiss={clearError} />
    </div>
  );
}

export default VendorOrdersScreen;
