"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { PhoneInput } from "@/components/auth/PhoneInput";
import { Select } from "@/components/auth/Select";
import { FormStatus, IDLE, type Status } from "@/components/FormStatus";
import { NIGERIA_STATES, LAGOS_AREAS } from "@/data/locations";
import { api, errorMessage } from "@/lib/convexApi";

export type ProfileFields = {
  fullName: string;
  countryCode: string;
  phone: string;
  state: string;
  area: string;
  address: string;
};

type Errors = Partial<Record<keyof ProfileFields, string>>;

function validate(f: ProfileFields): Errors {
  const e: Errors = {};
  if (f.fullName.trim().length < 2) e.fullName = "Enter your full name.";
  const digits = f.phone.replace(/\s/g, "");
  if (digits && !/^\d{7,15}$/.test(digits)) e.phone = "Use digits only, 7 to 15 of them.";
  if (f.address.length > 160) e.address = "Keep the address under 160 characters.";
  return e;
}

/**
 * Settings → Profile: photo (initials until uploads land), name, email (read-only — it
 * is the sign-in identity), phone, state / area and address. Validates on save, shows
 * field errors under each field, and only sends what changed. Styling: .hw-settings*.
 */
export function ProfileSettings({
  initial,
  email,
  avatarUrl,
  roleLabel,
}: {
  initial: ProfileFields;
  email: string;
  avatarUrl?: string;
  roleLabel: string;
}) {
  const [base, setBase] = useState(initial);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>(IDLE);
  const updateProfile = useMutation(api.updateProfile);

  const changed = (Object.keys(form) as (keyof ProfileFields)[]).filter((k) => form[k] !== base[k]);
  const set = (key: keyof ProfileFields) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    if (status.kind !== "busy") setStatus(IDLE);
  };

  async function save(e: FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus({ kind: "error", text: "Check the highlighted fields." });
      return;
    }
    setStatus({ kind: "busy" });
    try {
      await updateProfile(Object.fromEntries(changed.map((k) => [k, form[k]])));
      setBase(form);
      setStatus({ kind: "ok", text: "Profile updated." });
    } catch (err) {
      setStatus({ kind: "error", text: errorMessage(err, "We couldn't save your profile. Please try again.") });
    }
  }

  const err = (key: keyof ProfileFields) =>
    errors[key] ? <p id={`set-${key}-err`} className="hw-settings__fielderr">{errors[key]}</p> : null;

  return (
    <form className="hw-settings__form" onSubmit={save} noValidate>
      <div className="hw-settings__identity">
        <Avatar name={form.fullName || email} src={avatarUrl} size={64} />
        <div className="hw-settings__identity-text">
          <p className="hw-settings__identity-name">{base.fullName || "Your name"}</p>
          <p className="hw-settings__identity-sub">{email}</p>
          <span className="hw-settings__badge">{roleLabel}</span>
        </div>
      </div>

      <div className="hw-field">
        <label htmlFor="set-fullName">Full Name</label>
        <Input id="set-fullName" autoComplete="name" placeholder="Enter Full Name" value={form.fullName}
          aria-invalid={!!errors.fullName || undefined} aria-describedby={errors.fullName ? "set-fullName-err" : undefined}
          onChange={(e) => set("fullName")(e.target.value)} />
        {err("fullName")}
      </div>

      <div className="hw-field">
        <label htmlFor="set-email">Email</label>
        <Input id="set-email" type="email" value={email} readOnly aria-describedby="set-email-hint" />
        <p id="set-email-hint" className="hw-settings__hint">Your email is how you sign in. Contact support to change it.</p>
      </div>

      <div className="hw-field">
        <label htmlFor="set-phone">Phone Number</label>
        <PhoneInput id="set-phone" code={form.countryCode} onCodeChange={set("countryCode")} phone={form.phone}
          onPhoneChange={set("phone")} invalid={!!errors.phone} describedBy={errors.phone ? "set-phone-err" : undefined} />
        {err("phone")}
      </div>

      <div className="hw-field-row">
        <div className="hw-field">
          <label htmlFor="set-state">State</label>
          <Select id="set-state" ariaLabel="State" placeholder="Choose State" value={form.state}
            onChange={set("state")} options={NIGERIA_STATES} />
        </div>
        <div className="hw-field">
          <label htmlFor="set-area">Area</label>
          <Select id="set-area" ariaLabel="Area" placeholder="Choose Area" value={form.area}
            onChange={set("area")} options={LAGOS_AREAS} />
        </div>
      </div>

      <div className="hw-field">
        <label htmlFor="set-address">Address</label>
        <Input id="set-address" autoComplete="street-address" placeholder="Enter Address" value={form.address}
          aria-invalid={!!errors.address || undefined} aria-describedby={errors.address ? "set-address-err" : undefined}
          onChange={(e) => set("address")(e.target.value)} />
        {err("address")}
      </div>

      <div className="hw-settings__actions">
        <FormStatus status={status} />
        <div className="hw-settings__buttons">
          <Button variant="secondary" disabled={!changed.length || status.kind === "busy"}
            onClick={() => { setForm(base); setErrors({}); setStatus(IDLE); }}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!changed.length || status.kind === "busy"}>
            {status.kind === "busy" ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default ProfileSettings;
