"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

// Forgot password: emails a reset link (convex/ResendPasswordReset.ts). The confirmation
// is the same whether or not the email has an account (or is a Google-only account), so
// the page can't be used to find out who is registered. Not in the Figma; built from the
// login screen's parts.
export default function ForgotPasswordPage() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const address = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setError("Enter the email address you signed up with.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signIn("password", { email: address, flow: "reset" });
    } catch {
      // Unknown account / no password: same answer as success (see above).
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setError("You're offline. Check your connection and try again.");
        setSubmitting(false);
        return;
      }
    }
    setSubmitting(false);
    setSentTo(address);
  }

  return (
    <AuthShell>
      {sentTo ? (
        <div className="hw-auth__form">
          <div className="hw-auth__top">
            <header className="hw-auth__intro">
              <h1 className="hw-heading-xl">Check your email</h1>
              <p className="hw-auth__subtitle" role="status">
                If there&apos;s a Handiwork account for <b>{sentTo}</b>, we&apos;ve sent it a link to choose a new
                password. The link expires in 15 minutes.
              </p>
            </header>
            <p className="hw-auth__subtitle">
              Nothing there? Check spam, or{" "}
              <button type="button" className="hw-link hw-auth__inline-btn" onClick={() => setSentTo(null)}>
                try again
              </button>
              . If you signed up with Google, use &ldquo;Continue with Google&rdquo; on the login page instead.
            </p>
          </div>
          <div className="hw-auth__foot">
            <Link href="/login" className="hw-button hw-button--primary hw-button--block">
              Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <form className="hw-auth__form" onSubmit={handleSubmit} noValidate>
          <div className="hw-auth__top">
            <header className="hw-auth__intro">
              <h1 className="hw-heading-xl">Forgot password</h1>
              <p className="hw-auth__subtitle">
                Enter the email you signed up with and we&apos;ll send you a link to choose a new password.
              </p>
            </header>

            <div className="hw-field">
              <label htmlFor="fp-email">Email</label>
              <Input
                id="fp-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter Email Address"
                value={email}
                aria-invalid={error ? true : undefined}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error ? <p className="hw-auth__error" role="alert">{error}</p> : null}
          </div>

          <div className="hw-auth__foot">
            <Button type="submit" variant="primary" block disabled={submitting}>
              {submitting ? "Sending…" : "Send Reset Link"}
            </Button>
            <p className="hw-auth__signup">
              Remembered it? <Link href="/login" className="hw-link">Back to login</Link>
            </p>
          </div>
        </form>
      )}

      <p className="hw-auth__footer">© Handiwork 2025</p>
    </AuthShell>
  );
}
