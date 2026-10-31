"use client";

import type { Conversation, DeliveryStatus } from "@/types";
import { formatChatTime } from "@/lib/time";
import { Avatar } from "@/components/Avatar";

/**
 * Delivery ticks (Figma Messages list):
 *  - sent      → single checkmark (grey)
 *  - delivered → check-double (grey)
 *  - read      → check-double (brand green)
 * Unread rows show a red count badge instead of ticks.
 * Typing rows show green “{name} is Typing...” preview (no ticks if unread badge).
 */
function DeliveryTicks({ status }: { status: DeliveryStatus }) {
  const isRead = status === "read";
  const isDouble = status === "delivered" || status === "read";
  return (
    <span
      className={"hw-conv__ticks" + (isRead ? " is-read" : "")}
      aria-label={isRead ? "Read" : isDouble ? "Delivered" : "Sent"}
    >
      <hw-icon
        suppressHydrationWarning
        name={isDouble ? "check-double" : "checkmark"}
        variant={isDouble ? "filled" : "hollow"}
        size="16"
      ></hw-icon>
    </span>
  );
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: Conversation[];
  activeId?: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="hw-convlist" role="list">
      {conversations.map((c) => {
        const active = c.id === activeId;
        return (
          <button
            key={c.id}
            type="button"
            role="listitem"
            className={"hw-conv" + (active ? " is-active" : "")}
            onClick={() => onSelect(c.id)}
          >
            <Avatar
              name={c.participantName}
              src={c.participantAvatarUrl}
              size={50}
            />
            <span className="hw-conv__body">
              <span className="hw-conv__name">{c.participantName}</span>
              <span
                className={
                  "hw-conv__preview" + (c.isTyping ? " is-typing" : "")
                }
              >
                {c.isTyping
                  ? `${c.participantName} is Typing...`
                  : c.lastMessagePreview}
              </span>
            </span>
            <span className="hw-conv__meta">
              <span className="hw-conv__time">
                {formatChatTime(c.lastMessageAt)}
              </span>
              {c.unreadCount > 0 ? (
                <span className="hw-conv__badge" aria-label={`${c.unreadCount} unread`}>
                  {c.unreadCount}
                </span>
              ) : (
                <DeliveryTicks status={c.lastMessageStatus} />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ConversationList;
