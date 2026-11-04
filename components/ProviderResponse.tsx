"use client";

import { useId, useState } from "react";
import { Avatar } from "@/components/Avatar";

/**
 * ProviderResponse — the collapsible "Service Provider Response" row under a review
 * (Figma Service Detail / Vendor Profile / My Jobs): divider, vendor avatar with the
 * verified badge, label, chevron; expands to the vendor's reply. Styling: .hw-review__reply*.
 */
export function ProviderResponse({
  response,
  vendor,
  label = "Service Provider Response",
  defaultOpen = false,
}: {
  response: string;
  vendor: { name: string; avatarUrl?: string };
  label?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  return (
    <div className="hw-review__reply">
      <button type="button" className="hw-review__toggle" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
        <Avatar name={vendor.name} src={vendor.avatarUrl} size={40} verified />
        <span className="hw-review__replytitle">{label}</span>
        <hw-icon suppressHydrationWarning name={open ? "angle-up" : "angle-down"} variant="hollow" size="16"></hw-icon>
      </button>
      {open ? <p id={panelId} className="hw-review__body">{response}</p> : null}
    </div>
  );
}

export default ProviderResponse;
