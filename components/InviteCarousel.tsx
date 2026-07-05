"use client";

import { useRef, useState } from "react";
import { formatNaira } from "@/lib/time";

/**
 * InviteCarousel — the two "Invite your friends" promo cards. On desktop they sit in a
 * 2-column grid; on mobile they become a horizontal scroll-snap row (one card per view,
 * the next peeking) with pagination dots that track the swipe (Figma 290:4555). The dots
 * + scroll tracking are why this is a client component — the rest of Home stays server.
 * Styling: .hw-invite*.
 */
const CARDS = [
  { key: "light", variant: "light", art: "/assets/illustration/illustration-22.svg" },
  { key: "dark", variant: "dark", art: "/assets/illustration/illustration-23.svg" },
] as const;

export function InviteCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Active dot = the card whose left edge is closest to the current scroll position.
  // Robust to the peek width + gap (no fixed card-width math).
  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - el.scrollLeft);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  }

  function goTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[i] as HTMLElement | undefined;
    if (card) el.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
  }

  return (
    <section className="hw-invite">
      <div className="hw-invite__track" ref={trackRef} onScroll={onScroll}>
        {CARDS.map((c) => (
          <div key={c.key} className={`hw-invite__card hw-invite__card--${c.variant}`}>
            <div className="hw-invite__text">
              <div className="hw-invite__copy">
                <p className="hw-invite__title">Invite your friends &amp; get up to {formatNaira(2000)}</p>
                <p className="hw-invite__sub">
                  Introduce your friends to the easiest way to find and hire professionals for your needs.
                </p>
              </div>
              <button type="button" className="hw-invite__btn">
                Invite Friends
                <hw-icon suppressHydrationWarning name="angle-right" variant="hollow" size="12"></hw-icon>
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hw-invite__art" src={c.art} alt="" aria-hidden="true" />
          </div>
        ))}
      </div>

      {/* Mobile-only pagination dots (hidden on desktop via CSS). */}
      <div className="hw-invite__dots" role="tablist" aria-label="Invite promotions">
        {CARDS.map((c, i) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Go to promotion ${i + 1}`}
            className={"hw-invite__dot" + (i === active ? " is-active" : "")}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </section>
  );
}

export default InviteCarousel;
