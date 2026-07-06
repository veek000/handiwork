"use client";

import { useState } from "react";
import Link from "next/link";
import { useNotifications } from "@/hooks";
import { NotificationList } from "./NotificationList";

/**
 * NotificationPage — the full notification screen (mobile-first, per Figma): back +
 * breadcrumb + "Notification" heading + tabs/list + pagination. Rendered inside the
 * dashboard shell, so it inherits the header. Shared by customer + vendor routes;
 * `homeHref` is the role's dashboard root. Styling: .hw-notifpage*.
 *
 * Owns the read-state so it can render a "Mark all as read" beside the heading (the
 * list runs in controlled mode); the desktop dropdown keeps its own internal state.
 */
export function NotificationPage({ homeHref }: { homeHref: string }) {
  const [items, setItems] = useState(useNotifications());
  const hasUnread = items.some((n) => !n.read);

  return (
    <div className="hw-notifpage">
      {/* Fixed top: back + breadcrumb + heading (with Mark all as read) + tabs (from the list). */}
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
          <button
            type="button"
            className="hw-link hw-notifpage__mark"
            onClick={() => setItems((list) => list.map((n) => ({ ...n, read: true })))}
            disabled={!hasUnread}
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Tabs stay fixed (top of NotificationList); only the list scrolls. */}
      <NotificationList
        notifications={items}
        items={items}
        onMarkAllRead={() => setItems((list) => list.map((n) => ({ ...n, read: true })))}
      />

      {/* Fixed pager at the base. */}
      <div className="hw-notifpage__pager">
        <button type="button" className="hw-notifpage__pgbtn" aria-label="Previous page">
          <hw-icon suppressHydrationWarning name="angle-left" variant="hollow" size="16"></hw-icon>
        </button>
        <span className="hw-notifpage__pginfo">Page 1 to 8</span>
        <button type="button" className="hw-notifpage__pgbtn" aria-label="Next page">
          <hw-icon suppressHydrationWarning name="angle-right" variant="hollow" size="16"></hw-icon>
        </button>
      </div>
    </div>
  );
}

export default NotificationPage;
