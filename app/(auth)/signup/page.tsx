"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

// Signup wizard: Sign Up (account) → Step 1 Personal Information → Step 2 Confirmation.
// The step indicator counts only the two onboarding steps (not the initial Sign Up),
// matching Figma. One /signup route holds all state — nothing to persist between
// steps in the prototype. UI only; no real auth until Phase 6 (submit just routes).
// Each step's form splits into __top (fields) and __foot (button + everything under
// it); on mobile the form fills the viewport and pins __foot to the bottom.
// Subtitle uses the mobile frame's copy (the desktop frame has a login-copy paste error).
const INTRO_SUB = "Find the perfect professional for your next project.";

export default function SignupPage() {
  const router = useRouter();
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
  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  function finish(event: FormEvent) {
    event.preventDefault();
    // Phase 6 replaces this with Clerk/Convex. For now: route to the dashboard.
    console.log("signup submit", { role, ...form, otp });
    router.push(role === "customer" ? "/customer" : "/vendor");
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
          <form className="hw-auth__form" onSubmit={(e) => { e.preventDefault(); setStep(1); }}>
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
            </div>

            <div className="hw-auth__foot">
              <Button type="submit" variant="primary" block>Sign Up</Button>

              <div className="hw-divider">Or Sign up with</div>

              <div className="hw-social">
                <SocialButton provider="facebook" />
                <SocialButton provider="google" />
                <SocialButton provider="apple" />
              </div>

              {loginLink}
            </div>
          </form>
          <p className="hw-auth__footer">© Handiwork 2025</p>
        </>
      )}

      {step === 1 && (
        <>
          <form className="hw-auth__form" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
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
            </div>

            <div className="hw-auth__foot">
              <div className="hw-auth__actions">
                <Button type="button" variant="secondary" block onClick={() => setStep(0)}>Back</Button>
                <Button type="submit" variant="primary" block>Proceed</Button>
              </div>

              {loginLink}
            </div>
          </form>
          <p className="hw-auth__footer">© Handiwork 2025</p>
        </>
      )}

      {step === 2 && (
        <>
          <form className="hw-auth__form" onSubmit={finish}>
            <div className="hw-auth__top">
              <header className="hw-auth__intro">
                <h1 className="hw-heading-l">Confirmation</h1>
                <p className="hw-auth__subtitle">
                  We&apos;ve sent a code to{" "}
                  <strong>{form.email || "your email"}</strong> to confirm your email.
                </p>
              </header>

              <OtpInput value={otp} onChange={setOtp} />
              <ResendTimer seconds={30} />
            </div>

            <div className="hw-auth__foot">
              <div className="hw-auth__actions">
                <Button type="button" variant="secondary" block onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" variant="primary" block>Confirm</Button>
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
