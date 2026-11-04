"use client";

import { useMemo, useState } from "react";
import type { Review, Service, VendorUser } from "@/types";
import { PageNav, type Crumb } from "@/components/PageNav";
import { Avatar } from "@/components/Avatar";
import { StarRating } from "@/components/StarRating";
import { ShareButton } from "@/components/ShareButton";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ServiceListItem } from "@/components/ServiceListItem";
import { FilterPanel } from "@/components/FilterPanel";
import { ReviewSummary } from "@/components/ReviewSummary";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewFilterPanel, type ReviewStarOption } from "@/components/ReviewFilterPanel";
import { EMPTY_FILTERS, activeFilterCount, searchServices, type SearchFilters } from "@/lib/search";

type Tab = "services" | "reviews";

/**
 * Vendor Profile, as a customer sees it (Figma desktop 6619:5023 / 5277, mobile
 * 6619:19913 / 20080): verified avatar, name + Available, rating, bio, location,
 * Share Profile; Experience + Job Completed tiles; Services / Reviews tabs, each with
 * a Filter By. Data comes from the server page via hooks. `from` (the service the
 * customer came from) + `q` (their search) feed the breadcrumb and Back.
 */
export function VendorProfileScreen({
  vendor,
  services,
  reviews,
  from,
  query,
}: {
  vendor: VendorUser;
  services: Service[];
  reviews: Review[];
  from?: Service;
  query: string;
}) {
  const [tab, setTab] = useState<Tab>("services");
  const [svcFilters, setSvcFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [stars, setStars] = useState<ReviewStarOption>("");
  const [panel, setPanel] = useState<Tab | null>(null);

  const first = vendor.fullName.split(" ")[0];
  const qs = query ? `?q=${encodeURIComponent(query)}` : "";
  const fromHref = from ? `/customer/services/${from.id}${qs}` : "/customer";
  const crumbs: Crumb[] = [
    ...(query ? [{ label: `Viewing results for “${query}”`, href: `/customer/search${qs}` }] : []),
    ...(from ? [{ label: from.title, href: fromHref }] : [{ label: "Home", href: "/customer" }]),
    { label: "Profile View" },
  ];

  const shownServices = useMemo(() => searchServices(services, "", svcFilters), [services, svcFilters]);
  const shownReviews = useMemo(
    () => (stars ? reviews.filter((r) => r.rating === parseInt(stars, 10)) : reviews),
    [reviews, stars],
  );
  const svcCount = activeFilterCount(svcFilters);

  return (
    <div className="hw-vprofile">
      <PageNav backHref={fromHref} crumbs={crumbs} />

      {/* Grid: mobile stacks who → about → Share; desktop puts Share top-right of "who". */}
      <header className="hw-vprofile__head">
        <div className="hw-vprofile__who">
          <Avatar name={vendor.fullName} src={vendor.avatarUrl} size={80} verified />
          <div className="hw-vprofile__id">
            <div className="hw-vprofile__namerow">
              <h1 className="hw-vprofile__name">{first}</h1>
              {vendor.availability === "available" ? <span className="hw-badge">Available</span> : null}
            </div>
            <StarRating value={vendor.ratingAverage} count={vendor.reviewCount} />
          </div>
        </div>
        <div className="hw-vprofile__about">
          <p className="hw-vprofile__bio">{vendor.bio}</p>
          <span className="hw-about__loc">
            <hw-icon suppressHydrationWarning name="map-pin" variant="hollow" size="14"></hw-icon>
            {vendor.location}
          </span>
        </div>
        <ShareButton title={`${vendor.fullName} on Handiwork`} className="hw-vprofile__share" />
      </header>

      <div className="hw-vprofile__stats">
        <div className="hw-pstat">
          <hw-icon suppressHydrationWarning name="alarm-clock" variant="filled" size="32"></hw-icon>
          <span className="hw-pstat__label">Experience</span>
          <span className="hw-pstat__value">{vendor.yearsOfExperience} {vendor.yearsOfExperience === 1 ? "Year" : "Years"}</span>
        </div>
        <div className="hw-pstat">
          <hw-icon suppressHydrationWarning name="target-arrow" variant="filled" size="32"></hw-icon>
          <span className="hw-pstat__label">Job Completed</span>
          <span className="hw-pstat__value">{vendor.jobsCompleted}</span>
        </div>
      </div>

      <SegmentedControl<Tab>
        ariaLabel={`${first}'s profile`}
        value={tab}
        onChange={setTab}
        options={[
          { value: "services", label: "Services", panelId: "hw-vprofile-services" },
          { value: "reviews", label: "Reviews", panelId: "hw-vprofile-reviews" },
        ]}
      />

      {tab === "services" ? (
        <section id="hw-vprofile-services" role="tabpanel" className="hw-vprofile__panel" aria-label="Services">
          <div className="hw-searchpage__titlerow">
            <h2 className="hw-searchpage__title">Services</h2>
            <button
              type="button"
              className={"hw-filterbtn" + (svcCount ? " is-active" : "")}
              aria-haspopup="dialog"
              onClick={() => setPanel("services")}
            >
              Filter By{svcCount ? ` (${svcCount})` : ""}
              <hw-icon suppressHydrationWarning name="angle-down" variant="hollow" size="16"></hw-icon>
            </button>
          </div>
          {shownServices.length ? (
            <div className="hw-searchpage__grid">
              {shownServices.map((s) => (
                <ServiceListItem key={s.id} service={s} href={`/customer/services/${s.id}${qs}`} />
              ))}
            </div>
          ) : (
            <p className="hw-searchpage__emptysub">No services match these filters.</p>
          )}
        </section>
      ) : (
        <section id="hw-vprofile-reviews" role="tabpanel" className="hw-vprofile__panel" aria-label="Reviews">
          <div className="hw-searchpage__titlerow">
            <h2 className="hw-searchpage__title">Reviews</h2>
            <button
              type="button"
              className={"hw-filterbtn" + (stars ? " is-active" : "")}
              aria-haspopup="dialog"
              onClick={() => setPanel("reviews")}
            >
              Filter By{stars ? " (1)" : ""}
              <hw-icon suppressHydrationWarning name="angle-down" variant="hollow" size="16"></hw-icon>
            </button>
          </div>
          <ReviewSummary reviews={reviews} variant="profile" />
          {shownReviews.length ? (
            <div className="hw-detail__reviewlist">
              {shownReviews.map((r) => (
                <ReviewCard key={r.id} review={r} vendor={{ name: vendor.fullName, avatarUrl: vendor.avatarUrl }} />
              ))}
            </div>
          ) : (
            <p className="hw-searchpage__emptysub">{reviews.length ? "No reviews match this filter." : `${first} has no reviews yet.`}</p>
          )}
        </section>
      )}

      {panel === "services" ? (
        <FilterPanel
          value={svcFilters}
          onClose={() => setPanel(null)}
          onApply={(next) => {
            setSvcFilters(next);
            setPanel(null);
          }}
        />
      ) : null}
      {panel === "reviews" ? (
        <ReviewFilterPanel
          value={stars}
          onClose={() => setPanel(null)}
          onApply={(next) => {
            setStars(next);
            setPanel(null);
          }}
        />
      ) : null}
    </div>
  );
}

export default VendorProfileScreen;
