// Mock conversations — the Messages list (both flows draw only this list + a
// "No Chat Selected" empty state; there is no message-thread screen yet).
//
// NOTE: this maps to the message.ts type domain, but only `Conversation` is mocked.
// `Message` is deliberately NOT mocked — it's flagged speculative in types/message.ts
// (no chat-thread screen to source it from), and inventing thread content would
// compound that speculation. `lastMessagePreview` is the only message-shaped mock
// content here. Each `participantName` matches a real user in mocks/users.ts.
import type { Conversation } from "@/types";

export const conversations: Conversation[] = [
  {
    // Edge case: isTyping = true (matches the "Veek Design is Typing…" row in Figma).
    id: "conv_01",
    participantName: "Veek Okonkwo",
    lastMessagePreview: "Great, I can come by on Saturday morning.",
    lastMessageAt: "2025-09-20T16:30:00+01:00",
    unreadCount: 0,
    lastMessageStatus: "sent",
    isTyping: true,
  },
  {
    // Edge case: unreadCount > 0.
    id: "conv_02",
    participantName: "Kristin Watson",
    lastMessagePreview: "yah, nice — that works for me",
    lastMessageAt: "2025-09-20T16:30:00+01:00",
    unreadCount: 2,
    lastMessageStatus: "delivered",
    isTyping: false,
  },
  {
    id: "conv_03",
    participantName: "Eleanor Pena",
    lastMessagePreview: "Wow, really appreciate the quick turnaround 🔥",
    lastMessageAt: "2025-09-19T21:10:00+01:00",
    unreadCount: 0,
    lastMessageStatus: "read",
    isTyping: false,
  },
  {
    id: "conv_04",
    participantName: "Tunde Bakare",
    lastMessagePreview: "I'll send the quote across shortly.",
    lastMessageAt: "2025-09-19T12:45:00+01:00",
    unreadCount: 1,
    lastMessageStatus: "delivered",
    isTyping: false,
  },
  {
    id: "conv_05",
    participantName: "Daniel Okeke",
    lastMessagePreview: "Thanks, see you then 👍",
    lastMessageAt: "2025-09-17T08:05:00+01:00",
    unreadCount: 0,
    lastMessageStatus: "read",
    isTyping: false,
  },
];
