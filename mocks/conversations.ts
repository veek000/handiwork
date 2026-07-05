// Mock conversations — the Messages list (both flows draw only this list + a
// "No Chat Selected" empty state; there is no message-thread screen yet).
//
// Each conversation is scoped to a specific Job (`jobId`) — chat is per-order, not an
// open inbox (see the "Chat" locked decision in PROJECT.md). These are the signed-in
// customer's (Jane Doe / usr_jane) threads, so every `jobId` is one of Jane's jobs and
// `participantName` is that job's vendor (the counterparty). Referential integrity —
// each `jobId` resolves to a real Job whose customerId is the viewer (usr_jane) and
// whose vendorId is the named participant — is enforced in mocks/jobs.ts + mocks/users.ts.
//
// NOTE: only `Conversation` is mocked. `Message` is deliberately NOT mocked — it's
// flagged speculative in types/message.ts (no chat-thread screen to source it from);
// `lastMessagePreview` is the only message-shaped mock content here.
import type { Conversation } from "@/types";

export const conversations: Conversation[] = [
  {
    // Edge case: isTyping = true (matches the "Veek Design is Typing…" row in Figma).
    // job_02 = Jane's "Weekly Apartment Clean" with Veek Okonkwo (usr_veek).
    id: "conv_01",
    jobId: "job_02",
    participantName: "Veek Okonkwo",
    lastMessagePreview: "Great, I can come by on Saturday morning.",
    lastMessageAt: "2025-09-20T16:30:00+01:00",
    unreadCount: 0,
    lastMessageStatus: "sent",
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
