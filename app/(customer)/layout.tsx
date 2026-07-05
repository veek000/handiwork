import type { ReactNode } from "react";
import { DashboardShell } from "@/components/DashboardShell";

// (customer) route group — its own layout renders the Customer-role sidebar around
// every /customer/* page. The group is parenthesised so it adds no URL segment; the
// pages live under a /customer prefix to avoid colliding with the (vendor) group.
export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <DashboardShell role="customer">{children}</DashboardShell>;
}
