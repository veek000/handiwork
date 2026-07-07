import type { ReactNode } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { AuthConvexProvider } from "@/app/(auth)/AuthConvexProvider";

// (customer) route group — its own layout renders the Customer-role sidebar around
// every /customer/* page. The group is parenthesised so it adds no URL segment; the
// pages live under a /customer prefix to avoid colliding with the (vendor) group.
// Wrapped in AuthConvexProvider so the sidebar Log Out can call Convex signOut()
// (the dashboards otherwise still read the mock user — see COMPONENT-BUILD-RULES).
export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <AuthConvexProvider>
      <DashboardShell role="customer">{children}</DashboardShell>
    </AuthConvexProvider>
  );
}
