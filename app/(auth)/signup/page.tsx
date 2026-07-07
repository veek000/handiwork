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
import { DocumentUpload } from "@/components/auth/DocumentUpload";
import { StepperPanel, type StepperStep } from "@/components/auth/StepperPanel";
import { StepProgress } from "@/components/auth/StepProgress";
import { ResendTimer } from "@/components/auth/ResendTimer";
import { NIGERIA_STATES, LAGOS_AREAS } from "@/data/locations";
import { EXPERIENCE_OPTIONS } from "@/data/experience";
import { useCategories } from "@/hooks";
import { useRoleRedirect } from "../useRoleRedirect";

// Role-aware signup wizard. Both roles start on the account step (Sign Up), then run
// their own onboarding sequence before Confirmation (OTP):
//   customer: Personal Information → Confirmation
//   vendor:   Personal Information → Business Information → Verification → Confirmation
// The account is created at the step immediately BEFORE Confirmation (so every profile
// field is collected first) — signIn(flow:"signUp") with the full profile, which via
// verify: ResendOTP emails the code; Confirmation submits it (flow:"email-verification")
// and useRoleRedirect routes to the role dashboard. UI-only for the non-persisted bits
// (avatar, ID document); the vendor text fields DO persist (schema + auth profile).
// The step indicator/stepper counts only the onboarding steps, never the account step.

type StepName = "account" | "personal" | "business" | "verification" | "confirm";

const FLOWS: Record<AuthRole, StepName[]> = {
  customer: ["account", "personal", "confirm"],
  vendor: ["account", "personal", "business", "verification", "confirm"],
};

// Desktop stepper labels for the vendor onboarding steps (customer uses the
// StepperPanel default). Order matches FLOWS.vendor minus the account step.
const VENDOR_STEPPER: StepperStep[] = [
  { label: "Personal Information", desc: "Enter your details to create your profile" },
  { label: "Business Information", desc: "Enter details about your business" },
  { label: "Verification", desc: "Upload your ID to verify your identity" },
  { label: "Confirmation", desc: "Enter the code sent to your email to confirm your account" },
];

const CUSTOMER_INTRO = "Find the perfect professional for your next project.";
const VENDOR_INTRO =
  "Join a community of verified professionals. Connect with clients and showcase your expertise.";

