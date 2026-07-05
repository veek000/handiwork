"use client";

import type { User } from "@/types";
import type { Notification } from "@/types";
import { Avatar } from "@/components/Avatar";
import { LocationTag } from "@/components/LocationTag";
import { NotificationBell } from "@/components/Notification/NotificationBell";

/**
 * DashboardHeader — the shared top bar for every dashboard screen (both roles).
 * Desktop: location (left), bell + user (right). Mobile: hamburger + centred logo +
 * bell (the location moves to a row below the header — rendered by DashboardChrome —
 * and the user block lives in the drawer). Styling: .hw-dash-header*.
 */
export function DashboardHeader({
  user,
  notifications,
  notificationsHref,
  onMenu,
}: {
  user: User;
  notifications: Notification[];
  notificationsHref: string;
  onMenu: () => void;
}) {
  return (
    <header className="hw-dash-header">
      <button type="button" className="hw-dash-header__menu" aria-label="Open menu" onClick={onMenu}>
        {/* Two-line hamburger (matches the Figma mobile header). */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 9h18M3 15h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hw-dash-header__logo" src="/assets/logo/wordmark-dark.svg" alt="Handiwork" />

      <LocationTag user={user} className="hw-dash-header__location" />

      <div className="hw-dash-header__right">
        <NotificationBell notifications={notifications} href={notificationsHref} />

        <div className="hw-dash-header__user">
          <Avatar name={user.fullName} size={40} />
          <span className="hw-dash-header__user-info">
            <span className="hw-dash-header__user-name">{user.fullName}</span>
            <span className="hw-dash-header__user-email">{user.email}</span>
          </span>
          <hw-icon suppressHydrationWarning name="angle-down" variant="hollow" size="14"></hw-icon>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
