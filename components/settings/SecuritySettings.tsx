"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SidePanel } from "@/components/SidePanel";
import { FormStatus, IDLE, type Status } from "@/components/FormStatus";
import { api, errorMessage } from "@/lib/convexApi";

const MIN_PASSWORD = 8;
const PROVIDER_LABEL: Record<string, string> = { google: "Google", facebook: "Facebook", apple: "Apple" };

/** Change password (current → new + confirm). Other sessions are signed out on success. */
function ChangePassword() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [status, setStatus] = useState<Status>(IDLE);
  const changePassword = useAction(api.changePassword);
  const set = (k: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (status.kind !== "busy") setStatus(IDLE);
  };

  const tooShort = form.next.length > 0 && form.next.length < MIN_PASSWORD;
  const mismatch = form.confirm.length > 0 && form.confirm !== form.next;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.current) return setStatus({ kind: "error", text: "Enter your current password." });
    if (form.next.length < MIN_PASSWORD) return setStatus({ kind: "error", text: `Use at least ${MIN_PASSWORD} characters.` });
    if (form.next !== form.confirm) return setStatus({ kind: "error", text: "The new passwords don't match." });
    setStatus({ kind: "busy" });
    try {
      await changePassword({ current: form.current, next: form.next });
      setForm({ current: "", next: "", confirm: "" });
      setStatus({ kind: "ok", text: "Password changed. Your other devices have been signed out." });
    } catch (err) {
      setStatus({ kind: "error", text: errorMessage(err, "We couldn't change your password. Please try again.") });
    }
  }

  return (
    <form className="hw-settings__form" onSubmit={submit} noValidate>
      <div className="hw-field">
        <label htmlFor="pw-current">Current Password</label>
        <PasswordInput id="pw-current" autoComplete="current-password" placeholder="Enter current password"
          value={form.current} onChange={(e) => set("current")(e.target.value)} />
        <p className="hw-settings__hint">
          Forgot it? <Link href="/forgot-password" className="hw-link">Reset it by email</Link> instead.
        </p>
      </div>
      <div className="hw-field-row">
        <div className="hw-field">
          <label htmlFor="pw-next">New Password</label>
          <PasswordInput id="pw-next" autoComplete="new-password" placeholder="Enter new password"
            value={form.next} aria-invalid={tooShort || undefined} aria-describedby="pw-next-hint"
            onChange={(e) => set("next")(e.target.value)} />
          <p id="pw-next-hint" className={"hw-settings__hint" + (tooShort ? " is-error" : "")}>
            At least {MIN_PASSWORD} characters.
          </p>
        </div>
        <div className="hw-field">
          <label htmlFor="pw-confirm">Confirm New Password</label>
          <PasswordInput id="pw-confirm" autoComplete="new-password" placeholder="Re-enter new password"
            value={form.confirm} aria-invalid={mismatch || undefined} aria-describedby={mismatch ? "pw-confirm-err" : undefined}
            onChange={(e) => set("confirm")(e.target.value)} />
          {mismatch ? <p id="pw-confirm-err" className="hw-settings__fielderr">Passwords don&apos;t match.</p> : null}
        </div>
      </div>
      <div className="hw-settings__actions">
        <FormStatus status={status} />
        <div className="hw-settings__buttons">
          <Button type="submit" variant="primary" disabled={status.kind === "busy" || !form.current || !form.next || !form.confirm}>
            {status.kind === "busy" ? "Updating…" : "Update Password"}
          </Button>
        </div>
      </div>
    </form>
  );
}

/** Delete-account confirmation: type DELETE, then the account is removed and signed out. */
function DeleteAccountPanel({ onClose }: { onClose: () => void }) {
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<Status>(IDLE);
  const deleteAccount = useAction(api.deleteAccount);
  const { signOut } = useAuthActions();
  const router = useRouter();

  async function confirm() {
    setStatus({ kind: "busy" });
    try {
      await deleteAccount({ confirm: typed.trim() });
      try {
        await signOut();
      } catch {
        /* the session is already gone server-side */
      }
      router.replace("/");
    } catch (err) {
      setStatus({ kind: "error", text: errorMessage(err, "We couldn't delete your account. Please try again.") });
    }
  }

  return (
    <SidePanel
      title="Delete Account"
      onClose={onClose}
      footer={
        <div className="hw-form__stack">
          <Button variant="secondary" block className="hw-settings__danger-btn"
            disabled={typed.trim() !== "DELETE" || status.kind === "busy"} onClick={confirm}>
            {status.kind === "busy" ? "Deleting…" : "Delete My Account"}
          </Button>
          <Button variant="primary" block onClick={onClose}>Keep My Account</Button>
        </div>
      }
    >
      <div className="hw-settings__form">
        <p className="hw-settings__row-desc">
          This permanently removes your profile and sign-in details, and signs you out on every device.
          It can&apos;t be undone. Finish or cancel any open jobs first.
        </p>
        <div className="hw-field">
          <label htmlFor="del-confirm">Type DELETE to confirm</label>
          <Input id="del-confirm" autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="DELETE" />
        </div>
        <FormStatus status={status} />
      </div>
    </SidePanel>
  );
}

