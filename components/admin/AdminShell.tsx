"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { adminApi } from "@/lib/convexApi";
import { ErrorState } from "@/components/ErrorState";

const NAV = [
  { href: "/admin", label: "Overview", icon: "chart-pie" },
  { href: "/admin/verifications", label: "Verifications", icon: "shield-check" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/jobs", label: "Jobs & Disputes", icon: "clipboard" },
  { href: "/admin/payments", label: "Payments", icon: "wallet" },
  { href: "/admin/services", label: "Services", icon: "address-card" },
  { href: "/admin/reviews", label: "Reviews", icon: "star" },
  { href: "/admin/feedback", label: "Feedback", icon: "comment" },
  { href: "/admin/audit", label: "Audit Log", icon: "list" },
];

/**
 * AdminShell — layout + access check for /admin. Only accounts with users.isAdmin get
 * in (granted from the CLI: `npx convex run admin:grantAdmin '{"email":"…"}'`); signed-out
 * visitors go to /login and everyone else sees "Not available". Desktop: a dark nav rail
 * like the dashboards; mobile: the nav scrolls sideways above the page. Every admin
 * query/mutation re-checks access on the server. Styling: .hw-admin*.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const admin = useQuery(adminApi.me, isAuthenticated ? {} : "skip");
  const { signOut } = useAuthActions();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);
  useEffect(() => setNavOpen(false), [pathname]);

  if (isLoading || !isAuthenticated || admin === undefined) {
    return (
      <div className="hw-dash-gate" role="status" aria-live="polite">
        <span className="hw-dash-gate__dot" aria-hidden="true" />
        <span className="hw-sr-only">Checking access…</span>
      </div>
    );
  }
  if (admin === null) {
    return (
      <main className="hw-errpage">
        <ErrorState eyebrow="403" title="Not available" text="This area is for Handiwork staff only.">
          <Link className="hw-button hw-button--primary" href="/">Go to Home</Link>
        </ErrorState>
      </main>
    );
  }

  const active = NAV.map((n) => n.href)
    .filter((h) => pathname === h || pathname.startsWith(h + "/"))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <div className="hw-admin">
      <aside className={"hw-admin__nav" + (navOpen ? " is-open" : "")} aria-label="Admin">
        <div className="hw-admin__brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo/wordmark-light.svg" alt="Handiwork" className="hw-admin__logo" />
          <span className="hw-admin__tag">Admin</span>
          <button type="button" className="hw-admin__menu" aria-expanded={navOpen} aria-controls="hw-admin-links" onClick={() => setNavOpen((o) => !o)}>
            <span className="hw-sr-only">Menu</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 8h18M3 16h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav id="hw-admin-links" className="hw-admin__links">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={"hw-admin__link" + (n.href === active ? " is-active" : "")}
              aria-current={n.href === active ? "page" : undefined}
            >
              <hw-icon suppressHydrationWarning name={n.icon} variant="filled" size="14"></hw-icon>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hw-admin__me">
          <span className="hw-admin__me-name">{admin.name}</span>
          <span className="hw-admin__me-email">{admin.email}</span>
          <button
            type="button"
            className="hw-admin__logout"
            onClick={async () => {
              try {
                await signOut();
              } finally {
                router.replace("/");
              }
            }}
          >
            Log Out
          </button>
        </div>
      </aside>
      <main className="hw-admin__main">{children}</main>
    </div>
  );
}

export default AdminShell;
