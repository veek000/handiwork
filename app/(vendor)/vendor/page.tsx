"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { useVendorJobs, useWallet } from "@/hooks";
import { live } from "@/lib/convexApi";
import { useRunner } from "@/lib/useRunner";
import { ActionError } from "@/components/ActionError";
import { ConfirmPanel } from "@/components/ConfirmPanel";
import { LoadingState } from "@/components/LoadingState";
import { BalanceCard } from "@/components/BalanceCard";
import { StatTile } from "@/components/StatTile";
import { QuickActionTile } from "@/components/QuickActionTile";
import { JobCard } from "@/components/JobCard";
import { SortSelect } from "@/components/SortSelect";

// Vendor Home — Figma desktop 300:7831 (Home 300:7832) / mobile 300:23746 (iPhone 300:34759).
// Data via hooks only (wallet / jobs / users). Shell provides signed-in user chrome.
export default function VendorHome() {
  const wallet = useWallet();
  const data = useVendorJobs();
  const myJobs = useMemo(() => data?.jobs ?? [], [data]);
  const users = data?.customers ?? [];
  const { run, busy, error, clearError } = useRunner();
  const markCompleted = useMutation(live.markCompleted);
  const cancelJob = useMutation(live.cancelJob);
  const [panel, setPanel] = useState<{ kind: "complete" | "cancel"; jobId: string } | null>(null);

  const activeJobCount = myJobs.filter((j) => j.status === "in_progress").length;
  const serviceRequestCount = myJobs.filter((j) => j.status === "pending").length;
  const totalJobDone = myJobs.filter((j) => j.status === "completed").length;

  const [ordersTab, setOrdersTab] = useState<"active" | "request">("active");
  const [sortBy, setSortBy] = useState("recent");

  // Home teaser: at most 3 cards; full list lives on /vendor/orders (View All).
  const HOME_ORDERS_LIMIT = 3;

  const ordersShown = useMemo(() => {
    const filtered =
      ordersTab === "active"
        ? myJobs.filter((j) => j.status === "in_progress")
        : myJobs.filter((j) => j.status === "pending");

    const sorted = [...filtered].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortBy === "oldest" ? da - db : db - da;
    });
    return sorted.slice(0, HOME_ORDERS_LIMIT);
  }, [myJobs, ordersTab, sortBy]);

  const ordersWithCustomer = ordersShown.map((job) => ({
    job,
    customer: users.find((u) => u.id === job.customerId),
  }));
  const panelJob = panel ? myJobs.find((j) => j.id === panel.jobId) : undefined;

  if (!data || !wallet) return <LoadingState />;

  return (
    <div className="hw-vendor-home">
      <BalanceCard wallet={wallet} />

      {/* Analysis */}
      <section className="hw-section">
        <div className="hw-section__head">
          <h2 className="hw-section__title">Analysis</h2>
          <Link href="/vendor/analytics" className="hw-link hw-section__link">
            View details
          </Link>
        </div>
        <div className="hw-analysis-grid">
          {/* Figma chunk/clipboard · inbox · target-arrow — filled brand green */}
          <StatTile
            icon={
              <hw-icon
                suppressHydrationWarning
                name="clipboard"
                variant="filled"
                size="16"
              ></hw-icon>
            }
            label="Active Job"
            value={activeJobCount}
          />
          <StatTile
            icon={
              <hw-icon
                suppressHydrationWarning
                name="inbox"
                variant="filled"
                size="16"
              ></hw-icon>
            }
            label="Service Request"
            value={serviceRequestCount}
          />
          <StatTile
            icon={
              <hw-icon
                suppressHydrationWarning
                name="target-arrow"
                variant="filled"
                size="16"
              ></hw-icon>
            }
            label="Total Job Done"
            value={totalJobDone}
          />
        </div>
      </section>

      {/* Quick Action */}
      <section className="hw-section">
        <h2 className="hw-section__title">Quick Action</h2>
        <div className="hw-quick-grid">
          {/* Figma: address-card + star — hollow, primary black */}
          <QuickActionTile
            icon={
              <hw-icon
                suppressHydrationWarning
                name="address-card"
                variant="hollow"
                size="16"
              ></hw-icon>
            }
            label="My Services"
            href="/vendor/services"
          />
          <QuickActionTile
            icon={
              <hw-icon
                suppressHydrationWarning
                name="star"
                variant="hollow"
                size="16"
              ></hw-icon>
            }
            label="My Reviews"
            href="/vendor/reviews"
          />
        </div>
      </section>

      {/* My Orders */}
      <section className="hw-section">
        <h2 className="hw-section__title">My Orders</h2>

        {/* Same .hw-segment control as login/signup RoleToggle */}
        <div className="hw-segment" role="tablist" aria-label="Order type">
          <button
            type="button"
            role="tab"
            aria-selected={ordersTab === "active"}
            className={
              "hw-segment__option" + (ordersTab === "active" ? " is-active" : "")
            }
            onClick={() => setOrdersTab("active")}
          >
            Active Job
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={ordersTab === "request"}
            className={
              "hw-segment__option" +
              (ordersTab === "request" ? " is-active" : "")
            }
            onClick={() => setOrdersTab("request")}
          >
            Service Request
          </button>
        </div>

        <div className="hw-orders-sort">
          <span className="hw-orders-sort__label">Sort by</span>
          <SortSelect
            value={sortBy}
            options={[
              { value: "recent", label: "Recent" },
              { value: "oldest", label: "Oldest" },
            ]}
            onChange={setSortBy}
          />
        </div>

        <div className="hw-orders-list">
          {ordersWithCustomer.length === 0 ? (
            <p className="hw-orders-empty">No orders in this list yet.</p>
          ) : (
            ordersWithCustomer.map(({ job, customer }) => (
              <JobCard key={job.id} job={job} customer={customer}>
                {ordersTab === "active" ? (
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
                    <Link href={`/vendor/orders/${job.id}`} className="hw-jobcard__btn hw-jobcard__btn--complete">
                      Review Request
                    </Link>
                  </div>
                )}
              </JobCard>
            ))
          )}
        </div>

        {/* Rendered as a Link styled as a block secondary button (Button only emits a
            <button>); matches the <a class="hw-button"> precedent in the static pages. */}
        <Link
          href="/vendor/orders"
          className="hw-button hw-button--secondary hw-button--block hw-orders-viewall"
        >
          <span className="hw-button__label">View All</span>
        </Link>
      </section>

      {panel?.kind === "complete" && panelJob ? (
        <ConfirmPanel
          art="/assets/illustration/illustration-24.svg"
          title="Confirm Job Completion"
          text="Let the customer know this job is done? They'll confirm before the escrow payment is released to you."
          onClose={() => setPanel(null)}
          onConfirm={async () => {
            if (!busy && (await run(() => markCompleted({ id: panelJob.id })))) setPanel(null);
          }}
        />
      ) : null}
      {panel?.kind === "cancel" && panelJob ? (
        <ConfirmPanel
          title="Confirm Job Cancellation"
          text="Cancel this job? The customer gets a full refund of anything they paid into escrow."
          onClose={() => setPanel(null)}
          onConfirm={async () => {
            if (!busy && (await run(() => cancelJob({ id: panelJob.id })))) setPanel(null);
          }}
        />
      ) : null}
      <ActionError error={error} onDismiss={clearError} />
    </div>
  );
}
