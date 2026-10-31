"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import type { Conversation, Message, Quote, UserRole } from "@/types";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { ChatBubble } from "./ChatBubble";
import {
  SendQuoteModal,
  ReviewQuoteModal,
  CounterOfferModal,
  PaymentModal,
  PaymentSuccessModal,
  ConfirmCompleteModal,
  ReviewModal,
} from "./QuoteModals";

type Modal =
  | null
  | { type: "sendQuote"; editMessageId?: string; amount?: number }
  | { type: "reviewQuote"; message: Message }
  | { type: "counter" }
  | { type: "pay"; amount: number }
  | { type: "paySuccess" }
  | { type: "confirmComplete" }
  | { type: "review" };

/**
 * Job-scoped chat thread with quotation actions (Figma Quotation Flow).
 * Messages are held in local state seeded from mocks so Accept / Send Quote /
 * Pay can advance the story without a backend.
 */
export function ChatThread({
  conversation,
  initialMessages,
  viewerId,
  viewerRole,
  onBack,
}: {
  conversation: Conversation;
  initialMessages: Message[];
  viewerId: string;
  viewerRole: UserRole;
  onBack?: () => void;
}) {
  const [msgs, setMsgs] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [phase, setPhase] = useState<
    "chat" | "quoted" | "paid" | "complete_pending" | "done"
  >("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Detect initial quote state from seed data
  useEffect(() => {
    const q = initialMessages.find((m) => m.kind === "quote")?.quote;
    if (q?.status === "paid") setPhase("paid");
    else if (q?.status === "accepted") setPhase("quoted");
    else if (q) setPhase("quoted");
  }, [initialMessages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, modal]);

  const activeQuote = useMemo(() => {
    const quotes = msgs.filter((m) => m.kind === "quote" && m.quote);
    return quotes[quotes.length - 1]?.quote ?? null;
  }, [msgs]);

  function pushMessage(partial: Omit<Message, "id" | "conversationId">) {
    const msg: Message = {
      ...partial,
      id: `msg_local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      conversationId: conversation.id,
    };
    setMsgs((prev) => [...prev, msg]);
    return msg;
  }

  function updateQuote(quoteId: string, patch: Partial<Quote>) {
    setMsgs((prev) =>
      prev.map((m) =>
        m.quote?.id === quoteId
          ? { ...m, quote: { ...m.quote, ...patch } }
          : m,
      ),
    );
  }

  function sendText() {
    const body = draft.trim();
    if (!body) return;
    pushMessage({
      kind: "text",
      senderId: viewerId,
      body,
      sentAt: new Date().toISOString(),
      status: "sent",
    });
    setDraft("");
  }

  function handleSendQuote(amount: number) {
    const editId =
      modal && modal.type === "sendQuote" ? modal.editMessageId : undefined;
    if (editId) {
      setMsgs((prev) =>
        prev.map((m) =>
          m.id === editId && m.quote
            ? {
                ...m,
                quote: { ...m.quote, amount, status: "pending", counterAmount: undefined },
              }
            : m,
        ),
      );
    } else {
      pushMessage({
        kind: "quote",
        senderId: viewerId,
        body: "Quote",
        sentAt: new Date().toISOString(),
        status: "sent",
        quote: { id: `quote_${Date.now()}`, amount, status: "pending" },
      });
      pushMessage({
        kind: "text",
        senderId: viewerId,
        body: "I've sent you a quotation. Let me know if adjustments are needed.",
        sentAt: new Date().toISOString(),
        status: "sent",
      });
    }
    setPhase("quoted");
    setModal(null);
  }

  function handleAccept() {
    if (!activeQuote) return;
    updateQuote(activeQuote.id, { status: "accepted" });
    setModal({ type: "pay", amount: activeQuote.amount });
  }

  function handleCounter(amount: number) {
    if (!activeQuote) return;
    updateQuote(activeQuote.id, { status: "countered", counterAmount: amount });
    pushMessage({
      kind: "text",
      senderId: viewerId,
      body: `I'd like to counter at NGN${amount.toLocaleString("en-US")}.`,
      sentAt: new Date().toISOString(),
      status: "sent",
    });
    setModal(null);
  }

  function handlePaid() {
    if (!activeQuote) return;
    updateQuote(activeQuote.id, { status: "paid" });
    pushMessage({
      kind: "system",
      senderId: null,
      systemTitle: "Payment Notice",
      body: "Payment In Escrow — Your payment is secured. Funds release when work is confirmed complete.",
      sentAt: new Date().toISOString(),
      status: "read",
    });
    pushMessage({
      kind: "text",
      senderId: viewerId,
      body: "Yes this is Perfect, i have made the payment.",
      sentAt: new Date().toISOString(),
      status: "sent",
    });
    setPhase("paid");
    setModal({ type: "paySuccess" });
  }

  function handleMarkComplete() {
    setModal({ type: "confirmComplete" });
  }

  function handleConfirmComplete() {
    pushMessage({
      kind: "system",
      senderId: null,
      systemTitle: "System Notification",
      body:
        viewerRole === "vendor"
          ? "Job marked as completed by provider. Waiting for customer confirmation."
          : "Thank you for confirming. Your job is now marked as complete",
      sentAt: new Date().toISOString(),
      status: "read",
    });
    setPhase(viewerRole === "customer" ? "done" : "complete_pending");
    setModal(viewerRole === "customer" ? { type: "review" } : null);
  }

  return (
    <div className="hw-thread">
      <header className="hw-thread__head">
        {onBack ? (
          <button type="button" className="hw-msg__back" onClick={onBack}>
            <hw-icon
              suppressHydrationWarning
              name="angle-left"
              variant="hollow"
              size="12"
            ></hw-icon>
            Back
          </button>
        ) : (
          <span style={{ width: 60 }} />
        )}
        <div className="hw-thread__head-main">
          <h2 className="hw-thread__name">{conversation.participantName}</h2>
          <p className="hw-thread__status">
            {conversation.isTyping
              ? `${conversation.participantName} is Typing...`
              : "Last seen 02.21 AM"}
          </p>
        </div>
        <Avatar
          name={conversation.participantName}
          src={conversation.participantAvatarUrl}
          size={40}
        />
      </header>

      <div className="hw-thread__actions">
        {viewerRole === "vendor" ? (
          <>
            <Button
              variant="primary"
              block
              onClick={() =>
                setModal({
                  type: "sendQuote",
                  amount: activeQuote?.amount ?? 25000,
                })
              }
            >
              Send Quote
            </Button>
            <Button
              variant="secondary"
              block
              disabled={phase !== "paid" && phase !== "complete_pending"}
              onClick={handleMarkComplete}
            >
              Mark as Completed
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            block
            disabled={phase !== "paid" && phase !== "complete_pending"}
            onClick={handleMarkComplete}
          >
            Mark Completed
          </Button>
        )}
      </div>

      <div className="hw-thread__scroll" ref={scrollRef}>
        {msgs.map((m) => (
          <ChatBubble
            key={m.id}
            message={m}
            isMine={m.senderId === viewerId}
            viewerRole={viewerRole}
            onReviewQuote={(msg) => setModal({ type: "reviewQuote", message: msg })}
            onEditQuote={(msg) =>
              setModal({
                type: "sendQuote",
                editMessageId: msg.id,
                amount: msg.quote?.amount,
              })
            }
          />
        ))}
      </div>

      <div className="hw-thread__composer">
        <button type="button" className="hw-thread__icon-btn" aria-label="Attach image">
          <hw-icon
            suppressHydrationWarning
            name="image"
            variant="hollow"
            size="16"
          ></hw-icon>
        </button>
        <div className="hw-thread__input-wrap">
          <input
            className="hw-thread__input"
            type="text"
            placeholder="Message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendText();
              }
            }}
          />
          <button type="button" className="hw-thread__icon-btn" aria-label="Emoji" style={{ width: 32, height: 32, background: "transparent" }}>
            <hw-icon
              suppressHydrationWarning
              name="face-smile"
              variant="hollow"
              size="16"
            ></hw-icon>
          </button>
        </div>
        <button
          type="button"
          className="hw-thread__icon-btn hw-thread__icon-btn--send"
          aria-label="Send"
          onClick={sendText}
        >
          <hw-icon
            suppressHydrationWarning
            name="paper-plane"
            variant="filled"
            size="20"
          ></hw-icon>
        </button>
      </div>

      {modal?.type === "sendQuote" ? (
        <SendQuoteModal
          title={modal.editMessageId ? "Edit Quote" : "Quotation"}
          initialAmount={modal.amount ?? 25000}
          onClose={() => setModal(null)}
          onSubmit={handleSendQuote}
        />
      ) : null}
      {modal?.type === "reviewQuote" && modal.message.quote ? (
        <ReviewQuoteModal
          amount={modal.message.quote.amount}
          onClose={() => setModal(null)}
          onAccept={handleAccept}
          onCounter={() => setModal({ type: "counter" })}
        />
      ) : null}
      {modal?.type === "counter" ? (
        <CounterOfferModal
          onClose={() => setModal(null)}
          onSubmit={handleCounter}
        />
      ) : null}
      {modal?.type === "pay" ? (
        <PaymentModal
          amount={modal.amount}
          onClose={() => setModal(null)}
          onPaid={() => handlePaid()}
        />
      ) : null}
      {modal?.type === "paySuccess" ? (
        <PaymentSuccessModal onClose={() => setModal(null)} />
      ) : null}
      {modal?.type === "confirmComplete" ? (
        <ConfirmCompleteModal
          amount={activeQuote?.amount ?? 0}
          role={viewerRole}
          onClose={() => setModal(null)}
          onConfirm={handleConfirmComplete}
        />
      ) : null}
      {modal?.type === "review" ? (
        <ReviewModal
          onClose={() => setModal(null)}
          onSubmit={() => {
            pushMessage({
              kind: "system",
              senderId: null,
              systemTitle: "System Notification",
              body: "Your review has been submitted. Thanks for the Feedback!",
              sentAt: new Date().toISOString(),
              status: "read",
            });
            setModal(null);
          }}
        />
      ) : null}
    </div>
  );
}

export default ChatThread;
