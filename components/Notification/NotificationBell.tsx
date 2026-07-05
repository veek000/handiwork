"use client";

import { useState, useRef, useEffect } from "react";
import type { Notification } from "@/types";
import { NotificationList } from "./NotificationList";

/**
 * NotificationBell — the header bell. On desktop it opens a dropdown "tooltip" (with
 * a pointer arrow); on mobile it's a link to the full-screen notification page (per
 * Figma). Shared by customer + vendor. `href` is that page's route. Styling: .hw-bell*,
 * .hw-notif-panel*.
 */
export function NotificationBell({
  notifications,
  href,
}: {
  notifications: Notification[];
  href: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="hw-bell" ref={ref}>
      {/* Desktop: dropdown trigger */}
      <button
        type="button"
        className="hw-bell__btn hw-bell__btn--desktop"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <hw-icon suppressHydrationWarning name="bell" variant="hollow" size="20"></hw-icon>
        {unread > 0 ? <span className="hw-bell__badge">{unread}</span> : null}
      </button>

      {/* Mobile: navigate to the full notification page */}
      <a className="hw-bell__btn hw-bell__btn--mobile" href={href} aria-label="Notifications">
        <hw-icon suppressHydrationWarning name="bell" variant="hollow" size="20"></hw-icon>
        {unread > 0 ? <span className="hw-bell__badge">{unread}</span> : null}
      </a>

      {open ? (
        <div className="hw-notif-panel" role="dialog" aria-label="Notifications">
          <NotificationList notifications={notifications} withHead />
        </div>
      ) : null}
    </div>
  );
}

export default NotificationBell;
