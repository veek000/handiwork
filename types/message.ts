// Messaging + quotation thread.
// Conversations are scoped per Job (see PROJECT.md "Chat" locked decision).
// The quotation flow lives inside the job-scoped chat thread (Figma Quotation Flow
// customer 291:46191 / 290:11000 · vendor 300:11629 / 300:26058).

// Read-receipt state from the check-mark glyphs on each conversation row / bubble.
export type DeliveryStatus = "sent" | "delivered" | "read";

// Fully evidenced by the Messages list row.
export interface Conversation {
  id: string;
  jobId: string; // Job this thread is scoped to — chat is per-order, not an open inbox
  jobTitle?: string; // shown under the name so two jobs with one person are told apart
  participantName: string; // counterparty from the signed-in user's side
  participantAvatarUrl?: string;
  lastMessagePreview: string;
  lastMessageAt: string; // ISO 8601 — rendered "4:30 PM" / "Yesterday"
  unreadCount: number;
  lastMessageStatus: DeliveryStatus;
  isTyping: boolean;
}

// Quote lifecycle inside a chat thread (Figma: Quote bubble → Review → Accept /
// Counter → Pay → Escrow → Complete).
export type QuoteStatus =
  | "pending" // vendor sent, customer hasn't accepted
  | "countered" // customer sent a counter-offer amount
  | "accepted" // customer accepted (payment may still be pending)
  | "paid"; // payment landed in escrow

export interface Quote {
  id: string;
  amount: number; // whole-number NGN
  status: QuoteStatus;
  counterAmount?: number; // set when customer counters
  superseded?: boolean; // replaced by a newer quote / job closed — shown, not actionable
}

export type MessageKind = "text" | "quote" | "system";

// Atomic message in a job-scoped thread. `kind` discriminates plain chat vs
// quote card vs system notification banner.
export interface Message {
  id: string;
  conversationId: string;
  kind: MessageKind;
  /** null for system notifications (no sender bubble side) */
  senderId: string | null;
  body: string;
  sentAt: string; // ISO 8601
  status: DeliveryStatus;
  /** set when kind === "quote" */
  quote?: Quote;
  /** system banner title, e.g. "System Notification" / "Payment Notice" */
  systemTitle?: string;
}
