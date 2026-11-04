import type { ReactNode } from "react";
import type { Job, User } from "@/types";

export const JOB_STATUS_LABEL: Record<Job["status"], string> = {
  pending: "Pending",
  quoted: "Quoted",
  in_progress: "In Progress",
  marked_completed: "Marked as Completed",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

/**
 * JobCard — a job row with title, the other party, and a status badge.
 *  - Vendor My Orders (Figma 300:7832 / 300:34759): pass `customer` → "Requested by:",
 *    default actions Mark as Completed + Cancel Job.
 *  - Customer My Jobs (Figma 6619:5727 / 6619:20409): pass `party` ("Requesting from")
 *    and the role's actions/review block as `children`; `compact` uses the My Jobs
 *    layout (8px head, divider, 8px action strip).
 * Styling: .hw-jobcard*.
 */
export function JobCard({
  job,
  customer,
  party,
  compact = false,
  stamp,
  children,
}: {
  job: Job;
  customer?: User;
  party?: { label: string; name: string };
  compact?: boolean;
  /** right-aligned under the badge — vendor Service Request "2025-09-20 | 10:30 AM" */
  stamp?: string;
  children?: ReactNode;
}) {
  const who = party ?? (customer ? { label: "Requested by", name: customer.fullName } : null);

  return (
    <div className={"hw-jobcard" + (compact ? " hw-jobcard--compact" : "")}>
      <div className="hw-jobcard__head">
        <div className="hw-jobcard__meta">
          <h3 className="hw-jobcard__title">{job.title}</h3>
          {who ? (
            <p className="hw-jobcard__requested">
              {who.label}: <span>{who.name}</span>
            </p>
          ) : null}
        </div>
        <div className="hw-jobcard__side">
          <span className={`hw-jobcard__badge hw-jobcard__badge--${job.status}`}>
            {JOB_STATUS_LABEL[job.status]}
          </span>
          {stamp ? <span className="hw-jobcard__stamp">{stamp}</span> : null}
        </div>
      </div>

      {children ?? (
        <div className="hw-jobcard__actions">
          <button type="button" className="hw-jobcard__btn hw-jobcard__btn--complete">
            Mark as Completed
          </button>
          <button type="button" className="hw-jobcard__btn hw-jobcard__btn--cancel">
            Cancel Job
          </button>
        </div>
      )}
    </div>
  );
}

export default JobCard;
