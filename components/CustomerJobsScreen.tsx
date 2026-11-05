"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import type { Job, Rating, Review, User } from "@/types";
import { live } from "@/lib/convexApi";
import { useRunner } from "@/lib/useRunner";
import { ActionError } from "@/components/ActionError";
import { PageNav } from "@/components/PageNav";
import { SegmentedControl } from "@/components/SegmentedControl";
import { SortSelect } from "@/components/SortSelect";
import { JobCard } from "@/components/JobCard";
import { ProviderResponse } from "@/components/ProviderResponse";
import { ReviewPanel } from "@/components/ReviewPanel";
import { ConfirmPanel } from "@/components/ConfirmPanel";

type Tab = "active" | "completed";
type Panel = { kind: "cancel" | "review" | "delete"; jobId: string } | null;

const ACTIVE: Job["status"][] = ["pending", "quoted", "in_progress", "marked_completed"];
const PAGE_SIZE = 4;

/**
 * Customer My Jobs (Figma desktop 6619:5727 → 6625, mobile 6619:20409 → 21014).
 * Active Job tab: Pending / Quoted / In Progress / Marked as Completed — View Chat +
 * Cancel Job (→ Confirm Job Cancellation). Completed Jobs tab: completed jobs get
 * "Add a Review" (→ Rate Your Experience → Thanks for the Feedback) or, once reviewed,
 * the review with Edit / Delete; cancelled + rejected jobs are listed there too, without
 * actions (the design doesn't place them; they shouldn't vanish). Sort Recent/Oldest,
 * 4 per page. Live data: cancel / review / delete call Convex and the list updates by
 * itself; a failure shows the error banner.
 */
