"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageNav } from "@/components/PageNav";
import { FAQS, FAQ_TOPICS, SUPPORT_CONTACT, type FaqTopic } from "@/data/faqs";

/**
 * Help & Support (both roles) — not in the Figma capture; built from the dashboard
 * parts. A search over the FAQs, topic chips, the questions as an accordion (native
 * <details>, so it works without JS and with the keyboard), and contact cards (email,
 * phone, feedback). Role-specific questions only show to that role. Styling: .hw-help*.
 */
export function HelpScreen({ role }: { role: "customer" | "vendor" }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<FaqTopic | "all">("all");

  const mine = useMemo(() => FAQS.filter((f) => !f.for || f.for === role), [role]);
  const topics = FAQ_TOPICS.filter((t) => mine.some((f) => f.topic === t.value));
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = mine.filter(
    (f) =>
      (topic === "all" || f.topic === topic) &&
      words.every((w) => (f.q + " " + f.a).toLowerCase().includes(w)),
  );

  return (
    <div className="hw-jobs hw-help">
      <PageNav backHref={`/${role}`} crumbs={[{ label: "Home", href: `/${role}` }, { label: "Help & Support" }]} />
      <header className="hw-settings__head">
        <h1 className="hw-jobs__title">Help &amp; Support</h1>
        <p className="hw-settings__lede">Answers to common questions, and how to reach our team.</p>
      </header>

      <div className="hw-help__search" role="search">
        <hw-icon suppressHydrationWarning name="magnifying-glass" variant="hollow" size="18"></hw-icon>
        <label htmlFor="help-q" className="hw-sr-only">Search help</label>
        <input id="help-q" className="hw-help__input" type="search" placeholder="Search for a question, e.g. escrow"
          value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="hw-help__topics" role="group" aria-label="Filter by topic">
        {[{ value: "all" as const, label: "All" }, ...topics].map((t) => (
          <button key={t.value} type="button" aria-pressed={topic === t.value}
            className={"hw-help__topic" + (topic === t.value ? " is-active" : "")} onClick={() => setTopic(t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      <section aria-labelledby="help-faq-title" className="hw-help__faqs">
        <h2 id="help-faq-title" className="hw-sr-only">Frequently asked questions</h2>
        <p className="hw-sr-only" role="status">{shown.length} question{shown.length === 1 ? "" : "s"} shown</p>
        {shown.length ? (
          shown.map((f) => (
            <details key={f.q} className="hw-help__faq">
              <summary className="hw-help__q">
                {f.q}
                <hw-icon suppressHydrationWarning name="angle-down" variant="hollow" size="16"></hw-icon>
              </summary>
              <p className="hw-help__a">{f.a}</p>
            </details>
          ))
        ) : (
          <div className="hw-help__empty">
            <p className="hw-settings__row-title">No answers match &ldquo;{query.trim()}&rdquo;</p>
            <p className="hw-settings__row-desc">Try other words, or contact us below.</p>
            <button type="button" className="hw-feedback__link" onClick={() => { setQuery(""); setTopic("all"); }}>
              Clear search
            </button>
          </div>
        )}
      </section>

      <section aria-labelledby="help-contact-title" className="hw-help__contact">
        <h2 id="help-contact-title" className="hw-help__subtitle">Still need help?</h2>
        <p className="hw-settings__row-desc">{SUPPORT_CONTACT.hours}. For a problem with a job, include the job and provider name.</p>
        <div className="hw-help__cards">
          <a className="hw-help__card" href={`mailto:${SUPPORT_CONTACT.email}`}>
            <span className="hw-settings__row-icon" aria-hidden="true">
              <hw-icon suppressHydrationWarning name="envelope" variant="hollow" size="20"></hw-icon>
            </span>
            <span className="hw-settings__row-title">Email us</span>
            <span className="hw-settings__row-desc">{SUPPORT_CONTACT.email}</span>
          </a>
          <a className="hw-help__card" href={SUPPORT_CONTACT.phoneHref}>
            <span className="hw-settings__row-icon" aria-hidden="true">
              <hw-icon suppressHydrationWarning name="phone" variant="hollow" size="20"></hw-icon>
            </span>
            <span className="hw-settings__row-title">Call us</span>
            <span className="hw-settings__row-desc">{SUPPORT_CONTACT.phone}</span>
          </a>
          <Link className="hw-help__card" href={`/${role}/feedback`}>
            <span className="hw-settings__row-icon" aria-hidden="true">
              <hw-icon suppressHydrationWarning name="comment" variant="hollow" size="20"></hw-icon>
            </span>
            <span className="hw-settings__row-title">Send feedback</span>
            <span className="hw-settings__row-desc">Ideas, bugs or praise for the team</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HelpScreen;
