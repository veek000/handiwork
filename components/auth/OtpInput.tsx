"use client";

import { useRef } from "react";

/**
 * OtpInput — `length` single-digit boxes (default 4, per Figma). Controlled: the
 * parent holds the joined string. Numeric only, auto-advances on entry and steps
 * back on Backspace. Styling: .hw-otp*.
 */
export function OtpInput({
  length = 4,
  value,
  onChange,
}: {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function setDigit(index: number, digit: string) {
    const chars = value.split("");
    chars[index] = digit;
    onChange(chars.join("").slice(0, length));
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  }

  return (
    <div className="hw-otp" role="group" aria-label="Verification code">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="hw-otp__box"
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          value={value[i] ?? ""}
          onChange={(e) => setDigit(i, e.target.value.replace(/\D/g, "").slice(-1))}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}

export default OtpInput;
