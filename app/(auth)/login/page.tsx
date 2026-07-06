"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { RoleToggle, type AuthRole } from "@/components/auth/RoleToggle";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialButton } from "@/components/auth/SocialButton";
import { useRoleRedirect } from "../useRoleRedirect";

// One role-agnostic login screen (Figma: Customer Login 289:3541, identical to the
// vendor frame apart from the active toggle + subtitle). Real Convex Auth: email/password
// via the Password provider + Google/Facebook OAuth. On success, useRoleRedirect routes to
// the account's role dashboard (the toggle only drives the subtitle now, not routing).
// Layout: __top holds the fields; __foot holds the button + everything below it.
const SUBTITLE: Record<AuthRole, string> = {
  customer: "Your projects are waiting. Log in to continue connecting with skilled artisans.",
  vendor: "Your next job is here. Log in to manage your bookings and grow your business.",
};

export default function LoginPage() {
  const { signIn } = useAuthActions();
  useRoleRedirect(); // routes to the dashboard once authenticated (password or OAuth)
  const [role, setRole] = useState<AuthRole>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn("password", { email, password, flow: "signIn" });
      // On success the provider flips to authenticated → useRoleRedirect navigates.
    } catch {
      setError("Invalid email or password. Please try again.");
      setSubmitting(false);
    }
  }

  async function handleOAuth(provider: "google" | "facebook") {
    setError(null);
    try {
      await signIn(provider); // redirects to the provider, returns authenticated
    } catch {
      setError(`Couldn't continue with ${provider}. Please try again.`);
    }
  }

  return (
    <AuthShell>
      <form className="hw-auth__form" onSubmit={handleSubmit}>
        <div className="hw-auth__top">
          <RoleToggle value={role} onChange={setRole} />

          <header className="hw-auth__intro">
            <h1 className="hw-heading-xl">Login</h1>
            <p className="hw-auth__subtitle">{SUBTITLE[role]}</p>
          </header>

          <div className="hw-field">
            <label htmlFor="login-email">Email</label>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="hw-field">
            <label htmlFor="login-password">Password</label>
            <PasswordInput
              id="login-password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Link href="#" className="hw-link hw-auth__forgot">Forgot password ?</Link>
          </div>

          {error ? <p className="hw-auth__error" role="alert">{error}</p> : null}
        </div>

        <div className="hw-auth__foot">
          <Button type="submit" variant="primary" block disabled={submitting}>
            {submitting ? "Logging in…" : "Login"}
          </Button>

          <div className="hw-divider">Or Login with</div>

          <div className="hw-social">
            <SocialButton provider="facebook" onClick={() => handleOAuth("facebook")} />
            <SocialButton provider="google" onClick={() => handleOAuth("google")} />
            {/* Apple deferred (paid Apple Developer account) — disabled for now. */}
            <SocialButton provider="apple" disabled title="Apple sign-in coming soon" />
          </div>

          <p className="hw-auth__signup">
            Don&apos;t have an account? <Link href="/signup" className="hw-link">Sign up</Link>
          </p>
        </div>
      </form>

      <p className="hw-auth__footer">© Handiwork 2025</p>
    </AuthShell>
  );
}
