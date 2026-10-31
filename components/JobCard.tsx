import type { Job, User } from "@/types";

/**
 * JobCard — vendor My Orders row (Figma desktop 300:7832 / mobile 300:34759).
 * Title, "Requested by: {customer}", status badge, Mark as Completed + Cancel Job.
 * Description / schedule intentionally omitted — not in the Figma home cards.
 * Styling: .hw-jobcard*.
 */
export function JobCard({
  job,
  customer,
}: {
  job: Job;
  customer: User;
}) {
  const STATUS_LABEL: Record<Job["status"], string> = {
    pending: "Pending",
    quoted: "Quoted",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    rejected: "Rejected",
  };

  return (
    <div className="hw-jobcard">
      <div className="hw-jobcard__head">
        <div className="hw-jobcard__meta">
          <h3 className="hw-jobcard__title">{job.title}</h3>
          <p className="hw-jobcard__requested">
            Requested by: <span>{customer.fullName}</span>
          </p>
        </div>
        <span className={`hw-jobcard__badge hw-jobcard__badge--${job.status}`}>
          {STATUS_LABEL[job.status]}
        </span>
      </div>

      <div className="hw-jobcard__actions">
        <button type="button" className="hw-jobcard__btn hw-jobcard__btn--complete">
          Mark as Completed
        </button>
        <button type="button" className="hw-jobcard__btn hw-jobcard__btn--cancel">
          Cancel Job
        </button>
      </div>
    </div>
  );
}

export default JobCard;
