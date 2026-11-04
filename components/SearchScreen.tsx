"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useServices } from "@/hooks";
import { PageNav } from "@/components/PageNav";
import { SearchField } from "@/components/SearchField";
import { ServiceListItem } from "@/components/ServiceListItem";
import { FilterPanel } from "@/components/FilterPanel";
import { POPULAR_SEARCHES } from "@/data/popularSearches";
import { EMPTY_FILTERS, activeFilterCount, searchServices, type SearchFilters } from "@/lib/search";

/**
 * Customer Search & Discovery (Figma desktop 6619:3356 / 3488 / 3694, mobile 6619:18702 /
 * 18764 / 18887). The query lives in the URL (`?q=`) so results are linkable and Back
 * works; filters are local state. Empty query → Popular Searches; otherwise results.
 * The page reads `?q=` server-side and passes it in as `query`.
 */
export function SearchScreen({ query }: { query: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const services = useServices();
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const results = useMemo(() => searchServices(services, query, filters), [services, query, filters]);
  const go = (q: string) => router.push(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname);
  const filterCount = activeFilterCount(filters);

  return (
    <div className="hw-searchpage">
      <div className="hw-searchpage__top">
        <PageNav backHref="/customer" crumbs={[{ label: "Home", href: "/customer" }, { label: "Search" }]} />
        {/* keyed by query so the field resets when the URL changes (chip click, Back) */}
        <SearchField key={query} initialValue={query} onSubmit={go} onClear={() => go("")} />
        {query ? (
          <p className="hw-searchpage__count" role="status">
            {results.length} {results.length === 1 ? "result" : "results"} for <b>&ldquo;{query}&rdquo;</b> in your location
          </p>
        ) : null}
      </div>

      {!query ? (
        <section className="hw-searchpage__section" aria-labelledby="hw-popular-title">
          <h1 id="hw-popular-title" className="hw-searchpage__title">Popular Searches</h1>
          <ul className="hw-chips">
            {POPULAR_SEARCHES.map((term) => (
              <li key={term}>
                <Link className="hw-chip" href={`${pathname}?q=${encodeURIComponent(term)}`}>
                  {term}
                  <hw-icon suppressHydrationWarning name="arrow-up-right" variant="hollow" size="14"></hw-icon>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="hw-searchpage__section" aria-labelledby="hw-results-title">
          <div className="hw-searchpage__titlerow">
            <h1 id="hw-results-title" className="hw-searchpage__title">Search Result</h1>
            <button
              type="button"
              className={"hw-filterbtn" + (filterCount ? " is-active" : "")}
              aria-haspopup="dialog"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen(true)}
            >
              Filter By{filterCount ? ` (${filterCount})` : ""}
              <hw-icon suppressHydrationWarning name="angle-down" variant="hollow" size="16"></hw-icon>
            </button>
          </div>

          {results.length ? (
            <div className="hw-searchpage__grid">
              {results.map((s) => (
                <ServiceListItem key={s.id} service={s} href={`/customer/services/${s.id}?q=${encodeURIComponent(query)}`} />
              ))}
            </div>
          ) : (
            <div className="hw-searchpage__empty">
              <p className="hw-searchpage__emptytitle">No services found</p>
              <p className="hw-searchpage__emptysub">
                Try a different keyword{filterCount ? " or reset your filters" : ""}.
              </p>
              {filterCount ? (
                <button type="button" className="hw-link" onClick={() => setFilters(EMPTY_FILTERS)}>
                  Reset filters
                </button>
              ) : null}
            </div>
          )}
        </section>
      )}

      {filterOpen ? (
        <FilterPanel
          value={filters}
          onClose={() => setFilterOpen(false)}
          onApply={(next) => {
            setFilters(next);
            setFilterOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

export default SearchScreen;
