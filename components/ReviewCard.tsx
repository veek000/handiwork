import type { ReactNode } from "react";
import type { Review } from "@/types";
import { Avatar } from "@/components/Avatar";
import { StarRating } from "@/components/StarRating";
import { ProviderResponse } from "@/components/ProviderResponse";

/**
 * ReviewCard — one customer review (Figma 6619:3942 review cards / mobile 6619:19050):
 * reviewer avatar, name, location, star rating and text; if the vendor replied, the
 * collapsible ProviderResponse row. Vendor My Reviews (Figma 6619:31115) labels it
 * "Your Response", opens it by default and passes `actions` (Edit / Delete or Reply).
 * Styling: .hw-review*.
 */
export function ReviewCard({
  review,
  vendor,
  responseLabel = "Service Provider Response",
  responseOpen = false,
  actions,
}: {
  review: Review;
  vendor: { name: string; avatarUrl?: string };
  responseLabel?: string;
  responseOpen?: boolean;
  actions?: ReactNode;
}) {
  return (
    <article className="hw-review">
      <div className="hw-review__who">
        <Avatar name={review.authorName} src={review.authorAvatarUrl} size={40} />
        <div className="hw-review__id">
          <span className="hw-review__name">{review.authorName}</span>
          <span className="hw-review__loc">
            <hw-icon suppressHydrationWarning name="map-pin" variant="hollow" size="12"></hw-icon>
            {review.authorLocation}
          </span>
        </div>
      </div>
      <StarRating value={review.rating} />
      <p className="hw-review__body">{review.body}</p>
      {review.response ? (
        <ProviderResponse response={review.response} vendor={vendor} label={responseLabel} defaultOpen={responseOpen} />
      ) : null}
      {actions ? <div className={"hw-review__actions" + (review.response ? "" : " hw-review__actions--ruled")}>{actions}</div> : null}
    </article>
  );
}

export default ReviewCard;
