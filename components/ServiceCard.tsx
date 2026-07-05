"use client";

import { useState, type ReactNode } from "react";
import type { Service } from "@/types";
import { StarRating } from "@/components/StarRating";
import { formatNaira } from "@/lib/time";

/**
 * ServiceCard — service photo, then title + favourite heart on one row, price pill,
 * rating, description, and a configurable `action` slot (customer passes "Book
 * Service"). Borderless. Reusable: Home, Search, Vendor screens.
 * The favourite heart is a LOCAL UI toggle only — no persistence (no Favorite model).
 * Styling: .hw-svc*.
 */
export function ServiceCard({ service, action }: { service: Service; action?: ReactNode }) {
  const [favorite, setFavorite] = useState(false);

  return (
    <article className="hw-svc">
      <div className="hw-svc__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={service.images[0]} alt={service.title} />
      </div>

      <div className="hw-svc__body">
        <div className="hw-svc__head">
          <h3 className="hw-svc__title">{service.title}</h3>
          <button
            type="button"
            className={"hw-svc__fav" + (favorite ? " is-active" : "")}
            aria-pressed={favorite}
            aria-label={favorite ? "Remove from saved" : "Save service"}
            onClick={() => setFavorite((f) => !f)}
          >
            <hw-icon suppressHydrationWarning name="heart" variant={favorite ? "filled" : "hollow"} size="18"></hw-icon>
          </button>
        </div>

        <span className="hw-svc__price">Starts @ {formatNaira(service.price)}/{service.priceUnit}</span>
        <StarRating value={service.ratingAverage} count={service.reviewCount} />
        <p className="hw-svc__desc">{service.description}</p>
      </div>

      {action ? <div className="hw-svc__action">{action}</div> : null}
    </article>
  );
}

export default ServiceCard;
