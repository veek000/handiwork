import type { ReactNode } from "react";
import { DashboardShell } from "@/components/DashboardShell";

// (vendor) route group — its own layout renders the Vendor-role sidebar around every
// /vendor/* page.
export default function VendorLayout({ children }: { children: ReactNode }) {
  return <DashboardShell role="vendor">{children}</DashboardShell>;
}
