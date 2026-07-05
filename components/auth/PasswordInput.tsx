"use client";

import { useState } from "react";
import { Input, type InputProps } from "@/components/Input";

/**
 * PasswordInput — composes the existing <Input> with a show/hide toggle.
 * Wraps (does not replace) Input: the eye button flips the input `type` between
 * password and text and swaps the eye / eye-slash icon. `type` is owned here, so
 * it's omitted from the accepted props. Styling: .hw-password*.
 */
export function PasswordInput({ className, ...rest }: Omit<InputProps, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="hw-password">
      <Input {...rest} type={visible ? "text" : "password"} className={className} />
      <button
        type="button"
        className="hw-password__toggle"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
      >
        <hw-icon
          suppressHydrationWarning
          name={visible ? "eye-slash" : "eye"}
          variant="hollow"
          size="18"
        ></hw-icon>
      </button>
    </div>
  );
}

export default PasswordInput;
