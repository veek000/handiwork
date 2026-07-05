import type { ReactNode } from "react";
import { useCurrentUser, useNotifications, useConversations } from "@/hooks";
import { DashboardChrome } from "@/components/DashboardChrome";

/**
 * DashboardShell — shared dashboard chrome used by the (customer) and (vendor) route
 * groups. Server component: it pulls the signed-in user for the role, the notifications,
 * and the unread-messages count from the data-access layer (hooks/), then hands them to
 * the client DashboardChrome (which owns the drawer + header + main). No mocks/ import —
 * all data comes through hooks/ (see COMPONENT-BUILD-RULES.md).
 */
export function DashboardShell({
  role,
  children,
}: {
  role: "customer" | "vendor";
  children: ReactNode;
}) {
  const user = useCurrentUser(role);
  const notifications = useNotifications();
  // Unread messages count for the mobile location-row envelope badge.
  const messagesCount = useConversations().reduce((n, c) => n + c.unreadCount, 0);

  return (
    <DashboardChrome
      role={role}
      user={user}
      notifications={notifications}
      messagesCount={messagesCount}
    >
      {children}
    </DashboardChrome>
  );
}

export default DashboardShell;
