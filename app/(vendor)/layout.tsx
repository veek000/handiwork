import type { ReactNode } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { AuthConvexProvider } from "@/app/(auth)/AuthConvexProvider";

// (vendor) route group — its own layout renders the Vendor-role sidebar around every
// /vendor/* page. Wrapped in AuthConvexProvider so the sidebar Log Out can call Convex
// signOut() (the dashboards otherwise still read the mock user).
export default function VendorLayout({ children }: { children: ReactNode }) {
  return (
    <AuthConvexProvider>
      <DashboardShell role="vendor">{children}</DashboardShell>
    </AuthConvexProvider>
  );
}
