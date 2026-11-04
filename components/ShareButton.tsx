"use client";

import { useEffect, useState } from "react";

/**
 * ShareButton — "Share Profile" (Figma 6619:5023, secondary). Uses the native share
 * sheet where available (phones), otherwise copies the page URL and confirms with
 * "Link copied" for 2s. Styling: .hw-button--secondary (+ caller's className).
 */
export function ShareButton({ title, label = "Share Profile", className }: { title: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* dismissed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      /* clipboard blocked — nothing else to do */
    }
  }

  return (
    <button type="button" className={"hw-button hw-button--secondary" + (className ? " " + className : "")} onClick={share}>
      <span aria-live="polite">{copied ? "Link copied" : label}</span>
    </button>
  );
}

export default ShareButton;
