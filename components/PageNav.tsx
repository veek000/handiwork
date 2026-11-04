import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string; // omit for the current page
}

/**
 * PageNav — the "‹ Back" link + breadcrumb trail that tops every inner dashboard screen
 * (Search, Service Detail, Vendor Profile, My Jobs, Job Details …), per Figma. The last
 * crumb is the current page. Styling: .hw-pagenav*.
 */
export function PageNav({ backHref, crumbs }: { backHref: string; crumbs: Crumb[] }) {
  return (
    <div className="hw-pagenav">
      <Link href={backHref} className="hw-pagenav__back">
        <hw-icon suppressHydrationWarning name="angle-left" variant="hollow" size="16"></hw-icon>
        Back
      </Link>
      <nav className="hw-pagenav__crumbs" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <span key={c.label} className="hw-pagenav__item">
            {i > 0 ? (
              <hw-icon suppressHydrationWarning name="angle-right" variant="hollow" size="12"></hw-icon>
            ) : null}
            {c.href ? (
              <Link href={c.href} className="hw-pagenav__crumb">{c.label}</Link>
            ) : (
              <span className="hw-pagenav__crumb" aria-current="page">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
}

export default PageNav;