export default function SignupPage() {
  const { signIn } = useAuthActions();
  useRoleRedirect(); // routes once the account is created + verified (authenticated)
  const categories = useCategories();
  const serviceOptions = categories.map((c) => c.name);

  const [role, setRole] = useState<AuthRole>("customer");
  const [stepIndex, setStepIndex] = useState(0); // index into FLOWS[role]
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
    // vendor-only (Business Information + Verification)
    service: "",
    yearsOfExperience: "",
    businessBio: "",
    governmentIdNumber: "",
  });
  const [idFileName, setIdFileName] = useState<string | undefined>(); // UI only (no upload)
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const flow = FLOWS[role];
  const stepName = flow[stepIndex];
  const onboardingTotal = flow.length - 1; // steps shown in the indicator (excludes account)
  const nextIsConfirm = flow[stepIndex + 1] === "confirm";

  // Create the account with the full profile; verify: ResendOTP emails the code.
  // Shared by the pre-Confirmation submit and the "resend code" action. Vendor fields
  // are sent only for vendors (all optional in the schema).
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
      ...(role === "vendor"
        ? {
            service: form.service,
            yearsOfExperience: form.yearsOfExperience,
            businessBio: form.businessBio,
            governmentIdNumber: form.governmentIdNumber,
          }
        : {}),
    });
  }

  // Shared submit for every step except Confirmation. Validates the account step
  // locally; for the step just before Confirmation it creates the account (sending the
  // OTP) before advancing; otherwise it just advances.
  async function submitStep(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (stepName === "account") {
      if (form.password !== form.confirm) {
        setError("Passwords don't match.");
        return;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      setStepIndex((i) => i + 1);
      return;
    }

    if (nextIsConfirm) {
      setSubmitting(true);
      try {
        await createAccount();
        setStepIndex((i) => i + 1);
      } catch {
        setError("Couldn't create your account. That email may already be registered.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setStepIndex((i) => i + 1);
  }

  // Confirmation: verify the emailed code → signs the user in → useRoleRedirect navigates.
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

  const back = () => setStepIndex((i) => i - 1);

  const subtitle =
    stepName === "account"
      ? role === "vendor"
        ? VENDOR_INTRO
        : CUSTOMER_INTRO
      : stepName === "personal"
        ? role === "vendor"
          ? "Enter your details to create your profile."
          : CUSTOMER_INTRO
        : stepName === "business"
          ? "Enter details about your business"
          : stepName === "verification"
            ? "Upload your ID to verify your identity."
            : null; // confirm renders its own (dynamic) subtitle

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
      panel={
        stepName === "account" ? undefined : (
          <StepperPanel
            active={stepIndex - 1}
            steps={role === "vendor" ? VENDOR_STEPPER : undefined}
          />
        )
      }
      mobileHeader={
        stepName === "account" ? undefined : (
          <StepProgress current={stepIndex} total={onboardingTotal} />
        )
      }
    >
      {stepName === "account" && (
        <>
          <form className="hw-auth__form" onSubmit={submitStep}>
            <div className="hw-auth__top">
              <RoleToggle value={role} onChange={setRole} />

              <header className="hw-auth__intro">
                <h1 className="hw-heading-l">Sign Up</h1>
                <p className="hw-auth__subtitle">{subtitle}</p>
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

      {stepName === "personal" && (
        <>
          <form className="hw-auth__form" onSubmit={submitStep}>
            <div className="hw-auth__top">
              <header className="hw-auth__intro">
                <h1 className="hw-heading-l">Personal Information</h1>
                <p className="hw-auth__subtitle">{subtitle}</p>
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
                <Button type="button" variant="secondary" block onClick={back}>Back</Button>
                <Button type="submit" variant="primary" block disabled={submitting}>
                  {submitting && nextIsConfirm ? "Creating…" : "Proceed"}
                </Button>
              </div>

              {loginLink}
            </div>
          </form>
          <p className="hw-auth__footer">© Handiwork 2025</p>
        </>
      )}

      {stepName === "business" && (
        <>
          <form className="hw-auth__form" onSubmit={submitStep}>
            <div className="hw-auth__top">
              <header className="hw-auth__intro">
                <h1 className="hw-heading-l">Business Information</h1>
                <p className="hw-auth__subtitle">{subtitle}</p>
              </header>

              <div className="hw-field">
                <label htmlFor="bi-service">Service</label>
                <Select id="bi-service" ariaLabel="Service" placeholder="Choose the service you offer"
                  value={form.service} onChange={set("service")} options={serviceOptions} />
              </div>

              <div className="hw-field">
                <label htmlFor="bi-experience">Years of Experience</label>
                <Select id="bi-experience" ariaLabel="Years of Experience" placeholder="e.g 3 years"
                  value={form.yearsOfExperience} onChange={set("yearsOfExperience")} options={EXPERIENCE_OPTIONS} />
              </div>

              <div className="hw-field">
                <label htmlFor="bi-bio">Business Bio</label>
                <textarea id="bi-bio" className="hw-input" placeholder="Enter Description of your business…"
                  value={form.businessBio} onChange={(e) => set("businessBio")(e.target.value)} />
              </div>

              {error ? <p className="hw-auth__error" role="alert">{error}</p> : null}
            </div>

            <div className="hw-auth__foot">
              <div className="hw-auth__actions">
                <Button type="button" variant="secondary" block onClick={back}>Back</Button>
                <Button type="submit" variant="primary" block>Proceed</Button>
              </div>

              {loginLink}
            </div>
          </form>
          <p className="hw-auth__footer">© Handiwork 2025</p>
        </>
      )}

      {stepName === "verification" && (
        <>
          <form className="hw-auth__form" onSubmit={submitStep}>
            <div className="hw-auth__top">
              <header className="hw-auth__intro">
                <h1 className="hw-heading-l">Verification</h1>
                <p className="hw-auth__subtitle">{subtitle}</p>
              </header>

              <DocumentUpload fileName={idFileName} onFile={setIdFileName} />

              <div className="hw-field">
                <label htmlFor="ve-id">Government ID Number</label>
                <Input id="ve-id" placeholder="Enter Government ID Number"
                  value={form.governmentIdNumber} onChange={(e) => set("governmentIdNumber")(e.target.value)} />
              </div>

              {error ? <p className="hw-auth__error" role="alert">{error}</p> : null}
            </div>

            <div className="hw-auth__foot">
              <div className="hw-auth__actions">
                <Button type="button" variant="secondary" block onClick={back}>Back</Button>
                <Button type="submit" variant="primary" block disabled={submitting}>
                  {submitting && nextIsConfirm ? "Creating…" : "Proceed"}
                </Button>
              </div>

              {loginLink}
            </div>
          </form>
          <p className="hw-auth__footer">© Handiwork 2025</p>
        </>
      )}

      {stepName === "confirm" && (
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
                <Button type="button" variant="secondary" block onClick={back}>Back</Button>
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
