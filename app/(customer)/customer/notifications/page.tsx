import { NotificationPage } from "@/components/Notification/NotificationPage";

// Full notification screen (reached from the header bell on mobile). Desktop uses the
// bell dropdown, but this route also works if navigated to directly.
export default function CustomerNotifications() {
  return <NotificationPage homeHref="/customer" />;
}
