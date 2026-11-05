"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "convex/react";
import type { Conversation, Message, UserRole } from "@/types";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { ActionError } from "@/components/ActionError";
import { LoadingState } from "@/components/LoadingState";
import { JOB_STATUS_LABEL } from "@/components/JobCard";
import { usePaymentForJob, useThreadMessages } from "@/hooks";
import { live } from "@/lib/convexApi";
import { useRunner } from "@/lib/useRunner";
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
  | { type: "sendQuote"; editQuoteId?: string; amount?: number }
  | { type: "reviewQuote"; message: Message }
  | { type: "counter"; quoteId: string }
  | { type: "pay"; paymentId: string; amount: number; serviceFee: number; processingFee: number; total: number }
  | { type: "paySuccess" }
  | { type: "confirmComplete" }
  | { type: "review" };

/**
 * Job-scoped chat thread with the quotation flow (Figma Quotation Flow), live from
 * Convex. Vendor: Send / Edit Quote, Mark as Completed. Customer: Review Quote →
 * Accept (→ pay into escrow, fees shown) or Counter; Mark Completed (confirms and
 * releases escrow) → Rate Your Experience. Opening the thread marks the other
 * person's messages read. Which actions are enabled follows the job's status.
 */
export function ChatThread({
  conversation,
  viewerId,
  viewerRole,
  onBack,
}: {
  conversation: Conversation;
  viewerId: string;
  viewerRole: UserRole;
  onBack?: () => void;
}) {
  const jobId = conversation.jobId;
  const data = useThreadMessages(jobId);
  const payment = usePaymentForJob(jobId);
  const [draft, setDraft] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { run, busy, error, clearError } = useRunner();

  const send = useMutation(live.sendMessage);
  const markRead = useMutation(live.markThreadRead);
  const sendQuote = useMutation(live.sendQuote);
  const editQuote = useMutation(live.editQuote);
  const counterQuote = useMutation(live.counterQuote);
  const acceptQuote = useMutation(live.acceptQuote);
  const pay = useMutation(live.pay);
  const markCompleted = useMutation(live.markCompleted);
  const confirmCompleted = useMutation(live.confirmCompleted);
  const saveReview = useMutation(live.saveReview);

  const msgs = useMemo(() => data?.messages ?? [], [data]);
  const status = data?.jobStatus;
  const unreadFromOther = msgs.some((m) => m.senderId && m.senderId !== viewerId && m.status !== "read");

  useEffect(() => {
    markRead({ jobId }).catch(() => {});
  }, [jobId, msgs.length, markRead]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs.length, modal]);

  const activeQuote = useMemo(() => {
    const quotes = msgs.filter((m) => m.kind === "quote" && m.quote && !m.quote.superseded);
    return quotes[quotes.length - 1]?.quote ?? null;
  }, [msgs]);

  async function sendText() {
    const body = draft.trim();
    if (!body || busy) return;
    setDraft("");
    const ok = await run(() => send({ jobId, body }), "Your message didn't send. Please try again.");
    if (!ok) setDraft(body);
  }

  async function handleSendQuote(amount: number) {
    const editId = modal?.type === "sendQuote" ? modal.editQuoteId : undefined;
    const ok = await run(() => (editId ? editQuote({ quoteId: editId, amount }) : sendQuote({ jobId, amount })));
    if (ok) setModal(null);
  }

  async function handleAccept(quoteId: string) {
    let result: Awaited<ReturnType<typeof acceptQuote>> | undefined;
    const ok = await run(async () => {
      result = await acceptQuote({ quoteId });
    });
    if (ok && result) setModal({ type: "pay", ...result });
  }

  async function handleCounter(quoteId: string, amount: number) {
    if (await run(() => counterQuote({ quoteId, amount }))) setModal(null);
  }

  async function handlePaid(paymentId: string, method: "card" | "transfer") {
    if (await run(() => pay({ paymentId, method }), "The payment didn't go through. Please try again.")) {
      setModal({ type: "paySuccess" });
    }
  }

  async function handleConfirmComplete() {
    if (viewerRole === "vendor") {
      if (await run(() => markCompleted({ id: jobId }))) setModal(null);
    } else if (await run(() => confirmCompleted({ id: jobId }))) {
      setModal({ type: "review" });
    }
  }

  // Customer accepted earlier but didn't finish paying: offer to complete it.
  const pendingPayment = viewerRole === "customer" && payment?.status === "pending" && status === "quoted" ? payment : null;
  const canComplete = viewerRole === "vendor" ? status === "in_progress" : status === "in_progress" || status === "marked_completed";

  return (
    <div className="hw-thread">
      <header className="hw-thread__head">
        {onBack ? (
          <button type="button" className="hw-msg__back" onClick={onBack}>
            <hw-icon suppressHydrationWarning name="angle-left" variant="hollow" size="12"></hw-icon>
            Back
          </button>
        ) : (
          <span style={{ width: 60 }} />
        )}
        <div className="hw-thread__head-main">
          <h2 className="hw-thread__name">{conversation.participantName}</h2>
          <p className="hw-thread__status">
            {conversation.jobTitle ?? "Job"}
            {status ? ` · ${JOB_STATUS_LABEL[status]}` : ""}
          </p>
        </div>
        <Avatar name={conversation.participantName} src={conversation.participantAvatarUrl} size={40} />
      </header>

      <div className="hw-thread__actions">
        {viewerRole === "vendor" ? (
          <>
            <Button
              variant="primary"
              block
              disabled={status !== "pending" && status !== "quoted"}
              onClick={() => setModal({ type: "sendQuote", amount: activeQuote?.amount ?? 25000 })}
            >
              Send Quote
            </Button>
            <Button variant="secondary" block disabled={!canComplete} onClick={() => setModal({ type: "confirmComplete" })}>
              Mark as Completed
            </Button>
          </>
        ) : pendingPayment ? (
          <Button variant="primary" block onClick={() => setModal({ type: "pay", paymentId: pendingPayment.id, ...pendingPayment })}>
            Complete Payment
          </Button>
        ) : (
          <Button variant="primary" block disabled={!canComplete} onClick={() => setModal({ type: "confirmComplete" })}>
            Mark Completed
          </Button>
        )}
      </div>

      <div className="hw-thread__scroll" ref={scrollRef} aria-live="polite">
        {data === undefined ? (
          <LoadingState label="Loading messages…" />
        ) : (
          msgs.map((m) => (
            <ChatBubble
              key={m.id}
              message={m}
              isMine={m.senderId === viewerId}
              viewerRole={viewerRole}
              onReviewQuote={(msg) => setModal({ type: "reviewQuote", message: msg })}
              onEditQuote={(msg) => setModal({ type: "sendQuote", editQuoteId: msg.quote?.id, amount: msg.quote?.amount })}
            />
          ))
        )}
        {unreadFromOther ? <span className="hw-sr-only">New message</span> : null}
      </div>

      <div className="hw-thread__composer">
        <div className="hw-thread__input-wrap">
          <input
            className="hw-thread__input"
            type="text"
            placeholder="Message"
            aria-label="Message"
            maxLength={2000}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendText();
              }
            }}
          />
        </div>
        <button
          type="button"
          className="hw-thread__icon-btn hw-thread__icon-btn--send"
          aria-label="Send"
          disabled={!draft.trim()}
          onClick={sendText}
        >
          <hw-icon suppressHydrationWarning name="paper-plane" variant="filled" size="20"></hw-icon>
        </button>
      </div>

      {modal?.type === "sendQuote" ? (
        <SendQuoteModal
          title={modal.editQuoteId ? "Edit Quote" : "Quotation"}
          initialAmount={modal.amount ?? 25000}
          onClose={() => setModal(null)}
          onSubmit={handleSendQuote}
        />
      ) : null}
      {modal?.type === "reviewQuote" && modal.message.quote ? (
        <ReviewQuoteModal
          amount={modal.message.quote.amount}
          onClose={() => setModal(null)}
          onAccept={() => handleAccept(modal.message.quote!.id)}
          onCounter={() => setModal({ type: "counter", quoteId: modal.message.quote!.id })}
        />
      ) : null}
      {modal?.type === "counter" ? (
        <CounterOfferModal onClose={() => setModal(null)} onSubmit={(amount) => handleCounter(modal.quoteId, amount)} />
      ) : null}
      {modal?.type === "pay" ? (
        <PaymentModal
          amount={modal.total}
          breakdown={{ quote: modal.amount, serviceFee: modal.serviceFee, processingFee: modal.processingFee }}
          busy={busy}
          onClose={() => setModal(null)}
          onPaid={(method) => handlePaid(modal.paymentId, method)}
        />
      ) : null}
      {modal?.type === "paySuccess" ? <PaymentSuccessModal onClose={() => setModal(null)} /> : null}
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
          onSubmit={async (rating, text) => {
            if (await run(() => saveReview({ jobId, rating, body: text }))) setModal(null);
          }}
        />
      ) : null}
      <ActionError error={error} onDismiss={clearError} />
    </div>
  );
}

export default ChatThread;
