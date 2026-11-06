"use client";

// Shared post-auth routing for the (auth) screens. Once the user is authenticated
// (password login, OAuth return, or completed signup verification), route to their
// role's dashboard. Role comes from the authenticated account (users:viewer) — not
// the login RoleToggle — per the "role derived from the authenticated user" decision.
//
// Function reference is built by name (makeFunctionReference) so this stays build-safe
// without convex/_generated (which is gitignored / absent on Vercel CI).
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";

export const viewerRef = makeFunctionReference<"query">("users:viewer");

/** `enabled` = false holds the redirect (e.g. the reset page until the password is saved). */
export function useRoleRedirect(enabled = true) {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  // undefined while loading, null if unauthenticated, the user doc once signed in.
  const viewer = useQuery(viewerRef) as { role?: "customer" | "vendor"; isAdmin?: boolean } | null | undefined;

  useEffect(() => {
    if (enabled && isAuthenticated && viewer) {
      // Google / Facebook accounts arrive without a role: they choose it on /onboarding.
      // Staff land on /admin (their own dashboard is a click away in the profile menu).
      if (!viewer.role) router.replace("/onboarding");
      else if (viewer.isAdmin) router.replace("/admin");
      else router.replace(`/${viewer.role}`);
    }
  }, [enabled, isAuthenticated, viewer, router]);
}
