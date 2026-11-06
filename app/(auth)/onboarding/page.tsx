"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { RoleToggle, type AuthRole } from "@/components/auth/RoleToggle";
import { Select } from "@/components/auth/Select";
import { PhoneInput } from "@/components/auth/PhoneInput";
import { NIGERIA_STATES, LAGOS_AREAS } from "@/data/locations";
import { EXPERIENCE_OPTIONS } from "@/data/experience";
import { useCategories } from "@/hooks";
import { api, errorMessage, type ViewerDoc } from "@/lib/convexApi";
import { ONBOARDING_ROLE_KEY } from "@/lib/authProviders";
import { viewerRef } from "../useRoleRedirect";

// First-time setup for Google / Facebook sign-ups, which arrive without a role: choose
// customer or service provider (preselected from the signup toggle if they came from
// there) and fill the signup wizard's profile fields, then go to the dashboard. Vendors
// verify their ID afterwards from Settings → Business. Signed-out visitors go to
// /login; accounts that already have a role go straight to their dashboard.
export default function OnboardingPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const viewer = useQuery(viewerRef) as ViewerDoc | null | undefined;
  const chooseRole = useMutation(api.chooseRole);
  const serviceOptions = useCategories().map((c) => c.name);

  const [role, setRole] = useState<AuthRole>("customer");
  const [form, setForm] = useState({
    fullName: "",
    countryCode: "+234",
    phone: "",
    state: "",
    area: "",
    address: "",
    service: "",
    yearsOfExperience: "",
    businessBio: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  // Role picked on the signup page before the provider redirect.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_ROLE_KEY);
      if (saved === "vendor" || saved === "customer") setRole(saved);
    } catch {
      /* ignore */
    }
  }, []);

  // Prefill the name the provider gave us.
  const providerName = viewer?.fullName || viewer?.name || "";
  useEffect(() => {
    if (providerName) setForm((f) => (f.fullName ? f : { ...f, fullName: providerName }));
  }, [providerName]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || viewer === null) router.replace("/login");
    else if (viewer?.role) {
      try {
        localStorage.removeItem(ONBOARDING_ROLE_KEY);
      } catch {
        /* ignore */
      }
      router.replace(`/${viewer.role}`);
    }
  }, [isLoading, isAuthenticated, viewer, router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (form.fullName.trim().length < 2) return setError("Enter your full name.");
    if (role === "vendor" && !form.service) return setError("Choose the service you offer.");
    setError(null);
    setSubmitting(true);
    try {
      await chooseRole({
        role,
        fullName: form.fullName,
        countryCode: form.countryCode,
        phone: form.phone,
        state: form.state,
        area: form.area,
        address: form.address,
        ...(role === "vendor"
          ? { service: form.service, yearsOfExperience: form.yearsOfExperience, businessBio: form.businessBio }
          : {}),
      });
      // The effect above redirects once the role shows up on the account.
    } catch (err) {
      setError(errorMessage(err, "We couldn't save your details. Please try again."));
      setSubmitting(false);
    }
  }

  if (!viewer || viewer.role) {
    return (
      <div className="hw-dash-gate" role="status" aria-live="polite">
        <span className="hw-dash-gate__dot" aria-hidden="true" />
        <span className="hw-sr-only">Checking your account…</span>
      </div>
    );
  }

  return (
    <AuthShell>
      <form className="hw-auth__form" onSubmit={submit} noValidate>
        <div className="hw-auth__top">
          <header className="hw-auth__intro">
            <h1 className="hw-heading-l">Finish setting up</h1>
            <p className="hw-auth__subtitle">
              Signed in as <b>{viewer.email}</b>. Tell us how you&apos;ll use Handiwork — you can&apos;t change this later.
            </p>
          </header>

          <RoleToggle value={role} onChange={setRole} />

          <div className="hw-field">
            <label htmlFor="ob-name">Full Name</label>
            <Input id="ob-name" autoComplete="name" placeholder="Enter Full Name" value={form.fullName}
              onChange={(e) => set("fullName")(e.target.value)} required />
          </div>

          <div className="hw-field">
            <label htmlFor="ob-phone">Phone Number</label>
            <PhoneInput id="ob-phone" code={form.countryCode} onCodeChange={set("countryCode")} phone={form.phone} onPhoneChange={set("phone")} />
          </div>

          <div className="hw-field-row">
            <div className="hw-field">
              <label htmlFor="ob-state">State</label>
              <Select id="ob-state" ariaLabel="State" placeholder="Choose State" value={form.state} onChange={set("state")} options={NIGERIA_STATES} />
            </div>
            <div className="hw-field">
              <label htmlFor="ob-area">Area</label>
              <Select id="ob-area" ariaLabel="Area" placeholder="Choose Area" value={form.area} onChange={set("area")} options={LAGOS_AREAS} />
            </div>
          </div>

          <div className="hw-field">
            <label htmlFor="ob-address">Address</label>
            <Input id="ob-address" autoComplete="street-address" placeholder="Enter Address" value={form.address}
              onChange={(e) => set("address")(e.target.value)} />
          </div>

          {role === "vendor" ? (
            <>
              <div className="hw-field">
                <label htmlFor="ob-service">Service</label>
                <Select id="ob-service" ariaLabel="Service" placeholder="Choose the service you offer" value={form.service}
                  onChange={set("service")} options={serviceOptions} />
              </div>
              <div className="hw-field">
                <label htmlFor="ob-exp">Years of Experience</label>
                <Select id="ob-exp" ariaLabel="Years of Experience" placeholder="e.g 3 years" value={form.yearsOfExperience}
                  onChange={set("yearsOfExperience")} options={EXPERIENCE_OPTIONS} />
              </div>
              <div className="hw-field">
                <label htmlFor="ob-bio">Business Bio</label>
                <textarea id="ob-bio" className="hw-input" placeholder="Enter Description of your business…" value={form.businessBio}
                  maxLength={600} onChange={(e) => set("businessBio")(e.target.value)} />
              </div>
              <p className="hw-auth__subtitle">You&apos;ll verify your ID from Settings → Business to get the verified badge.</p>
            </>
          ) : null}

          {error ? <p className="hw-auth__error" role="alert">{error}</p> : null}
        </div>

        <div className="hw-auth__foot">
          <Button type="submit" variant="primary" block disabled={submitting}>
            {submitting ? "Saving…" : "Continue"}
          </Button>
        </div>
      </form>
      <p className="hw-auth__footer">© Handiwork 2025</p>
    </AuthShell>
  );
}
