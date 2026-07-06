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

export function useRoleRedirect() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  // undefined while loading, null if unauthenticated, the user doc once signed in.
  const viewer = useQuery(viewerRef) as { role?: "customer" | "vendor" } | null | undefined;

  useEffect(() => {
    if (isAuthenticated && viewer) {
      // OAuth accounts have no role yet (no toggle in that flow) — default to customer.
      router.replace(viewer.role === "vendor" ? "/vendor" : "/customer");
    }
  }, [isAuthenticated, viewer, router]);
}
