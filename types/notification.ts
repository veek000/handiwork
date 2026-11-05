// Notification — the header bell dropdown, present in both flows. Types are the
// distinct notification kinds shown in the populated dropdown.

export type NotificationType =
  | "job_inquiry" // "New Job Inquiry"
  | "payment_received" // "Payment Received"
  | "job_cancelled" // "Job Canceled"
  | "new_review" // "New Review"
  | "quote_received" // vendor sent or updated a quote
  | "payment_released" // escrow released to the vendor
  | "job_update"; // marked completed, counter offer, …

export interface Notification {
  id: string;
  type: NotificationType;
  title: string; // "Payment Received"
  body: string; // "You have received a payment of …"
  createdAt: string; // ISO 8601 — rendered "5 min ago" / "2 hours ago", grouped by day
  jobId?: string; // the job it's about (opens its chat)
  read: boolean; // unread rows render with a green background; "Unread (20)" tab
}
