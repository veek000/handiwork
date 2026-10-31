import type { Message } from "@/types";
import { messages } from "@/mocks/messages";

/** All messages, or filtered to one conversation when `conversationId` is passed. */
export function useMessages(conversationId?: string): Message[] {
  if (!conversationId) return messages;
  return messages.filter((m) => m.conversationId === conversationId);
}