export function CustomerJobsScreen({
  jobs,
  reviews: reviewList,
  vendors,
}: {
  jobs: Job[];
  reviews: Review[];
  vendors: User[];
}) {
  const reviews = useMemo<Record<string, Review>>(
    () => Object.fromEntries(reviewList.filter((r) => r.jobId).map((r) => [r.jobId!, r])),
    [reviewList],
  );
  const { run, busy, error, clearError } = useRunner();
  const cancelJob = useMutation(live.cancelJob);
  const saveReviewM = useMutation(live.saveReview);
  const deleteReview = useMutation(live.deleteReview);
  const [tab, setTab] = useState<Tab>("active");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState<Panel>(null);

  const vendorOf = (job: Job) => vendors.find((v) => v.id === job.vendorId);
  const list = useMemo(() => {
    const inTab = jobs.filter((j) => (tab === "active" ? ACTIVE.includes(j.status) : !ACTIVE.includes(j.status)));
    // Completed tab: finished jobs first, then cancelled / rejected; each by date.
    const rank = (j: Job) => (tab === "completed" && j.status !== "completed" ? 1 : 0);
    return [...inTab].sort(
      (a, b) => rank(a) - rank(b) || (sort === "recent" ? 1 : -1) * b.createdAt.localeCompare(a.createdAt),
    );
  }, [jobs, tab, sort]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const shown = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const switchTab = (t: Tab) => {
    setTab(t);
    setPage(1);
  };
  const panelJob = panel ? jobs.find((j) => j.id === panel.jobId) : undefined;

  function saveReview(job: Job, rating: Rating, text: string) {
    return run(() => saveReviewM({ jobId: job.id, rating, body: text }), "We couldn't save your review. Please try again.");
  }

  return (
    <div className="hw-jobs">
      <PageNav backHref="/customer" crumbs={[{ label: "Home", href: "/customer" }, { label: "My Jobs" }]} />
      <h1 className="hw-jobs__title">My Jobs</h1>

      <SegmentedControl<Tab>
        ariaLabel="My Jobs"
        value={tab}
        onChange={switchTab}
        options={[
          { value: "active", label: "Active Job", panelId: "hw-jobs-list" },
          { value: "completed", label: "Completed Jobs", panelId: "hw-jobs-list" },
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

      <div id="hw-jobs-list" role="tabpanel" className="hw-jobs__list">
        {shown.length ? (
          shown.map((job) => {
            const vendor = vendorOf(job);
            const review = reviews[job.id];
            const party = { label: "Requesting from", name: vendor?.fullName ?? "—" };
            return (
              <JobCard key={job.id} job={job} party={party} compact>
                {ACTIVE.includes(job.status) ? (
                  <div className="hw-jobcard__actions">
                    <Link href={`/customer/messages?job=${job.id}`} className="hw-jobcard__btn hw-jobcard__btn--complete">
                      View Chat
                    </Link>
                    <button
                      type="button"
                      className="hw-jobcard__btn hw-jobcard__btn--cancel"
                      onClick={() => setPanel({ kind: "cancel", jobId: job.id })}
                    >
                      Cancel Job
                    </button>
                  </div>
                ) : job.status === "completed" && review ? (
                  <>
                    <div className="hw-jobreview">
                      <span className="hw-jobreview__score">{review.rating.toFixed(1)}</span>
                      <span className="hw-jobreview__stars" aria-label={`${review.rating} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <hw-icon key={n} suppressHydrationWarning name="star" variant={n <= review.rating ? "filled" : "hollow"} size="20"></hw-icon>
                        ))}
                      </span>
                      {review.body ? <p className="hw-review__body">{review.body}</p> : null}
                      {review.response && vendor ? (
                        <ProviderResponse response={review.response} vendor={{ name: vendor.fullName, avatarUrl: vendor.avatarUrl }} />
                      ) : null}
                    </div>
                    <div className="hw-jobcard__actions">
                      <button type="button" className="hw-jobcard__btn hw-jobcard__btn--complete" onClick={() => setPanel({ kind: "review", jobId: job.id })}>
                        Edit Review
                      </button>
                      <button type="button" className="hw-jobcard__btn hw-jobcard__btn--cancel" onClick={() => setPanel({ kind: "delete", jobId: job.id })}>
                        Delete Review
                      </button>
                    </div>
                  </>
                ) : job.status === "completed" ? (
                  <div className="hw-jobcard__actions hw-jobcard__actions--one">
                    <button type="button" className="hw-jobcard__btn hw-jobcard__btn--complete" onClick={() => setPanel({ kind: "review", jobId: job.id })}>
                      Add a Review
                    </button>
                  </div>
                ) : (
                  <></>
                )}
              </JobCard>
            );
          })
        ) : (
          <p className="hw-searchpage__emptysub">
            {tab === "active" ? "No active jobs. Book a service to get started." : "No completed jobs yet."}
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

      {panel?.kind === "cancel" && panelJob ? (
        <ConfirmPanel
          title="Confirm Job Cancellation"
          text={
            panelJob.status === "in_progress"
              ? "Cancel this job? You've already paid, so you'll be refunded the quote amount; the 2% service fee is kept as the cancellation fee. This can't be undone."
              : "Cancel this job? Nothing has been paid yet, so there's no charge. This can't be undone."
          }
          onClose={() => setPanel(null)}
          onConfirm={async () => {
            if (busy) return;
            if (await run(() => cancelJob({ id: panelJob.id }), "We couldn't cancel the job. Please try again.")) setPanel(null);
          }}
        />
      ) : null}
      {panel?.kind === "delete" && panelJob ? (
        <ConfirmPanel
          title="Delete Review"
          text="Are you sure you want to delete your review? This action cannot be undone."
          confirmLabel="Delete"
          onClose={() => setPanel(null)}
          onConfirm={async () => {
            if (busy) return;
            if (await run(() => deleteReview({ jobId: panelJob.id }))) setPanel(null);
          }}
        />
      ) : null}
      {panel?.kind === "review" && panelJob ? (
        <ReviewPanel
          initialRating={reviews[panelJob.id]?.rating}
          initialText={reviews[panelJob.id]?.body}
          onClose={() => setPanel(null)}
          onSubmit={(rating, text) => saveReview(panelJob, rating, text)}
        />
      ) : null}
      <ActionError error={error} onDismiss={clearError} />
    </div>
  );
}

export default CustomerJobsScreen;
