"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import type { UserRole } from "@/types";
import { useConversations, useCurrentUser, useMessages } from "@/hooks";
import { ConversationList } from "./ConversationList";
import { ChatThread } from "./ChatThread";

/**
 * Shared Messages + Quotation UI for customer and vendor.
 *
 * Figma desktop layout (291:47200): two columns aligned at the top —
 *   left  361px — Back + "Messages" + conversation list
 *   right 764px — chat thread (starts on the same row as Back, not below it)
 * Mobile: list OR full-screen thread.
 */
export function MessagesPage({ role }: { role: UserRole }) {
  const user = useCurrentUser(role);
  const conversations = useConversations(role);
  const allMessages = useMessages();
  const homeHref = role === "customer" ? "/customer" : "/vendor";

  const [activeId, setActiveId] = useState<string | null>(null);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const threadMessages = useMemo(() => {
    if (!activeId) return [];
    return allMessages.filter((m) => m.conversationId === activeId);
  }, [allMessages, activeId]);

  const select = useCallback((id: string) => setActiveId(id), []);
  const clear = useCallback(() => setActiveId(null), []);

  return (
    <div className={"hw-msg" + (activeId ? " is-thread" : "")}>
      {/* Two-column shell: list header+rows | thread — tops share one baseline */}
      <div className="hw-msg__layout">
        <div className="hw-msg__list-pane">
          <Link href={homeHref} className="hw-msg__back">
            <hw-icon
              suppressHydrationWarning
              name="angle-left"
              variant="hollow"
              size="16"
            ></hw-icon>
            Back
          </Link>
          <h1 className="hw-msg__title">Messages</h1>
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={select}
          />
        </div>

        <div className="hw-msg__thread-pane">
          {active ? (
            <ChatThread
              key={active.id}
              conversation={active}
              initialMessages={threadMessages}
              viewerId={user.id}
              viewerRole={role}
              onBack={clear}
            />
          ) : (
            /* Figma empty pane (298:32555 / 300:11030 desktop · 290:23050 / 300:25699 mobile):
               illustration-29 + title + select-a-user copy */
            <div className="hw-msg__empty">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="hw-msg__empty-art"
                src="/assets/illustration/illustration-29.svg"
                alt=""
                aria-hidden="true"
                width={160}
                height={160}
              />
              <h2 className="hw-msg__empty-title">No Chat Selected</h2>
              <p className="hw-msg__empty-hint">
                <span className="hw-msg__empty-hint--desktop">
                  Select a user from the list on the left to view the chat and
                  details.
                </span>
                <span className="hw-msg__empty-hint--mobile">
                  Select a user from the list to view the chat and details.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
