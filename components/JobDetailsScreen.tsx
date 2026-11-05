"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import type { Job, User } from "@/types";
import { live } from "@/lib/convexApi";
import { useRunner } from "@/lib/useRunner";
import { ActionError } from "@/components/ActionError";
import { PageNav } from "@/components/PageNav";
import { Avatar } from "@/components/Avatar";
import { ConfirmPanel } from "@/components/ConfirmPanel";
import { JOB_STATUS_LABEL } from "@/components/JobCard";
import { formatRelativeTime } from "@/lib/time";

/**
 * Vendor Job Details (Figma desktop 6619:31954, mobile 6619:43666): title, "Requested
 * {relative time}", the customer ("From") with Message, Send Quote + Reject Job, and the
 * job description. Send Quote / Message open the job's chat, where the quotation flow
 * lives. Reject Job confirms, then returns to My Orders. Figma shows the vendor's own
 * name + "Available" under "From" (copy-paste); the requesting customer is shown instead.
 */
export function JobDetailsScreen({ job, customer }: { job: Job; customer?: User }) {
  const router = useRouter();
  const status = job.status;
  const [confirm, setConfirm] = useState(false);
  const { run, busy, error, clearError } = useRunner();
  const reject = useMutation(live.rejectJob);
  const chatHref = `/vendor/messages?job=${job.id}`;
  const open = status === "pending" || status === "quoted";

  return (
    <div className="hw-jobs">
      <PageNav backHref="/vendor/orders" crumbs={[{ label: "Home", href: "/vendor" }, { label: "Job Details" }]} />

      <article className="hw-jobdetail">
        <header className="hw-jobdetail__head">
          <h1 className="hw-jobdetail__title">{job.title}</h1>
          <p className="hw-jobdetail__when">
            Requested {formatRelativeTime(job.createdAt)}
            {status !== "pending" ? <span className="hw-jobdetail__status"> · {JOB_STATUS_LABEL[status]}</span> : null}
          </p>
        </header>

        <section className="hw-jobdetail__from" aria-label="Requested by">
          <span className="hw-jobdetail__label">From</span>
          <div className="hw-jobdetail__who">
            <Avatar name={customer?.fullName ?? "Customer"} src={customer?.avatarUrl} size={40} />
            <span className="hw-jobdetail__name">{customer?.fullName ?? "Customer"}</span>
            <Link href={chatHref} className="hw-jobdetail__msg">Message</Link>
          </div>
          {open ? (
            <div className="hw-jobcard__actions">
              <Link href={chatHref} className="hw-jobdetail__quote">
                {status === "quoted" ? "View Quote" : "Send Quote"}
              </Link>
              <button type="button" className="hw-jobcard__btn hw-jobcard__btn--cancel" onClick={() => setConfirm(true)}>
                Reject Job
              </button>
            </div>
          ) : null}
        </section>

        <section className="hw-jobdetail__desc" aria-labelledby="hw-jobdesc-title">
          <h2 id="hw-jobdesc-title" className="hw-jobdetail__subtitle">Job Description</h2>
          <p className="hw-jobdetail__text">{job.description}</p>
        </section>
      </article>

      {confirm ? (
        <ConfirmPanel
          title="Reject Job"
          text={`Decline ${customer?.fullName.split(" ")[0] ?? "this customer"}'s request? They'll be notified so they can book someone else.`}
          confirmLabel="Reject"
          onClose={() => setConfirm(false)}
          onConfirm={async () => {
            if (busy) return;
            if (await run(() => reject({ id: job.id }))) {
              setConfirm(false);
              router.push("/vendor/orders");
            }
          }}
        />
      ) : null}
      <ActionError error={error} onDismiss={clearError} />
    </div>
  );
}

export default JobDetailsScreen;
