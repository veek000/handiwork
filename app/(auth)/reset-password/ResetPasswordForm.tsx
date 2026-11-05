"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/Button";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useRoleRedirect } from "../useRoleRedirect";

const MIN_PASSWORD = 8;

// Choose a new password from the emailed link. On success Convex Auth signs this browser
// in (and every other session out), and useRoleRedirect takes the user to their
// dashboard. A used, expired or mangled link gets a clear way to request a new one.
export function ResetPasswordForm({ email, code }: { email: string; code: string }) {
  const { signIn } = useAuthActions();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [linkBroken, setLinkBroken] = useState(!email || !code);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  useRoleRedirect(done);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters.`);
    if (password !== confirm) return setError("The passwords don't match.");
    setError(null);
    setSubmitting(true);
    try {
      await signIn("password", { email, code, newPassword: password, flow: "reset-verification" });
      setDone(true);
    } catch {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setError("You're offline. Check your connection and try again.");
      } else {
        setLinkBroken(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      {linkBroken ? (
        <div className="hw-auth__form">
          <div className="hw-auth__top">
            <header className="hw-auth__intro">
              <h1 className="hw-heading-xl">Link expired</h1>
              <p className="hw-auth__subtitle" role="alert">
                This reset link has expired, was already used, or isn&apos;t complete. Links work once, for 15 minutes.
              </p>
            </header>
          </div>
          <div className="hw-auth__foot">
            <Link href="/forgot-password" className="hw-button hw-button--primary hw-button--block">
              Send a New Link
            </Link>
            <p className="hw-auth__signup">
              <Link href="/login" className="hw-link">Back to login</Link>
            </p>
          </div>
        </div>
      ) : done ? (
        <div className="hw-auth__form">
          <div className="hw-auth__top">
            <header className="hw-auth__intro">
              <h1 className="hw-heading-xl">Password updated</h1>
              <p className="hw-auth__subtitle" role="status">
                You&apos;re signed in, and any other devices have been signed out. Taking you to your dashboard…
              </p>
            </header>
          </div>
        </div>
      ) : (
        <form className="hw-auth__form" onSubmit={handleSubmit} noValidate>
          <div className="hw-auth__top">
            <header className="hw-auth__intro">
              <h1 className="hw-heading-xl">Choose a new password</h1>
              <p className="hw-auth__subtitle">
                For <b>{email}</b>. You&apos;ll be signed out everywhere else once it&apos;s changed.
              </p>
            </header>

            <div className="hw-field">
              <label htmlFor="rp-password">New Password</label>
              <PasswordInput
                id="rp-password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="hw-field">
              <label htmlFor="rp-confirm">Confirm New Password</label>
              <PasswordInput
                id="rp-confirm"
                autoComplete="new-password"
                placeholder="Re-enter new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {error ? <p className="hw-auth__error" role="alert">{error}</p> : null}
          </div>

          <div className="hw-auth__foot">
            <Button type="submit" variant="primary" block disabled={submitting || !password || !confirm}>
              {submitting ? "Saving…" : "Save New Password"}
            </Button>
          </div>
        </form>
      )}

      <p className="hw-auth__footer">© Handiwork 2025</p>
    </AuthShell>
  );
}
