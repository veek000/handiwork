"use client";

import { useState, useEffect } from "react";

/**
 * ResendTimer — "Send code again 00:30" countdown that becomes a resend link at 0.
 * `seconds` is the countdown length; `onResend` fires when the link is clicked and
 * restarts the timer. Styling: .hw-resend*.
 */
export function ResendTimer({
  seconds = 30,
  onResend,
}: {
  seconds?: number;
  onResend?: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setTimeout(() => setRemaining(remaining - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <p className="hw-resend">
      {remaining > 0 ? (
        <>
          Send code again <span className="hw-resend__time">{mm}:{ss}</span>
        </>
      ) : (
        <button
          type="button"
          className="hw-link"
          onClick={() => {
            setRemaining(seconds);
            onResend?.();
          }}
        >
          Send code again
        </button>
      )}
    </p>
  );
}

export default ResendTimer;
