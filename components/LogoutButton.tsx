"use client";

import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

/**
 * LogoutButton — the sidebar "Log Out" action. Calls Convex Auth signOut() (clears the
 * localStorage session that would otherwise auto-redirect back into the dashboard via
 * useRoleRedirect), then sends the user to the landing page. Kept as its own client
 * component so Sidebar stays provider-agnostic — only this button needs the
 * AuthConvexProvider ancestor (the dashboard layouts supply it). Renders as a
 * `.hw-nav-item` button, visually identical to the other nav links.
 */
export function LogoutButton({ onClick }: { onClick?: () => void }) {
  const router = useRouter();
  const { signOut } = useAuthActions();

  async function handleLogout() {
    onClick?.(); // close the mobile drawer if open
    try {
      await signOut();
    } catch {
      /* best-effort — navigate away regardless */
    }
    router.replace("/");
  }

  return (
    <button type="button" className="hw-nav-item hw-nav-item--logout" onClick={handleLogout}>
      <hw-icon suppressHydrationWarning name="arrow-right-from-bracket" variant="filled" size="14"></hw-icon>
      <span>Log Out</span>
    </button>
  );
}

export default LogoutButton;
