"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { useNotifications } from "@/hooks";
import { live } from "@/lib/convexApi";
import { LoadingState } from "@/components/LoadingState";
import { NotificationList } from "./NotificationList";

const PAGE_SIZE = 10;

/**
 * NotificationPage — the full notification screen (mobile-first, per Figma): back +
 * breadcrumb + "Notification" heading with Mark all as read + tabs/list + pager
 * (10 per page, shown when there is more than one page). Rendered inside the
 * dashboard shell. Styling: .hw-notifpage*.
 */
export function NotificationPage({ role }: { role: "customer" | "vendor" }) {
  const homeHref = `/${role}`;
  const notifications = useNotifications();
  const markAll = useMutation(live.markAllNotificationsRead);
  const [page, setPage] = useState(1);

  if (notifications === undefined) return <LoadingState />;
  const items = notifications ?? [];
  const hasUnread = items.some((n) => !n.read);
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(page, pages);

  return (
    <div className="hw-notifpage">
      <div className="hw-notifpage__head">
        <Link href={homeHref} className="hw-link hw-notifpage__back">
          <hw-icon suppressHydrationWarning name="angle-left" variant="hollow" size="16"></hw-icon>
          Back
        </Link>

        <nav className="hw-notifpage__crumbs" aria-label="Breadcrumb">
          <Link href={homeHref} className="hw-notifpage__crumb">Home</Link>
          <span aria-hidden="true">›</span>
          <span className="hw-notifpage__crumb is-current">Notification</span>
        </nav>

        <div className="hw-notifpage__titlerow">
          <h1 className="hw-notifpage__title">Notification</h1>
          <button type="button" className="hw-link hw-notifpage__mark" onClick={() => markAll({})} disabled={!hasUnread}>
            Mark all as read
          </button>
        </div>
      </div>

      <NotificationList
        notifications={items}
        role={role}
        pageItems={(list) => list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)}
      />

      {pages > 1 ? (
        <nav className="hw-notifpage__pager" aria-label="Pagination">
          <button type="button" className="hw-notifpage__pgbtn" aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)}>
            <hw-icon suppressHydrationWarning name="angle-left" variant="hollow" size="16"></hw-icon>
          </button>
          <span className="hw-notifpage__pginfo">Page {current} of {pages}</span>
          <button type="button" className="hw-notifpage__pgbtn" aria-label="Next page" disabled={current === pages} onClick={() => setPage(current + 1)}>
            <hw-icon suppressHydrationWarning name="angle-right" variant="hollow" size="16"></hw-icon>
          </button>
        </nav>
      ) : null}
    </div>
  );
}

export default NotificationPage;
