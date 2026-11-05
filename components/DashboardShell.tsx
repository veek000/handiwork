import type { ReactNode } from "react";
import { DashboardChrome } from "@/components/DashboardChrome";

/**
 * DashboardShell — shared dashboard chrome used by the (customer) and (vendor) route
 * groups. The signed-in account, notifications and unread-message count are live
 * Convex data, read inside the client DashboardChrome (which also guards the route).
 */
export function DashboardShell({ role, children }: { role: "customer" | "vendor"; children: ReactNode }) {
  return <DashboardChrome role={role}>{children}</DashboardChrome>;
}

export default DashboardShell;
