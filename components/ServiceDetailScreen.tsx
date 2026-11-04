"use client";

import { useState } from "react";
import Link from "next/link";
import type { Review, Service, VendorUser } from "@/types";
import { PageNav, type Crumb } from "@/components/PageNav";
import { ServiceGallery } from "@/components/ServiceGallery";
import { VendorAboutCard } from "@/components/VendorAboutCard";
import { Avatar } from "@/components/Avatar";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/Button";
import { ReviewSummary } from "@/components/ReviewSummary";
import { ReviewCard } from "@/components/ReviewCard";
import { ServiceCard } from "@/components/ServiceCard";
import { BookServicePanel } from "@/components/BookServicePanel";
import { formatNaira } from "@/lib/time";

/**
 * Customer Service Detail (Figma desktop 6619:3942, mobile 6619:19050) + Book Service
 * (6619:4273 / 4668, mobile 6619:19306 / 19630). Data is resolved by the server page
 * through hooks and passed in. Desktop: gallery + "About {vendor}" side by side, then
 * title/price, provider row, About Service, Book Service, Reviews, Recommended. Mobile:
 * one column with "About {vendor}" moved under Book Service.
 */
export function ServiceDetailScreen({
  service,
  vendor,
  vendorServices,
  reviews,
  recommended,
  query,
}: {
  service: Service;
  vendor: VendorUser;
  vendorServices: Service[];
  reviews: Review[];
  recommended: Service[];
  query: string;
}) {
  const [booking, setBooking] = useState(false);
  const searchHref = query ? `/customer/search?q=${encodeURIComponent(query)}` : "/customer";
  const crumbs: Crumb[] = [
    query ? { label: `Viewing results for “${query}”`, href: searchHref } : { label: "Home", href: "/customer" },
    { label: service.title },
  ];
  const profileHref = `/customer/vendors/${vendor.id}?from=${service.id}${query ? `&q=${encodeURIComponent(query)}` : ""}`;
  const vendorFirst = vendor.fullName.split(" ")[0];

  return (
    <div className="hw-detail">
      <PageNav backHref={searchHref} crumbs={crumbs} />

      <div className="hw-detail__hero">
        <ServiceGallery images={service.images} title={service.title} />
        <div className="hw-detail__aside hw-detail__aside--desktop">
          <VendorAboutCard vendor={vendor} profileHref={profileHref} />
        </div>
      </div>

      <section className="hw-detail__info" aria-labelledby="hw-detail-title">
        <div className="hw-detail__titlerow">
          <h1 id="hw-detail-title" className="hw-detail__title">{service.title}</h1>
          <span className="hw-svcrow__price">Starts @ {formatNaira(service.price)}/{service.priceUnit}</span>
        </div>

        <Link href={profileHref} className="hw-detail__provider">
          <Avatar name={vendor.fullName} src={vendor.avatarUrl} size={40} verified />
          <span className="hw-detail__providername">{vendorFirst}</span>
        </Link>

        <div className="hw-detail__about">
          <h2 className="hw-detail__subtitle">About Service</h2>
          <StarRating value={service.ratingAverage} count={service.reviewCount} />
          <p className="hw-detail__desc">{service.description}</p>
        </div>

        <Button variant="primary" block onClick={() => setBooking(true)} aria-haspopup="dialog">
          Book Service
        </Button>
      </section>

      <div className="hw-detail__aside hw-detail__aside--mobile">
        <VendorAboutCard vendor={vendor} profileHref={profileHref} />
      </div>

      <section className="hw-detail__reviews" aria-label="Reviews">
        <ReviewSummary reviews={reviews} />
        {reviews.length ? (
          <div className="hw-detail__reviewlist">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} vendor={{ name: vendor.fullName, avatarUrl: vendor.avatarUrl }} />
            ))}
          </div>
        ) : (
          <p className="hw-detail__desc">No reviews yet for this service.</p>
        )}
      </section>

      {recommended.length ? (
        <section className="hw-detail__recs" aria-labelledby="hw-recs-title">
          <h2 id="hw-recs-title" className="hw-detail__sectiontitle">Recommended for you</h2>
          <div className="hw-svc-grid hw-svc-grid--two">
            {recommended.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                action={
                  <Link
                    href={`/customer/services/${s.id}${query ? `?q=${encodeURIComponent(query)}` : ""}`}
                    className="hw-button hw-button--primary hw-button--block"
                  >
                    Book Service
                  </Link>
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {booking ? (
        <BookServicePanel
          vendorName={vendorFirst}
          serviceOptions={vendorServices.map((s) => s.title)}
          initialService={service.title}
          messagesHref="/customer/messages"
          homeHref="/customer"
          onClose={() => setBooking(false)}
        />
      ) : null}
    </div>
  );
}

export default ServiceDetailScreen;
