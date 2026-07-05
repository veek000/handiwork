import type { Conversation } from "@/types";
import { conversations } from "@/mocks/conversations";

export function useConversations(): Conversation[] {
  return conversations;
}
