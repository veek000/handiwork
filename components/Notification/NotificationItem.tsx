import Link from "next/link";
import type { Notification, NotificationType } from "@/types";
import { formatRelativeTime } from "@/lib/time";

// Map each notification type to a verified hw-icon (matches the Figma icon set).
const TYPE_ICON: Record<NotificationType, string> = {
  job_inquiry: "rocket",
  payment_received: "money",
  job_cancelled: "circle-x",
  new_review: "star",
  quote_received: "receipt",
  payment_released: "wallet",
  job_update: "clipboard",
};

/**
 * NotificationItem — one row in the notification list: type icon + title + body +
 * relative time. Unread rows get a tinted background. With `href` (the job's chat) the
 * row is a link. Styling: .hw-notif*.
 */
export function NotificationItem({ notification, href }: { notification: Notification; href?: string }) {
  const body = (
    <>
      <span className="hw-notif__icon">
        <hw-icon suppressHydrationWarning name={TYPE_ICON[notification.type]} variant="filled" size="20"></hw-icon>
      </span>
      <div className="hw-notif__body">
        <p className="hw-notif__title">{notification.title}</p>
        <p className="hw-notif__text">{notification.body}</p>
        <span className="hw-notif__time">{formatRelativeTime(notification.createdAt)}</span>
      </div>
    </>
  );
  return (
    <li className={"hw-notif" + (notification.read ? "" : " is-unread")}>
      {href ? <Link href={href} className="hw-notif__link">{body}</Link> : body}
    </li>
  );
}

export default NotificationItem;
