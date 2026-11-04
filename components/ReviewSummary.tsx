import type { Review } from "@/types";
import { StarRating } from "@/components/StarRating";

/**
 * ReviewSummary — review header + per-star breakdown (5→1 bars with counts, relative
 * to the review total). Two layouts from Figma:
 *  - "service" (Service Detail 6619:3942): "Reviews" title, "N reviews for this Service"
 *    with the average on the right, then bars.
 *  - "profile" (Vendor Profile 6619:5277): no title (the page renders it beside
 *    Filter By) — a large average with stars + "(N Reviews)", then bars.
 * Styling: .hw-revsum*.
 */
export function ReviewSummary({
  reviews,
  subject = "Service",
  variant = "service",
}: {
  reviews: Review[];
  subject?: string;
  variant?: "service" | "profile";
}) {
  const total = reviews.length;
  const average = total ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
  const counts = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));

  return (
    <div className={"hw-revsum hw-revsum--" + variant}>
      {variant === "service" ? (
        <div className="hw-revsum__head">
          <h2 className="hw-revsum__title">Reviews</h2>
          <div className="hw-revsum__meta">
            <span className="hw-revsum__count">
              {total} {total === 1 ? "review" : "reviews"} for this {subject}
            </span>
            {total ? <StarRating value={average} /> : null}
          </div>
        </div>
      ) : (
        <div className="hw-revsum__big">
          <StarRating value={average} count={total} />
        </div>
      )}
      <ul className="hw-revsum__bars" aria-label="Rating breakdown">
        {counts.map(({ star, count }) => (
          <li key={star} className="hw-revsum__row">
            <span className="hw-revsum__star">
              {star}
              <hw-icon suppressHydrationWarning name="star" variant="filled" size="12"></hw-icon>
            </span>
            <span className="hw-revsum__track" aria-hidden="true">
              <span className="hw-revsum__fill" style={{ width: total ? `${(count / total) * 100}%` : "0%" }} />
            </span>
            <span className="hw-revsum__num">
              ({count})<span className="hw-sr-only"> {star}-star {count === 1 ? "review" : "reviews"}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReviewSummary;
