import type { Conversation, UserRole } from "@/types";
import { conversations as customerConversations } from "@/mocks/conversations";

// Vendor view of the same job-scoped threads — counterparty is the customer.
// Seeded so Veek sees Jane on conv_01 (the quotation-flow story) plus a couple
// of other open threads for list density.
const vendorConversations: Conversation[] = [
  {
    // Typing edge case (mirrors customer conv_01 Figma row).
    id: "conv_01",
    jobId: "job_02",
    participantName: "Jane Doe",
    lastMessagePreview: "I've sent you a quotation. Let me know if adjustments are needed.",
    lastMessageAt: "2025-09-20T10:17:00+01:00",
    unreadCount: 0,
    lastMessageStatus: "delivered",
    isTyping: true,
  },
  {
    id: "conv_v2",
    jobId: "job_07",
    participantName: "Jane Doe",
    lastMessagePreview: "Deep clean is underway — update you when rooms are done.",
    lastMessageAt: "2025-09-20T09:30:00+01:00",
    unreadCount: 1,
    lastMessageStatus: "sent",
    isTyping: false,
  },
  {
    id: "conv_v3",
    jobId: "job_15",
    participantName: "Daniel Okeke",
    lastMessagePreview: "Thanks for taking the kitchen sink job.",
    lastMessageAt: "2025-09-19T16:00:00+01:00",
    unreadCount: 0,
    lastMessageStatus: "read",
    isTyping: false,
  },
];

/** Conversations for the signed-in role (customer list vs vendor list). */
export function useConversations(role: UserRole = "customer"): Conversation[] {
  return role === "vendor" ? vendorConversations : customerConversations;
}
