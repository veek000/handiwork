"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { User, Notification } from "@/types";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { LocationTag } from "@/components/LocationTag";

/**
 * DashboardChrome — client wrapper that owns the mobile-drawer open state and lays out
 * the shell: Sidebar (rail on desktop / drawer on mobile) + a column of DashboardHeader
 * over the scrolling main. The hamburger in the header opens the drawer; the scrim,
 * close button, and nav-item clicks close it. Styling: .hw-dash*.
 */
export function DashboardChrome({
  role,
  user,
  notifications,
  messagesCount,
  children,
}: {
  role: "customer" | "vendor";
  user: User;
  notifications: Notification[];
  messagesCount: number;
  children: ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);
  // The notification page is a self-contained screen — no location/messages row.
  const pathname = usePathname();
  const showMobiLoc = !pathname?.endsWith("/notifications");

  return (
    <div className="hw-dash">
      <Sidebar role={role} user={user} open={navOpen} onClose={() => setNavOpen(false)} />
      {navOpen ? <div className="hw-dash__scrim" onClick={() => setNavOpen(false)} /> : null}

      <div className="hw-dash__col">
        <DashboardHeader
          user={user}
          notifications={notifications}
          notificationsHref={`/${role}/notifications`}
          onMenu={() => setNavOpen(true)}
        />
        {/* Mobile-only row below the header: location + a messages (envelope) shortcut
            with an unread badge. Hidden on desktop and on the notification screen. */}
        {showMobiLoc ? (
          <div className="hw-dash-mobiloc">
            <LocationTag user={user} />
            <a className="hw-msgbtn" href={`/${role}/messages`} aria-label="Messages">
              <hw-icon suppressHydrationWarning name="envelope" variant="hollow" size="20"></hw-icon>
              {messagesCount > 0 ? <span className="hw-msgbtn__badge">{messagesCount}</span> : null}
            </a>
          </div>
        ) : null}
        <main className="hw-dash__main">{children}</main>
      </div>
    </div>
  );
}

export default DashboardChrome;
