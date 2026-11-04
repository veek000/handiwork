"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { viewerRef } from "@/app/(auth)/useRoleRedirect";
import type { User, Notification } from "@/types";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { LocationTag } from "@/components/LocationTag";

/**
 * DashboardChrome — client wrapper that owns the mobile-drawer open state and lays out
 * the shell: Sidebar (rail on desktop / drawer on mobile) + a column of DashboardHeader
 * over the scrolling main. The hamburger in the header opens the drawer; the scrim,
 * close button, and nav-item clicks close it. Styling: .hw-dash*.
 *
 * It is also the dashboards' route guard: signed-out visitors go to /login, and a signed-in
 * account on the other role's dashboard goes to its own (OAuth accounts without a role
 * count as customers, as in useRoleRedirect). Nothing renders until that is settled. The
 * header / drawer show the real account's name, email, photo and state; the rest of the
 * dashboard data is still mock until it moves into Convex.
 *
 * Local only: NEXT_PUBLIC_DEV_SKIP_AUTH=1 skips the guard (ignored in production builds)
 * so screens can be checked without signing in.
 */
const SKIP_AUTH = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === "1";

type Viewer = {
  role?: "customer" | "vendor";
  fullName?: string;
  name?: string;
  email?: string;
  image?: string;
  state?: string;
  area?: string;
};
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
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  // undefined while loading, null when signed out, the account once signed in.
  const viewer = useQuery(viewerRef, SKIP_AUTH ? "skip" : {}) as Viewer | null | undefined;
  const viewerRole = viewer ? (viewer.role ?? "customer") : undefined;

  useEffect(() => {
    if (SKIP_AUTH || isLoading) return;
    if (!isAuthenticated || viewer === null) router.replace("/login");
    else if (viewerRole && viewerRole !== role) router.replace(`/${viewerRole}`);
  }, [isLoading, isAuthenticated, viewer, viewerRole, role, router]);

  // The notification page is a self-contained screen — no location/messages row.
  const pathname = usePathname();
  const showMobiLoc = !pathname?.endsWith("/notifications");

  if (!SKIP_AUTH && (!isAuthenticated || !viewer || viewerRole !== role)) {
    return (
      <div className="hw-dash-gate" role="status" aria-live="polite">
        <span className="hw-dash-gate__dot" aria-hidden="true" />
        <span className="hw-sr-only">Checking your session…</span>
      </div>
    );
  }

  // Real identity over the mock profile. The mock photo is dropped so a real account
  // never shows someone else's face (Avatar falls back to initials).
  if (viewer) {
    const place = [viewer.area, viewer.state].filter(Boolean).join(", ");
    user = {
      ...user,
      fullName: viewer.fullName || viewer.name || viewer.email || user.fullName,
      email: viewer.email ?? user.email,
      avatarUrl: viewer.image,
      location: place ? `${place}, Nigeria` : user.location,
    };
  }

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
