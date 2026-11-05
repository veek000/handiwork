"use client";

import { Input } from "@/components/Input";
import { Select } from "./Select";
import { DIALLING_CODES } from "@/data/locations";

/**
 * PhoneInput — country-code Select + phone Input on one row. Controlled by the
 * parent (the signup wizard owns code + number). Composes existing pieces; no new
 * primitives. Styling: .hw-phone.
 */
export function PhoneInput({
  code,
  onCodeChange,
  phone,
  onPhoneChange,
  id,
  invalid,
  describedBy,
}: {
  code: string;
  onCodeChange: (code: string) => void;
  phone: string;
  onPhoneChange: (phone: string) => void;
  /** id for the number field, so a <label htmlFor> can point at it */
  id?: string;
  /** marks the number field invalid (aria-invalid + error styling) */
  invalid?: boolean;
  /** id of the field's error message */
  describedBy?: string;
}) {
  return (
    <div className="hw-phone">
      <Select
        className="hw-phone__code"
        ariaLabel="Country code"
        value={code}
        onChange={onCodeChange}
        options={DIALLING_CODES}
      />
      <Input
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="Enter your Phone Number"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
      />
    </div>
  );
}

export default PhoneInput;
