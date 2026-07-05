import type { ReactNode } from "react";
import { customers, vendors } from "@/mocks/users";
import { notifications } from "@/mocks/notifications";
import { conversations } from "@/mocks/conversations";
import { DashboardChrome } from "@/components/DashboardChrome";

// Unread messages count for the mobile location-row envelope badge.
const MESSAGES_COUNT = conversations.reduce((n, c) => n + c.unreadCount, 0);

/**
 * DashboardShell — shared dashboard chrome used by the (customer) and (vendor) route
 * groups. Server component: it selects the signed-in placeholder user for the role
 * (no auth yet — customer → Jane Doe, vendor → Veek) and the mock notifications, then
 * hands them to the client DashboardChrome (which owns the drawer + header + main).
 */
const SIGNED_IN = {
  customer: customers.find((c) => c.id === "usr_jane")!,
  vendor: vendors.find((v) => v.id === "usr_veek")!,
};

export function DashboardShell({
  role,
  children,
}: {
  role: "customer" | "vendor";
  children: ReactNode;
}) {
  return (
    <DashboardChrome
      role={role}
      user={SIGNED_IN[role]}
      notifications={notifications}
      messagesCount={MESSAGES_COUNT}
    >
      {children}
    </DashboardChrome>
  );
}

export default DashboardShell;
