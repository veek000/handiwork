"use client";

import { useState, type ReactNode } from "react";
import { SidePanel } from "@/components/SidePanel";
import { Button } from "@/components/Button";
import { FormStatus, IDLE, type Status } from "@/components/FormStatus";
import { errorMessage } from "@/lib/convexApi";

/** Shared pieces for the /admin screens. Styling: .hw-admin*. */

export const naira = (n: number | null | undefined) => (n == null ? "—" : `NGN${n.toLocaleString("en-US")}`);

export function shortDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
}

export function dateTime(isoString: string) {
  return new Date(isoString).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

export function AdminHead({ title, lede, children }: { title: string; lede?: string; children?: ReactNode }) {
  return (
    <header className="hw-admin__head">
      <div>
        <h1 className="hw-admin__title">{title}</h1>
        {lede ? <p className="hw-admin__lede">{lede}</p> : null}
      </div>
      {children ? <div className="hw-admin__tools">{children}</div> : null}
    </header>
  );
}

const TONE: Record<string, "ok" | "warn" | "bad" | "info" | "muted"> = {
  verified: "ok",
  completed: "ok",
  released: "ok",
  resolved: "ok",
  active: "ok",
  pending: "warn",
  quoted: "info",
  in_progress: "info",
  marked_completed: "warn",
  held: "info",
  rejected: "bad",
  cancelled: "muted",
  refunded: "muted",
  failed: "bad",
  suspended: "bad",
  hidden: "bad",
  archived: "muted",
  admin: "info",
  demo: "muted",
};

export function Pill({ value, label }: { value: string; label?: string }) {
  return <span className={`hw-admin__pill hw-admin__pill--${TONE[value] ?? "muted"}`}>{label ?? value.replace(/_/g, " ")}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="hw-admin__empty">{children}</p>;
}

/** Search box + filter chips row. */
export function Toolbar({
  search,
  onSearch,
  placeholder = "Search",
  filters,
  filter,
  onFilter,
}: {
  search?: string;
  onSearch?: (v: string) => void;
  placeholder?: string;
  filters?: { value: string; label: string }[];
  filter?: string;
  onFilter?: (v: string) => void;
}) {
  return (
    <div className="hw-admin__toolbar">
      {onSearch ? (
        <label className="hw-admin__search">
          <hw-icon suppressHydrationWarning name="magnifying-glass" variant="hollow" size="16"></hw-icon>
          <span className="hw-sr-only">{placeholder}</span>
          <input type="search" placeholder={placeholder} value={search} onChange={(e) => onSearch(e.target.value)} />
        </label>
      ) : null}
      {filters ? (
        <div className="hw-admin__chips" role="group" aria-label="Filter">
          {filters.map((f) => (
            <button key={f.value} type="button" aria-pressed={filter === f.value}
              className={"hw-help__topic" + (filter === f.value ? " is-active" : "")} onClick={() => onFilter?.(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * NotePanel — confirm an admin action, optionally with a reason (required when
 * `noteRequired`). Shows the server's error message if the action fails.
 */
export function NotePanel({
  title,
  text,
  confirmLabel,
  danger = false,
  noteLabel = "Note (saved in the audit log)",
  noteRequired = false,
  onConfirm,
  onClose,
}: {
  title: string;
  text: string;
  confirmLabel: string;
  danger?: boolean;
  noteLabel?: string;
  noteRequired?: boolean;
  onConfirm: (note: string) => Promise<unknown>;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>(IDLE);
  async function confirm() {
    setStatus({ kind: "busy" });
    try {
      await onConfirm(note.trim());
      onClose();
    } catch (err) {
      setStatus({ kind: "error", text: errorMessage(err) });
    }
  }
  return (
    <SidePanel
      title={title}
      onClose={onClose}
      footer={
        <div className="hw-form__stack">
          <FormStatus status={status} />
          <Button variant="secondary" block className={danger ? "hw-settings__danger-btn" : undefined}
            disabled={status.kind === "busy" || (noteRequired && note.trim().length < 3)} onClick={confirm}>
            {status.kind === "busy" ? "Working…" : confirmLabel}
          </Button>
          <Button variant="primary" block onClick={onClose}>Cancel</Button>
        </div>
      }
    >
      <div className="hw-settings__form">
        <p className="hw-settings__row-desc">{text}</p>
        <div className="hw-field">
          <label htmlFor="hw-admin-note">{noteLabel}{noteRequired ? "" : " (optional)"}</label>
          <textarea id="hw-admin-note" className="hw-input hw-settings__textarea" rows={4} maxLength={500} value={note}
            onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
    </SidePanel>
  );
}
