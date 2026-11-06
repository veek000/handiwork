"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import type { User } from "@/types";
import { Avatar } from "@/components/Avatar";

/**
 * ProfileMenu — the desktop header's user block (avatar, name, email, chevron) as a
 * menu button. Opens a floating panel with a pointer arrow up to the avatar (same
 * tooltip treatment as the notification panel): Settings, Feedback, Help & Support,
 * then Log Out. Keyboard: Enter/Space/↓ opens on the first item, ↑/↓/Home/End move,
 * Escape closes back to the button, Tab closes. Also closes on outside click and on
 * navigation. Mobile reaches the same pages from the drawer. Styling: .hw-pmenu*.
 */
export function ProfileMenu({ role, user, isAdmin = false }: { role: "customer" | "vendor"; user: User; isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();

  const items = [
    { label: "Settings", icon: "cog", href: `/${role}/settings` },
    { label: "Feedback", icon: "comment", href: `/${role}/feedback` },
    { label: "Help & Support", icon: "headphones", href: `/${role}/support` },
    ...(isAdmin ? [{ label: "Admin", icon: "shield-check", href: "/admin" }] : []),
  ];

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const menuItems = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  function openAt(index: 0 | -1) {
    setOpen(true);
    requestAnimationFrame(() => menuItems().at(index)?.focus());
  }

  function onButtonKey(e: KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); openAt(0); }
    if (e.key === "ArrowUp") { e.preventDefault(); openAt(-1); }
  }

  function onMenuKey(e: KeyboardEvent) {
    const list = menuItems();
    const i = list.indexOf(document.activeElement as HTMLElement);
    const move = (to: number) => { e.preventDefault(); list[(to + list.length) % list.length]?.focus(); };
    if (e.key === "ArrowDown") move(i + 1);
    else if (e.key === "ArrowUp") move(i - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(list.length - 1);
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); buttonRef.current?.focus(); }
    else if (e.key === "Tab") setOpen(false);
  }

  async function logOut() {
    setOpen(false);
    try {
      await signOut();
    } catch {
      /* best-effort — navigate away regardless */
    }
    router.replace("/");
  }

  return (
    <div className="hw-pmenu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="hw-dash-header__user"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? setOpen(false) : openAt(0))}
        onKeyDown={onButtonKey}
      >
        <Avatar name={user.fullName} src={user.avatarUrl} size={40} />
        <span className="hw-dash-header__user-info">
          <span className="hw-dash-header__user-name">{user.fullName}</span>
          <span className="hw-dash-header__user-email">{user.email}</span>
        </span>
        <span className={"hw-pmenu__chevron" + (open ? " is-open" : "")} aria-hidden="true">
          <hw-icon suppressHydrationWarning name="angle-down" variant="hollow" size="14"></hw-icon>
        </span>
      </button>

      {open ? (
        <div id={menuId} ref={menuRef} className="hw-pmenu__panel" role="menu" aria-label="Account" onKeyDown={onMenuKey}>
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              role="menuitem"
              tabIndex={-1}
              className={"hw-pmenu__item" + (pathname === it.href ? " is-current" : "")}
              aria-current={pathname === it.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <hw-icon suppressHydrationWarning name={it.icon} variant="hollow" size="16"></hw-icon>
              {it.label}
            </Link>
          ))}
          <hr className="hw-pmenu__divider" />
          <button type="button" role="menuitem" tabIndex={-1} className="hw-pmenu__item hw-pmenu__item--logout" onClick={logOut}>
            <hw-icon suppressHydrationWarning name="arrow-right-from-bracket" variant="hollow" size="16"></hw-icon>
            Log Out
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ProfileMenu;
