"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@/types";
import { initialsOf } from "@/components/Avatar";
import { LogoutButton } from "@/components/LogoutButton";

/**
 * Sidebar — role nav for the dashboard shell. On desktop it's a fixed rail (logo +
 * nav); below --hw-bp-l it becomes an off-canvas drawer (close button + user profile
 * + nav), driven by `open`/`onClose` from DashboardChrome. Active item via pathname.
 * Styling: sidebar.css (base) + dashboard.css (responsive drawer).
 */
// `mobileHidden` items are dropped from the mobile drawer (Messages becomes the
// envelope shortcut in the mobile location row instead).
type NavItem = { label: string; icon: string; href: string; mobileHidden?: boolean };

const CUSTOMER_NAV: NavItem[] = [
  { label: "Home", icon: "home", href: "/customer" },
  { label: "My Jobs", icon: "clipboard", href: "/customer/jobs" },
  { label: "Messages", icon: "comment-dots", href: "/customer/messages", mobileHidden: true },
  { label: "Help & Support", icon: "headphones", href: "/customer/support" },
];

const VENDOR_NAV: NavItem[] = [
  { label: "Home", icon: "home", href: "/vendor" },
  { label: "My Services", icon: "address-card", href: "/vendor/services" },
  { label: "My Orders", icon: "clipboard", href: "/vendor/orders" },
  { label: "Messages", icon: "comment-dots", href: "/vendor/messages", mobileHidden: true },
  { label: "My Reviews", icon: "star-half", href: "/vendor/reviews" },
  { label: "Analytics", icon: "chart-line", href: "/vendor/analytics" },
  { label: "Help & Support", icon: "headphones", href: "/vendor/support" },
];

export function Sidebar({
  role,
  user,
  open = false,
  onClose,
}: {
  role: "customer" | "vendor";
  user: User;
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const items = role === "customer" ? CUSTOMER_NAV : VENDOR_NAV;

  return (
    <aside className={"hw-sidebar" + (open ? " is-open" : "")}>
      {/* Drawer-only chrome (mobile): close + profile — matches the sidebar.css drawer
          component (.hw-sidebar__close / .hw-avatar / .hw-profile__*). Hidden on desktop. */}
      <div className="hw-sidebar__drawer-only">
        <button type="button" className="hw-sidebar__close" aria-label="Close menu" onClick={onClose}>
          {/* Thin line X (matches the sidebar.html drawer + Figma). */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="hw-sidebar__profile">
          <div className="hw-avatar">{initialsOf(user.fullName)}</div>
          <div className="hw-profile__row">
            <div className="hw-profile__info">
              <p className="hw-profile__name">{user.fullName}</p>
              <p className="hw-profile__email">{user.email}</p>
            </div>
            <button type="button" className="hw-profile__chevron" aria-label="View profile">
              <hw-icon suppressHydrationWarning name="angle-right" variant="hollow" size="20"></hw-icon>
            </button>
          </div>
          <hr className="hw-sidebar__divider" />
        </div>
      </div>

      {/* Desktop logo header. Hidden on mobile. */}
      <div className="hw-sidebar__header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hw-sidebar__logo" src="/assets/logo/wordmark-light.svg" alt="Handiwork" />
        <hr className="hw-sidebar__divider" />
      </div>

      <nav className="hw-sidebar__nav">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={onClose}
              className={
                "hw-nav-item" +
                (active ? " is-active" : "") +
                (it.mobileHidden ? " hw-nav-item--mobile-hidden" : "")
              }
              aria-current={active ? "page" : undefined}
            >
              <hw-icon suppressHydrationWarning name={it.icon} variant="filled" size="14"></hw-icon>
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hw-sidebar__footer">
        <LogoutButton onClick={onClose} />
      </div>
    </aside>
  );
}

export default Sidebar;
