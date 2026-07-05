import type { Notification } from "@/types";
import { notifications } from "@/mocks/notifications";

export function useNotifications(): Notification[] {
  return notifications;
}