/**
 * Settings → Security: how the account signs in, change password (email accounts),
 * sign out of other devices, and the delete-account danger zone. Styling: .hw-settings*.
 */
export function SecuritySettings() {
  const methods = useQuery(api.signInMethods, {});
  const [sessions, setSessions] = useState<Status>(IDLE);
  const [deleting, setDeleting] = useState(false);
  const signOutOthers = useAction(api.signOutOtherDevices);

  const hasPassword = methods?.includes("password") ?? false;
  const social = (methods ?? []).filter((m) => m !== "password").map((m) => PROVIDER_LABEL[m] ?? m);
  const methodLabel =
    methods === undefined ? "Checking…" : methods === null ? "Not signed in" : [hasPassword ? "Email & password" : null, ...social].filter(Boolean).join(" · ");

  async function endOtherSessions() {
    setSessions({ kind: "busy" });
    try {
      await signOutOthers({});
      setSessions({ kind: "ok", text: "Signed out of all other devices." });
    } catch (err) {
      setSessions({ kind: "error", text: errorMessage(err) });
    }
  }

  return (
    <div className="hw-settings__stack">
      <section className="hw-settings__group" aria-labelledby="sec-signin">
        <h3 id="sec-signin" className="hw-settings__group-title">Sign-in method</h3>
        <div className="hw-settings__row">
          <span className="hw-settings__row-icon" aria-hidden="true">
            <hw-icon suppressHydrationWarning name="key" variant="hollow" size="20"></hw-icon>
          </span>
          <div className="hw-settings__row-text">
            <p className="hw-settings__row-title">{methodLabel}</p>
            <p className="hw-settings__row-desc">
              {methods == null
                ? "Log in to manage how you sign in."
                : hasPassword
                ? "You sign in with your email and password."
                : `You sign in with ${social.join(" or ")}, so there's no Handiwork password to manage.`}
            </p>
          </div>
        </div>
      </section>

      {hasPassword ? (
        <section className="hw-settings__group" aria-labelledby="sec-password">
          <h3 id="sec-password" className="hw-settings__group-title">Change password</h3>
          <ChangePassword />
        </section>
      ) : null}

      <section className="hw-settings__group" aria-labelledby="sec-sessions">
        <h3 id="sec-sessions" className="hw-settings__group-title">Devices</h3>
        <div className="hw-settings__row">
          <span className="hw-settings__row-icon" aria-hidden="true">
            <hw-icon suppressHydrationWarning name="laptop" variant="hollow" size="20"></hw-icon>
          </span>
          <div className="hw-settings__row-text">
            <p className="hw-settings__row-title">Sign out other devices</p>
            <p className="hw-settings__row-desc">Lost a phone or used a shared computer? End every session except this one.</p>
          </div>
          <Button variant="secondary" disabled={sessions.kind === "busy"} onClick={endOtherSessions}>
            {sessions.kind === "busy" ? "Signing out…" : "Sign Out"}
          </Button>
        </div>
        <FormStatus status={sessions} />
      </section>

      <section className="hw-settings__group hw-settings__danger" aria-labelledby="sec-delete">
        <h3 id="sec-delete" className="hw-settings__group-title">Delete account</h3>
        <div className="hw-settings__row">
          <span className="hw-settings__row-icon" aria-hidden="true">
            <hw-icon suppressHydrationWarning name="trash" variant="hollow" size="20"></hw-icon>
          </span>
          <div className="hw-settings__row-text">
            <p className="hw-settings__row-title">Permanently delete your account</p>
            <p className="hw-settings__row-desc">Removes your profile and sign-in details. This can&apos;t be undone.</p>
          </div>
          <Button variant="secondary" className="hw-settings__danger-btn" onClick={() => setDeleting(true)}>Delete</Button>
        </div>
      </section>

      {deleting ? <DeleteAccountPanel onClose={() => setDeleting(false)} /> : null}
    </div>
  );
}

export default SecuritySettings;
