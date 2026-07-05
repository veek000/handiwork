// Mock notifications — the header bell dropdown. The Notification type has no
// foreign keys; names in the body text reference real mock users where possible.
// Includes all four NotificationType values and a mix of read / unread.
import type { Notification } from "@/types";

export const notifications: Notification[] = [
  {
    id: "ntf_01",
    type: "job_inquiry",
    title: "New Job Inquiry",
    body: 'You have a new job inquiry for "Living Room Painting" from Jane Doe.',
    createdAt: "2025-09-20T16:25:00+01:00",
    read: false,
  },
  {
    id: "ntf_02",
    type: "payment_received",
    title: "Payment Received",
    body: 'You have received a payment of ₦45,000 for the "Ceiling Fan Installation" job from Jane Doe.',
    createdAt: "2025-09-20T14:10:00+01:00",
    read: false,
  },
  {
    id: "ntf_03",
    type: "job_cancelled",
    title: "Job Cancelled",
    body: 'The job "Move-out Clean" with Jane Doe has been cancelled.',
    createdAt: "2025-09-20T13:55:00+01:00",
    read: true,
  },
  {
    id: "ntf_04",
    type: "new_review",
    title: "New Review",
    body: 'Daniel Okeke left a new 5-star review for your "Office Cleaning" service.',
    createdAt: "2025-09-19T18:40:00+01:00",
    read: true,
  },
  {
    id: "ntf_05",
    type: "job_inquiry",
    title: "New Job Inquiry",
    body: 'You have a new job inquiry for "Weekly Apartment Clean" from Jane Doe.',
    createdAt: "2025-09-19T14:05:00+01:00",
    read: true,
  },
];
