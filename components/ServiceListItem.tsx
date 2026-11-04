"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { Service } from "@/types";
import { StarRating } from "@/components/StarRating";
import { formatNaira } from "@/lib/time";

/**
 * ServiceListItem — the compact, bordered result row used on Search (Figma 6619:3488 /
 * mobile 6619:18764): 98px square photo, title + favourite heart, price pill, rating,
 * and a "View Details" button. Desktop: button sits bottom-right inside the row.
 * Mobile: the button drops to a full-width bar under the row.
 * Favourite is a local UI toggle only (no Favorite model yet).
 * Vendor My Services (Figma 6619:30286) passes `actions` (Edit / Delete): the heart and
 * View Details are dropped and the actions strip renders under the row on every size.
 * Styling: .hw-svcrow*.
 */
export function ServiceListItem({ service, href, actions }: { service: Service; href?: string; actions?: ReactNode }) {
  const [favorite, setFavorite] = useState(false);

  return (
    <article className="hw-svcrow">
      <div className="hw-svcrow__main">
        <div className="hw-svcrow__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={service.images[0]} alt="" />
        </div>
        <div className="hw-svcrow__body">
          <div className="hw-svcrow__head">
            <h3 className="hw-svcrow__title">{service.title}</h3>
            {actions ? null : <button
              type="button"
              className={"hw-svcrow__fav" + (favorite ? " is-active" : "")}
              aria-pressed={favorite}
              aria-label={favorite ? `Remove ${service.title} from saved` : `Save ${service.title}`}
              onClick={() => setFavorite((f) => !f)}
            >
              <hw-icon suppressHydrationWarning name="heart" variant={favorite ? "filled" : "hollow"} size="16"></hw-icon>
            </button>}
          </div>
          <div className="hw-svcrow__foot">
            <div className="hw-svcrow__meta">
              <span className="hw-svcrow__price">Starts @ {formatNaira(service.price)}/{service.priceUnit}</span>
              <StarRating value={service.ratingAverage} count={service.reviewCount} />
            </div>
            {href && !actions ? <Link href={href} className="hw-svcrow__cta hw-svcrow__cta--inline">View Details</Link> : null}
          </div>
        </div>
      </div>
      {actions ? (
        <div className="hw-svcrow__actions">{actions}</div>
      ) : href ? (
        <Link href={href} className="hw-svcrow__cta hw-svcrow__cta--block">View Details</Link>
      ) : null}
    </article>
  );
}

export default ServiceListItem;
