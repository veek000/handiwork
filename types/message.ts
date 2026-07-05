// Messaging. Both flows draw only the conversation LIST plus a "No Chat Selected"
// empty state — there is no message-thread screen in the current designs.

// Read-receipt state from the check-mark glyphs on each conversation row.
export type DeliveryStatus = "sent" | "delivered" | "read";

// Fully evidenced by the Messages list row.
export interface Conversation {
  id: string;
  participantName: string; // "Kristin Watson"
  participantAvatarUrl?: string;
  lastMessagePreview: string; // "yah, nice design"
  lastMessageAt: string; // ISO 8601 — rendered "4:30 PM" / "Yesterday"
  unreadCount: number; // red badge count
  lastMessageStatus: DeliveryStatus; // ✓ / ✓✓
  isTyping: boolean; // "Veek Design is Typing…"
}

// SPECULATIVE / INFERRED — no chat-thread screen exists yet to source these fields
// from. This is the minimal atomic message shape a thread would need; treat it as a
// placeholder to revisit once a conversation-detail screen is designed. It is NOT
// derived from the Figma flows the way every other type here is.
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  sentAt: string; // ISO 8601
  status: DeliveryStatus;
}
