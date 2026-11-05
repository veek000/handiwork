"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import type { UserRole } from "@/types";
import { useThreads, useViewer } from "@/hooks";
import { LoadingState } from "@/components/LoadingState";
import { ConversationList } from "./ConversationList";
import { ChatThread } from "./ChatThread";

/**
 * Shared Messages + Quotation UI for customer and vendor.
 *
 * Figma desktop layout (291:47200): two columns aligned at the top —
 *   left  361px — Back + "Messages" + conversation list
 *   right 764px — chat thread (starts on the same row as Back, not below it)
 * Mobile: list OR full-screen thread. One thread per job (live from Convex); `?job=`
 * opens that job's thread.
 */
export function MessagesPage({ role, initialJobId }: { role: UserRole; initialJobId?: string }) {
  const user = useViewer();
  const threads = useThreads();
  const conversations = useMemo(() => threads ?? [], [threads]);
  const homeHref = role === "customer" ? "/customer" : "/vendor";

  // `?job=` (My Jobs "View Chat", notifications) opens that job's thread — a thread's
  // id is its job id.
  const [activeId, setActiveId] = useState<string | null>(initialJobId ?? null);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

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
          {threads === undefined ? (
            <LoadingState label="Loading chats…" />
          ) : conversations.length ? (
            <ConversationList conversations={conversations} activeId={activeId} onSelect={select} />
          ) : (
            <p className="hw-searchpage__emptysub">
              {role === "customer" ? "No chats yet. Book a service and your chat with the provider starts here." : "No chats yet. They start when a customer requests your service."}
            </p>
          )}
        </div>

        <div className="hw-msg__thread-pane">
          {active && user ? (
            <ChatThread key={active.id} conversation={active} viewerId={user.id} viewerRole={role} onBack={clear} />
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
