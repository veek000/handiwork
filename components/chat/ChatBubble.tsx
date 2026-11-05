"use client";

import type { Message } from "@/types";
import { formatChatTime, formatNaira } from "@/lib/time";
import { Button } from "@/components/Button";

/**
 * Chat bubble — Figma Label/Chat:
 *  - Receiver / mine (298:17229): dark brand-800 body + right tail, white text, ticks
 *  - Sender / peer  (298:17200): gray-100 body + left tail, dark text, ··· menu
 *
 * Layout: row flex items-end; body (px 16 / py 12) + 10×13 tail SVG (masked).
 */
export function ChatBubble({
  message,
  isMine,
  onReviewQuote,
  onEditQuote,
  viewerRole,
}: {
  message: Message;
  isMine: boolean;
  viewerRole: "customer" | "vendor";
  onReviewQuote?: (message: Message) => void;
  onEditQuote?: (message: Message) => void;
}) {
  if (message.kind === "system") {
    return (
      <div className="hw-sys">
        <div className="hw-sys__head">
          <span className="hw-sys__title">
            {message.systemTitle ?? "System Notification"}
          </span>
          <span className="hw-sys__time">{formatChatTime(message.sentAt)}</span>
        </div>
        <p className="hw-sys__body">{message.body}</p>
      </div>
    );
  }

  // --in = me (right, dark) · --out = peer (left, light)
  const side = isMine ? "in" : "out";

  const body = (
    <div className={`hw-bubble hw-bubble--${side}`}>
      {message.kind === "quote" && message.quote ? (
        <div className="hw-quote">
          <span className="hw-quote__label">Quote</span>
          <p className="hw-quote__amount">
            {formatNaira(message.quote.amount)}
          </p>
          {message.quote.superseded ? (
            <p className="hw-bubble__text">Replaced by a newer quote</p>
          ) : null}
          {!message.quote.superseded && viewerRole === "customer" && message.quote.status === "pending" ? (
            <Button
              variant="secondary"
              block
              className="hw-quote__btn"
              onClick={() => onReviewQuote?.(message)}
            >
              Review Quote
            </Button>
          ) : null}
          {!message.quote.superseded &&
          viewerRole === "vendor" &&
          (message.quote.status === "pending" ||
            message.quote.status === "countered") ? (
            <Button
              variant="secondary"
              block
              className="hw-quote__btn"
              onClick={() => onEditQuote?.(message)}
            >
              Edit Quote
            </Button>
          ) : null}
          {!message.quote.superseded &&
          message.quote.status === "countered" &&
          message.quote.counterAmount != null ? (
            <p className="hw-bubble__text">
              Counter offer: {formatNaira(message.quote.counterAmount)}
            </p>
          ) : null}
          {message.quote.status === "accepted" ||
          message.quote.status === "paid" ? (
            <p className="hw-bubble__text">
              Status:{" "}
              {message.quote.status === "paid" ? "Paid (escrow)" : "Accepted"}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="hw-bubble__text">{message.body}</p>
      )}
      <div className="hw-bubble__foot">
        <span className="hw-bubble__time">
          {formatChatTime(message.sentAt)}
        </span>
        {isMine ? (
          <span className="hw-bubble__meta-icon" aria-hidden>
            <hw-icon
              suppressHydrationWarning
              name={
                message.status === "sent" ? "checkmark" : "check-double"
              }
              variant={message.status === "sent" ? "hollow" : "filled"}
              size="16"
            ></hw-icon>
          </span>
        ) : (
          <span className="hw-bubble__meta-icon" aria-hidden>
            <hw-icon
              suppressHydrationWarning
              name="3-squares-horizontal"
              variant="filled"
              size="16"
            ></hw-icon>
          </span>
        )}
      </div>
    </div>
  );

  const tail = (
    <span className="hw-bubble__tail" aria-hidden="true" />
  );

  return (
    <div className={`hw-bubble-row hw-bubble-row--${side}`}>
      {/* Peer: tail on the left · Mine: tail on the right (Figma) */}
      {isMine ? (
        <>
          {body}
          {tail}
        </>
      ) : (
        <>
          {tail}
          {body}
        </>
      )}
    </div>
  );
}

export default ChatBubble;
