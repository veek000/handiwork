"use client";

import { useState } from "react";
import type { Rating } from "@/types";
import { SidePanel } from "@/components/SidePanel";
import { Button } from "@/components/Button";

/**
 * ReviewPanel — "Rate Your Experience" (Figma 6619:6146 / mobile 6619:20684) in the
 * shared SidePanel: 5 tappable stars + "Write review", Submit Review → "Thanks for the
 * Feedback" (illustration-22, 6619:6389 / 6619:20852) with Done. Opens prefilled for
 * Edit Review. Submit needs a star rating. Styling: .hw-rate* + .hw-booked*.
 */
export function ReviewPanel({
  initialRating,
  initialText = "",
  onSubmit,
  onClose,
}: {
  initialRating?: Rating;
  initialText?: string;
  onSubmit: (rating: Rating, text: string) => void;
  onClose: () => void;
}) {
  const [rating, setRating] = useState<number>(initialRating ?? 0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState(initialText);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <SidePanel
        centered
        ariaLabel="Thanks for the Feedback"
        onClose={onClose}
        footer={<Button variant="primary" block onClick={onClose}>Done</Button>}
      >
        <div className="hw-booked" role="status">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hw-booked__art" src="/assets/illustration/illustration-22.svg" alt="" width={128} height={128} />
          <h2 className="hw-booked__title hw-booked__title--s">Thanks for the Feedback</h2>
          <p className="hw-booked__text hw-booked__text--s">Your review has been submitted</p>
        </div>
      </SidePanel>
    );
  }

  const shown = hover || rating;
  return (
    <SidePanel
      centered
      ariaLabel="Rate Your Experience"
      onClose={onClose}
      footer={
        <Button
          variant="primary"
          block
          disabled={rating < 1}
          onClick={() => {
            onSubmit(rating as Rating, text.trim());
            setDone(true);
          }}
        >
          Submit Review
        </Button>
      }
    >
      <div className="hw-rate">
        <h2 className="hw-booked__title hw-booked__title--s">Rate Your Experience</h2>
        <div className="hw-rate__stars" role="radiogroup" aria-label="Star rating" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              className={"hw-rate__star" + (n <= shown ? " is-on" : "")}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
            >
              <hw-icon suppressHydrationWarning name="star" variant="filled" size="24"></hw-icon>
            </button>
          ))}
        </div>
        <textarea
          className="hw-input hw-rate__text"
          rows={4}
          placeholder="Write review"
          aria-label="Write review"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
    </SidePanel>
  );
}

export default ReviewPanel;
