"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Switch } from "@/components/Switch";
import { FormStatus, IDLE, type Status } from "@/components/FormStatus";
import { api, errorMessage, type NotificationPrefs } from "@/lib/convexApi";

type Row = { key: keyof NotificationPrefs; title: string; desc: string };

function rowsFor(role: "customer" | "vendor"): { heading: string; rows: Row[] }[] {
  const vendor = role === "vendor";
  return [
    {
      heading: "What to notify me about",
      rows: [
        {
          key: "jobUpdates",
          title: vendor ? "Job requests & updates" : "Job updates",
          desc: vendor
            ? "New service requests, accepted quotes, cancellations and completed jobs."
            : "Quotes from pros, booking confirmations and changes to your jobs.",
        },
        { key: "messages", title: "Messages", desc: "New chat messages about a job." },
        {
          key: "payments",
          title: "Payments",
          desc: vendor
            ? "Escrow deposits and payouts to your wallet."
            : "Escrow deposits, releases and refunds.",
        },
        {
          key: "reviews",
          title: "Reviews",
          desc: vendor ? "When a customer reviews your work." : "Reminders to review a finished job.",
        },
        { key: "tips", title: "Tips & offers", desc: "Product news, seasonal tips and occasional offers." },
      ],
    },
    {
      heading: "How to reach me",
      rows: [{ key: "email", title: "Email", desc: "Also send these to your email, not just in the app." }],
    },
  ];
}

/**
 * Settings → Notifications: one switch per topic plus an email channel switch. Each
 * switch saves on its own (optimistic; flips back with an error if the save fails).
 * Styling: .hw-settings__group / .hw-settings__row + Switch.
 */
export function NotificationSettings({ role, initial }: { role: "customer" | "vendor"; initial: NotificationPrefs }) {
  const [prefs, setPrefs] = useState(initial);
  const [status, setStatus] = useState<Status>(IDLE);
  const save = useMutation(api.updateNotificationPrefs);

  async function toggle(key: keyof NotificationPrefs, value: boolean) {
    const previous = prefs;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setStatus({ kind: "busy" });
    try {
      await save({ prefs: next });
      setStatus({ kind: "ok", text: "Preferences saved." });
    } catch (err) {
      setPrefs(previous);
      setStatus({ kind: "error", text: errorMessage(err, "We couldn't save that change. Please try again.") });
    }
  }

  return (
    <div className="hw-settings__form">
      {rowsFor(role).map((group) => (
        <section key={group.heading} className="hw-settings__group" aria-label={group.heading}>
          <h3 className="hw-settings__group-title">{group.heading}</h3>
          {group.rows.map((row) => (
            <div key={row.key} className="hw-settings__row">
              <div className="hw-settings__row-text">
                <p id={`np-${row.key}`} className="hw-settings__row-title">{row.title}</p>
                <p id={`np-${row.key}-d`} className="hw-settings__row-desc">{row.desc}</p>
              </div>
              <Switch checked={prefs[row.key]} onChange={(v) => toggle(row.key, v)}
                labelledBy={`np-${row.key}`} describedBy={`np-${row.key}-d`} />
            </div>
          ))}
        </section>
      ))}
      <p className="hw-settings__hint">
        Security alerts and messages about your payments are always sent, whatever you choose here.
      </p>
      <FormStatus status={status} />
    </div>
  );
}

export default NotificationSettings;
