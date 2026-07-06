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
import { Select } from "@/components/auth/Select";
import { PhoneInput } from "@/components/auth/PhoneInput";
import { OtpInput } from "@/components/auth/OtpInput";
import { AvatarUpload } from "@/components/auth/AvatarUpload";
import { StepperPanel } from "@/components/auth/StepperPanel";
import { StepProgress } from "@/components/auth/StepProgress";
import { ResendTimer } from "@/components/auth/ResendTimer";
import { NIGERIA_STATES, LAGOS_AREAS } from "@/data/locations";
import { useRoleRedirect } from "../useRoleRedirect";

// Signup wizard: Sign Up (account) → Step 1 Personal Information → Step 2 Confirmation.
// Real Convex Auth (Password provider). The account is created when step 1 submits —
// signIn(flow:"signUp") with all the profile fields — which (via verify: ResendOTP)
// emails a code. Step 2 submits that code (flow:"email-verification"), which signs the
// user in; useRoleRedirect then routes to their role's dashboard. Google/Facebook OAuth
// are wired on step 0. Step 0 collects credentials only; the profile fields it needs come
// from step 1, so account creation waits until then. Layout per step: __top + __foot.
const INTRO_SUB = "Find the perfect professional for your next project.";

export default function SignupPage() {
  const { signIn } = useAuthActions();
  useRoleRedirect(); // routes once the account is created + verified (authenticated)
  const [step, setStep] = useState(0); // 0 Sign Up · 1 Personal Info · 2 Confirmation
  const [role, setRole] = useState<AuthRole>("customer");
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
    fullName: "",
    countryCode: "+234",
    phone: "",
    state: "",
    area: "",
    address: "",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Step 0 → 1: validate credentials locally (account is created at step 1).
  function submitAccount(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setStep(1);
  }

  // Create the account with the full profile; verify: ResendOTP emails the code.
  // Shared by the step-1 submit and the "resend code" action.
  function createAccount() {
    return signIn("password", {
      email: form.email,
      password: form.password,
      flow: "signUp",
      role,
      fullName: form.fullName,
      countryCode: form.countryCode,
      phone: form.phone,
      state: form.state,
      area: form.area,
      address: form.address,
    });
  }

  // Step 1 → 2: create the account (sends the email code), then show the OTP step.
  async function submitPersonal(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createAccount();
      setStep(2);
    } catch {
      setError("Couldn't create your account. That email may already be registered.");
    } finally {
      setSubmitting(false);
    }
  }

  // Step 2: verify the emailed code → signs the user in → useRoleRedirect navigates.
  async function verify(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn("password", { email: form.email, code: otp, flow: "email-verification" });
    } catch {
      setError("That code isn't right or has expired. Please try again.");
      setSubmitting(false);
    }
  }

  async function resend() {
    setError(null);
    try {
      await createAccount();
    } catch {
      /* resend is best-effort; ignore */
    }
  }

  async function handleOAuth(provider: "google" | "facebook") {
    setError(null);
    try {
      await signIn(provider);
    } catch {
      setError(`Couldn't continue with ${provider}. Please try again.`);
    }
  }

  const loginLink = (
    <p className="hw-auth__signup">
      Already have an account?{" "}
      <Link href="/login" className="hw-link">
        Login
      </Link>
    </p>
  );

  return (
    <AuthShell
      panel={step === 0 ? undefined : <StepperPanel active={step - 1} />}
      mobileHeader={step === 0 ? undefined : <StepProgress current={step} total={2} />}
    >
      {step === 0 && (
        <>
          <form className="hw-auth__form" onSubmit={submitAccount}>
            <div className="hw-auth__top">
              <RoleToggle value={role} onChange={setRole} />

              <header className="hw-auth__intro">
                <h1 className="hw-heading-l">Sign Up</h1>
                <p className="hw-auth__subtitle">{INTRO_SUB}</p>
              </header>

              <div className="hw-field">
                <label htmlFor="su-email">Email</label>
                <Input id="su-email" type="email" autoComplete="email" placeholder="Enter Email Address"
                  value={form.email} onChange={(e) => set("email")(e.target.value)} required />
              </div>

              <div className="hw-field">
                <label htmlFor="su-password">Create Password</label>
                <PasswordInput id="su-password" autoComplete="new-password" placeholder="Create a Password"
                  value={form.password} onChange={(e) => set("password")(e.target.value)} required />
              </div>

              <div className="hw-field">
                <label htmlFor="su-confirm">Confirm Password</label>
                <PasswordInput id="su-confirm" autoComplete="new-password" placeholder="Confirm the Password"
                  value={form.confirm} onChange={(e) => set("confirm")(e.target.value)} required />
              </div>

              {error ? <p className="hw-auth__error" role="alert">{error}</p> : null}
            </div>

            <div className="hw-auth__foot">
              <Button type="submit" variant="primary" block>Sign Up</Button>

              <div className="hw-divider">Or Sign up with</div>

              <div className="hw-social">
                <SocialButton provider="facebook" onClick={() => handleOAuth("facebook")} />
                <SocialButton provider="google" onClick={() => handleOAuth("google")} />
                {/* Apple deferred (paid Apple Developer account) — disabled for now. */}
                <SocialButton provider="apple" disabled title="Apple sign-in coming soon" />
              </div>

              {loginLink}
            </div>
          </form>
          <p className="hw-auth__footer">© Handiwork 2025</p>
        </>
      )}

      {step === 1 && (
        <>
          <form className="hw-auth__form" onSubmit={submitPersonal}>
            <div className="hw-auth__top">
              <header className="hw-auth__intro">
                <h1 className="hw-heading-l">Personal Information</h1>
                <p className="hw-auth__subtitle">{INTRO_SUB}</p>
              </header>

              <AvatarUpload />

              <div className="hw-field">
                <label htmlFor="pi-name">Full Name</label>
                <Input id="pi-name" autoComplete="name" placeholder="Enter Full Name"
                  value={form.fullName} onChange={(e) => set("fullName")(e.target.value)} required />
              </div>

              <div className="hw-field">
                <label htmlFor="pi-email">Email</label>
                {/* Prefilled from the email entered on the Sign Up step (same value). */}
                <Input id="pi-email" type="email" autoComplete="email" placeholder="Enter Email Address"
                  value={form.email} onChange={(e) => set("email")(e.target.value)} required />
              </div>

              <div className="hw-field">
                <label htmlFor="pi-phone">Phone Number</label>
                <PhoneInput code={form.countryCode} onCodeChange={set("countryCode")}
                  phone={form.phone} onPhoneChange={set("phone")} />
              </div>

              <div className="hw-field-row">
                <div className="hw-field">
                  <label htmlFor="pi-state">State</label>
                  <Select id="pi-state" ariaLabel="State" placeholder="Choose State"
                    value={form.state} onChange={set("state")} options={NIGERIA_STATES} />
                </div>

                <div className="hw-field">
                  <label htmlFor="pi-area">Area</label>
                  <Select id="pi-area" ariaLabel="Area" placeholder="Choose Area"
                    value={form.area} onChange={set("area")} options={LAGOS_AREAS} />
                </div>
              </div>

              <div className="hw-field">
                <label htmlFor="pi-address">Address</label>
                <Input id="pi-address" autoComplete="street-address" placeholder="Enter Address"
                  value={form.address} onChange={(e) => set("address")(e.target.value)} required />
              </div>

              {error ? <p className="hw-auth__error" role="alert">{error}</p> : null}
            </div>

            <div className="hw-auth__foot">
              <div className="hw-auth__actions">
                <Button type="button" variant="secondary" block onClick={() => setStep(0)}>Back</Button>
                <Button type="submit" variant="primary" block disabled={submitting}>
                  {submitting ? "Creating…" : "Proceed"}
                </Button>
              </div>

              {loginLink}
            </div>
          </form>
          <p className="hw-auth__footer">© Handiwork 2025</p>
        </>
      )}

      {step === 2 && (
        <>
          <form className="hw-auth__form" onSubmit={verify}>
            <div className="hw-auth__top">
              <header className="hw-auth__intro">
                <h1 className="hw-heading-l">Confirmation</h1>
                <p className="hw-auth__subtitle">
                  We&apos;ve sent a code to{" "}
                  <strong>{form.email || "your email"}</strong> to confirm your email.
                </p>
              </header>

              <OtpInput value={otp} onChange={setOtp} />
              <ResendTimer seconds={30} onResend={resend} />

              {error ? <p className="hw-auth__error" role="alert">{error}</p> : null}
            </div>

            <div className="hw-auth__foot">
              <div className="hw-auth__actions">
                <Button type="button" variant="secondary" block onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" variant="primary" block disabled={submitting}>
                  {submitting ? "Confirming…" : "Confirm"}
                </Button>
              </div>

              {loginLink}
            </div>
          </form>
          <p className="hw-auth__footer">© Handiwork 2025</p>
        </>
      )}
    </AuthShell>
  );
}
