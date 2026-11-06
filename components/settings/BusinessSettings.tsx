"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { Button } from "@/components/Button";
import { Select } from "@/components/auth/Select";
import { FormStatus, IDLE, type Status } from "@/components/FormStatus";
import { EXPERIENCE_OPTIONS } from "@/data/experience";
import { api, errorMessage } from "@/lib/convexApi";

export type BusinessFields = { service: string; yearsOfExperience: string; businessBio: string };

const BIO_MAX = 600;

/**
 * Settings → Business (vendors): the signup Business Information fields — service,
 * years of experience, bio (with a character count). ID verification is VerificationForm.
 * Styling: .hw-settings*.
 */
export function BusinessSettings({
  initial,
  serviceOptions,
}: {
  initial: BusinessFields;
  serviceOptions: string[];
}) {
  const [base, setBase] = useState(initial);
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<Status>(IDLE);
  const updateProfile = useMutation(api.updateProfile);

  const changed = (Object.keys(form) as (keyof BusinessFields)[]).filter((k) => form[k] !== base[k]);
  const set = (key: keyof BusinessFields) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (status.kind !== "busy") setStatus(IDLE);
  };
  const bioOver = form.businessBio.length > BIO_MAX;

  async function save(e: FormEvent) {
    e.preventDefault();
    if (bioOver) {
      setStatus({ kind: "error", text: `Keep your bio under ${BIO_MAX} characters.` });
      return;
    }
    setStatus({ kind: "busy" });
    try {
      await updateProfile(Object.fromEntries(changed.map((k) => [k, form[k]])));
      setBase(form);
      setStatus({ kind: "ok", text: "Business details updated." });
    } catch (err) {
      setStatus({ kind: "error", text: errorMessage(err, "We couldn't save your business details. Please try again.") });
    }
  }

  return (
    <form className="hw-settings__form" onSubmit={save} noValidate>
      <div className="hw-field">
        <label htmlFor="set-service">Service</label>
        <Select id="set-service" ariaLabel="Service" placeholder="Choose the service you offer" value={form.service}
          onChange={set("service")} options={serviceOptions} />
      </div>

      <div className="hw-field">
        <label htmlFor="set-experience">Years of Experience</label>
        <Select id="set-experience" ariaLabel="Years of Experience" placeholder="e.g 3 years"
          value={form.yearsOfExperience} onChange={set("yearsOfExperience")} options={EXPERIENCE_OPTIONS} />
      </div>

      <div className="hw-field">
        <label htmlFor="set-bio">Business Bio</label>
        <textarea id="set-bio" className="hw-input hw-settings__textarea" rows={5}
          placeholder="Tell customers what you do and what makes your work stand out"
          value={form.businessBio} aria-invalid={bioOver || undefined} aria-describedby="set-bio-count"
          onChange={(e) => set("businessBio")(e.target.value)} />
        <p id="set-bio-count" className={"hw-settings__hint hw-settings__count" + (bioOver ? " is-over" : "")}>
          {form.businessBio.length} / {BIO_MAX}
        </p>
      </div>

      <div className="hw-settings__actions">
        <FormStatus status={status} />
        <div className="hw-settings__buttons">
          <Button variant="secondary" disabled={!changed.length || status.kind === "busy"}
            onClick={() => { setForm(base); setStatus(IDLE); }}>
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

export default BusinessSettings;
