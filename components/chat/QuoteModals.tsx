"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { formatNaira } from "@/lib/time";

function Scrim({
  children,
  onClose,
  labelledBy,
}: {
  children: ReactNode;
  onClose: () => void;
  labelledBy: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="hw-modal-scrim"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}

/** Vendor: enter amount → Send Quote */
export function SendQuoteModal({
  initialAmount = 25000,
  onClose,
  onSubmit,
  title = "Quotation",
}: {
  initialAmount?: number;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  title?: string;
}) {
  const id = useId();
  const [raw, setRaw] = useState(String(initialAmount));
  const amount = Number(raw.replace(/[^\d]/g, "")) || 0;

  return (
    <Scrim onClose={onClose} labelledBy={id}>
      <div className="hw-modal">
        <h2 id={id} className="hw-modal__title">
          {title}
        </h2>
        <div className="hw-modal__field">
          <label className="hw-modal__label" htmlFor={`${id}-amt`}>
            Enter Amount
          </label>
          <Input
            id={`${id}-amt`}
            inputMode="numeric"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="NGN0.0"
          />
        </div>
        <div className="hw-modal__actions">
          <Button variant="secondary" block onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            block
            disabled={amount <= 0}
            onClick={() => onSubmit(amount)}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Scrim>
  );
}

/** Customer: Review Quote → Accept / Counter Offer / Cancel */
export function ReviewQuoteModal({
  amount,
  onClose,
  onAccept,
  onCounter,
}: {
  amount: number;
  onClose: () => void;
  onAccept: () => void;
  onCounter: () => void;
}) {
  const id = useId();
  return (
    <Scrim onClose={onClose} labelledBy={id}>
      <div className="hw-modal">
        <h2 id={id} className="hw-modal__title">
          Review Quote
        </h2>
        <p className="hw-modal__body">
          The provider quoted <strong>{formatNaira(amount)}</strong> for this job.
          Accept to proceed to payment, or send a counter offer.
        </p>
        <div className="hw-modal__actions--stack hw-modal__actions">
          <Button variant="primary" block onClick={onAccept}>
            Accept
          </Button>
          <Button variant="secondary" block onClick={onCounter}>
            Counter Offer
          </Button>
          <Button variant="secondary" block onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Scrim>
  );
}

/** Customer counter-offer amount */
export function CounterOfferModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (amount: number) => void;
}) {
  const id = useId();
  const [raw, setRaw] = useState("");
  const amount = Number(raw.replace(/[^\d]/g, "")) || 0;
  return (
    <Scrim onClose={onClose} labelledBy={id}>
      <div className="hw-modal">
        <h2 id={id} className="hw-modal__title">
          Counter Offer
        </h2>
        <div className="hw-modal__field">
          <label className="hw-modal__label" htmlFor={`${id}-amt`}>
            Amount
          </label>
          <Input
            id={`${id}-amt`}
            inputMode="numeric"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="NGN0.0"
          />
        </div>
        <div className="hw-modal__actions">
          <Button variant="secondary" block onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            block
            disabled={amount <= 0}
            onClick={() => onSubmit(amount)}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Scrim>
  );
}

/** Customer: pay with card / transfer */
export function PaymentModal({
  amount,
  onClose,
  onPaid,
}: {
  amount: number;
  onClose: () => void;
  onPaid: (method: "card" | "transfer") => void;
}) {
  const id = useId();
  const [method, setMethod] = useState<"card" | "transfer">("card");
  return (
    <Scrim onClose={onClose} labelledBy={id}>
      <div className="hw-modal">
        <h2 id={id} className="hw-modal__title">
          Make Payment
        </h2>
        <p className="hw-modal__body">
          Pay {formatNaira(amount)}. Funds are held in escrow until you confirm
          the job is complete.
        </p>
        <div className="hw-modal__pay-options">
          <button
            type="button"
            className={
              "hw-modal__pay-opt" + (method === "card" ? " is-selected" : "")
            }
            onClick={() => setMethod("card")}
          >
            Pay with Card
          </button>
          <button
            type="button"
            className={
              "hw-modal__pay-opt" + (method === "transfer" ? " is-selected" : "")
            }
            onClick={() => setMethod("transfer")}
          >
            Pay with Transfer
          </button>
        </div>
        <div className="hw-modal__actions">
          <Button variant="secondary" block onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" block onClick={() => onPaid(method)}>
            Confirm
          </Button>
        </div>
      </div>
    </Scrim>
  );
}

export function PaymentSuccessModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const id = useId();
  return (
    <Scrim onClose={onClose} labelledBy={id}>
      <div className="hw-modal">
        <h2 id={id} className="hw-modal__title">
          Payment Successful
        </h2>
        <p className="hw-modal__body">
          Your payment is secured in escrow. Funds will only be released when the
          work is completed and confirmed by you.
        </p>
        <Button variant="primary" block onClick={onClose}>
          Done
        </Button>
      </div>
    </Scrim>
  );
}

/** Vendor or customer: confirm mark complete */
export function ConfirmCompleteModal({
  amount,
  role,
  onClose,
  onConfirm,
}: {
  amount: number;
  role: "customer" | "vendor";
  onClose: () => void;
  onConfirm: () => void;
}) {
  const id = useId();
  const body =
    role === "vendor"
      ? `Are you sure the job has been completed and you want to request the payment of ${formatNaira(amount)} from the Escrow?`
      : `Are you sure the job has been completed and you want to release the payment of ${formatNaira(amount)} to the provider?`;
  return (
    <Scrim onClose={onClose} labelledBy={id}>
      <div className="hw-modal">
        <h2 id={id} className="hw-modal__title">
          Confirm Job Completion
        </h2>
        <p className="hw-modal__body">{body}</p>
        <div className="hw-modal__actions">
          <Button variant="secondary" block onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" block onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </Scrim>
  );
}

/** Customer post-completion review */
export function ReviewModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (rating: number, text: string) => void;
}) {
  const id = useId();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  return (
    <Scrim onClose={onClose} labelledBy={id}>
      <div className="hw-modal">
        <h2 id={id} className="hw-modal__title">
          Rate Your Experience
        </h2>
        <div className="hw-modal__stars" role="group" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={"hw-modal__star" + (n > rating ? " is-off" : "")}
              onClick={() => setRating(n)}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
            >
              <hw-icon
                suppressHydrationWarning
                name="star"
                variant="filled"
                size="28"
              ></hw-icon>
            </button>
          ))}
        </div>
        <div className="hw-modal__field">
          <label className="hw-modal__label" htmlFor={`${id}-txt`}>
            Your review
          </label>
          <textarea
            id={`${id}-txt`}
            className="hw-input"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your experience…"
          />
        </div>
        <div className="hw-modal__actions">
          <Button variant="secondary" block onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            block
            disabled={rating < 1}
            onClick={() => onSubmit(rating, text)}
          >
            Submit Review
          </Button>
        </div>
      </div>
    </Scrim>
  );
}
