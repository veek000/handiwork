// Mock conversations — customer Messages list (Jane Doe / usr_jane).
// Each conversation is scoped to a specific Job (`jobId`) — chat is per-order, not an
// open inbox (see the "Chat" locked decision in PROJECT.md). Thread bodies live in
// mocks/messages.ts (quotation flow seeds conv_01). Vendor-side list is built in
// hooks/useConversations.ts for the signed-in vendor (Veek).
import type { Conversation } from "@/types";

export const conversations: Conversation[] = [
  {
    // Edge case: isTyping = true (matches the "Veek Design is Typing…" row in Figma).
    // job_02 = Jane's "Weekly Apartment Clean" with Veek Okonkwo (usr_veek).
    id: "conv_01",
    jobId: "job_02",
    participantName: "Veek Okonkwo",
    // Preview / time / status mirror the thread's last message (mocks/messages.ts msg_07),
    // matching the vendor-side row in hooks/useConversations.ts. (The typing indicator
    // replaces the preview text in the row while isTyping = true.)
    lastMessagePreview: "I've sent you a quotation. Let me know if adjustments are needed.",
    lastMessageAt: "2025-09-20T10:17:00+01:00",
    unreadCount: 0,
    lastMessageStatus: "delivered",
    isTyping: true,
  },
  {
    // Edge case: unreadCount > 0.
    // job_01 = Jane's "Kitchen Sink Repair" with Tunde Bakare (usr_tunde).
    id: "conv_02",
    jobId: "job_01",
    participantName: "Tunde Bakare",
    lastMessagePreview: "I've had a look — the trap needs replacing. Sending a quote.",
    lastMessageAt: "2025-09-20T16:30:00+01:00",
    unreadCount: 2,
    lastMessageStatus: "delivered",
    isTyping: false,
  },
  {
    // job_03 = Jane's "Living Room Painting" with Amaka Eze (usr_amaka).
    id: "conv_03",
    jobId: "job_03",
    participantName: "Amaka Eze",
    lastMessagePreview: "Wow, really appreciate the quick turnaround 🔥",
    lastMessageAt: "2025-09-19T21:10:00+01:00",
    unreadCount: 0,
    lastMessageStatus: "read",
    isTyping: false,
  },
  {
    // Edge case: unreadCount > 0.
    // job_04 = Jane's "Ceiling Fan Installation" with Femi Adeleke (usr_femi).
    id: "conv_04",
    jobId: "job_04",
    participantName: "Femi Adeleke",
    lastMessagePreview: "Both fans are up and tested. I'll send the invoice across shortly.",
    lastMessageAt: "2025-09-19T12:45:00+01:00",
    unreadCount: 1,
    lastMessageStatus: "delivered",
    isTyping: false,
  },
  {
    // job_09 = Jane's "Weekly Laundry Pickup" with Grace Okafor (usr_grace).
    id: "conv_05",
    jobId: "job_09",
    participantName: "Grace Okafor",
    lastMessagePreview: "Thanks, see you Saturday for the pickup 👍",
    lastMessageAt: "2025-09-17T08:05:00+01:00",
    unreadCount: 0,
    lastMessageStatus: "read",
    isTyping: false,
  },
];
