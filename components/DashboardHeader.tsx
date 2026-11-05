"use client";

import type { User } from "@/types";
import type { Notification } from "@/types";
import { ProfileMenu } from "@/components/ProfileMenu";
import { LocationTag } from "@/components/LocationTag";
import { NotificationBell } from "@/components/Notification/NotificationBell";

/**
 * DashboardHeader — the shared top bar for every dashboard screen (both roles).
 * Desktop: location (left), bell + user (right). Mobile: hamburger + centred logo +
 * bell (the location moves to a row below the header — rendered by DashboardChrome —
 * and the user block lives in the drawer). The desktop user block is the ProfileMenu
 * (Settings / Feedback / Help & Support / Log Out). Styling: .hw-dash-header*.
 */
export function DashboardHeader({
  role,
  user,
  notifications,
  notificationsHref,
  onMenu,
}: {
  role: "customer" | "vendor";
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

        <ProfileMenu role={role} user={user} />
      </div>
    </header>
  );
}

export default DashboardHeader;
