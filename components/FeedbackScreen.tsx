"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { PageNav } from "@/components/PageNav";
import { Button } from "@/components/Button";
import { FormStatus, IDLE, type Status } from "@/components/FormStatus";
import { api, errorMessage, type FeedbackKind } from "@/lib/convexApi";

const KINDS: { value: FeedbackKind; label: string; icon: string }[] = [
  { value: "suggestion", label: "Suggestion", icon: "lightbulb" },
  { value: "problem", label: "Problem", icon: "bug" },
  { value: "compliment", label: "Compliment", icon: "heart" },
  { value: "other", label: "Other", icon: "comment" },
];

const PLACEHOLDER: Record<FeedbackKind, string> = {
  suggestion: "What would make Handiwork better for you?",
  problem: "What happened, and what did you expect to happen?",
  compliment: "What did you enjoy?",
  other: "What's on your mind?",
};

const MIN = 10;
const MAX = 2000;

/**
 * Feedback (both roles) — not in the Figma capture; built from the dashboard parts.
 * Topic chips, an optional 1–5 star rating, the message (10–2,000 characters, counted)
 * and a "you can contact me" choice. Saved to Convex (feedback:submit); on success the
 * form is replaced by a thank-you state. Problems with a specific job point to Help &
 * Support, which can act faster. Styling: .hw-feedback* + .hw-settings__card.
 */
export function FeedbackScreen({ role }: { role: "customer" | "vendor" }) {
  const [kind, setKind] = useState<FeedbackKind>("suggestion");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");
  const [canContact, setCanContact] = useState(true);
  const [status, setStatus] = useState<Status>(IDLE);
  const [sent, setSent] = useState(false);
  const submit = useMutation(api.submitFeedback);

  const length = message.trim().length;
  const tooLong = message.length > MAX;

  async function send(e: FormEvent) {
    e.preventDefault();
    if (length < MIN) return setStatus({ kind: "error", text: `Tell us a little more (at least ${MIN} characters).` });
    if (tooLong) return setStatus({ kind: "error", text: `Keep it under ${MAX.toLocaleString()} characters.` });
    setStatus({ kind: "busy" });
    try {
      let page: string | undefined;
      try {
        const ref = document.referrer ? new URL(document.referrer) : null;
        page = ref && ref.origin === location.origin ? ref.pathname : undefined;
      } catch {
        page = undefined;
      }
      await submit({ kind, rating: rating || undefined, message: message.trim(), canContact, page });
      setSent(true);
      setStatus(IDLE);
    } catch (err) {
      setStatus({ kind: "error", text: errorMessage(err, "We couldn't send your feedback. Please try again.") });
    }
  }

  function reset() {
    setKind("suggestion");
    setRating(0);
    setMessage("");
    setSent(false);
  }

  const shown = hover || rating;

  return (
    <div className="hw-jobs hw-feedback">
      <PageNav backHref={`/${role}`} crumbs={[{ label: "Home", href: `/${role}` }, { label: "Feedback" }]} />
      <header className="hw-settings__head">
        <h1 className="hw-jobs__title">Feedback</h1>
        <p className="hw-settings__lede">Tell us what&apos;s working and what isn&apos;t. We read every message.</p>
      </header>

      <div className="hw-feedback__layout">
        <section className="hw-settings__card" aria-label="Send feedback">
          {sent ? (
            <div className="hw-feedback__done" role="status">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/illustration/illustration-20.svg" alt="" width={128} height={128} />
              <h2 className="hw-feedback__done-title">Thanks for your feedback</h2>
              <p className="hw-settings__row-desc">
                {canContact
                  ? "It's with the team now. If we need more detail, we'll email you."
                  : "It's with the team now. We use every message to decide what to fix and build next."}
              </p>
              <div className="hw-settings__buttons">
                <Button variant="secondary" onClick={reset}>Send More</Button>
                <Link className="hw-button hw-button--primary" href={`/${role}`}>Back to Home</Link>
              </div>
            </div>
          ) : (
            <form className="hw-settings__form" onSubmit={send} noValidate>
              <fieldset className="hw-feedback__fieldset">
                <legend className="hw-feedback__legend">What&apos;s it about?</legend>
                <div className="hw-feedback__kinds">
                  {KINDS.map((k) => (
                    <label key={k.value} className={"hw-feedback__kind" + (kind === k.value ? " is-active" : "")}>
                      <input type="radio" name="kind" value={k.value} checked={kind === k.value}
                        onChange={() => { setKind(k.value); setStatus(IDLE); }} />
                      <hw-icon suppressHydrationWarning name={k.icon} variant={kind === k.value ? "filled" : "hollow"} size="16"></hw-icon>
                      {k.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {kind === "problem" ? (
                <p className="hw-feedback__note">
                  <hw-icon suppressHydrationWarning name="circle-info" variant="filled" size="16"></hw-icon>
                  <span>
                    Problem with a job or a payment? <Link href={`/${role}/support`}>Contact support</Link> so we can sort it out quickly.
                  </span>
                </p>
              ) : null}

              <fieldset className="hw-feedback__fieldset">
                <legend className="hw-feedback__legend">How is Handiwork so far? <span className="hw-feedback__optional">(optional)</span></legend>
                <div className="hw-rate__stars hw-feedback__stars" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={rating === n}
                      aria-label={`${n} star${n === 1 ? "" : "s"}`}
                      className={"hw-rate__star" + (n <= shown ? " is-on" : "")}
                      onMouseEnter={() => setHover(n)} onClick={() => setRating(rating === n ? 0 : n)}>
                      <hw-icon suppressHydrationWarning name="star" variant="filled" size="24"></hw-icon>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="hw-field">
                <label htmlFor="fb-message">Your message</label>
                <textarea id="fb-message" className="hw-input hw-settings__textarea" rows={6} placeholder={PLACEHOLDER[kind]}
                  value={message} aria-invalid={tooLong || undefined} aria-describedby="fb-count"
                  onChange={(e) => { setMessage(e.target.value); if (status.kind === "error") setStatus(IDLE); }} />
                <p id="fb-count" className={"hw-settings__hint hw-settings__count" + (tooLong ? " is-over" : "")}>
                  {message.length.toLocaleString()} / {MAX.toLocaleString()}
                </p>
              </div>

              <label className="hw-feedback__check">
                <input type="checkbox" checked={canContact} onChange={(e) => setCanContact(e.target.checked)} />
                <span>You can email me about this feedback</span>
              </label>

              <div className="hw-settings__actions">
                <FormStatus status={status} />
                <div className="hw-settings__buttons">
                  <Button type="submit" variant="primary" disabled={status.kind === "busy" || length === 0}>
                    {status.kind === "busy" ? "Sending…" : "Send Feedback"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </section>

        <aside className="hw-feedback__aside" aria-label="Other ways to get help">
          <div className="hw-feedback__tip">
            <hw-icon suppressHydrationWarning name="headphones" variant="hollow" size="20"></hw-icon>
            <p className="hw-settings__row-title">Need help with a job?</p>
            <p className="hw-settings__row-desc">Our support team is available 24/7 for bookings, payments and disputes.</p>
            <Link className="hw-feedback__link" href={`/${role}/support`}>
              Go to Help &amp; Support
              <hw-icon suppressHydrationWarning name="angle-right" variant="hollow" size="14"></hw-icon>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default FeedbackScreen;
