"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * SidePanel — the modal panel used by Filter By and Book Service (Figma 6619:3694,
 * 6619:4273): a 393px drawer pinned to the right edge over a dimmed page on desktop
 * (≥1024px), a bottom sheet below that. Optional centred title + thin ✕ close; body
 * scrolls; `footer` is pinned to the base on desktop. `centered` vertically centres a
 * message-style body (Request Sent, Rate Your Experience, confirmations). Closes on ✕,
 * scrim click or Escape, and takes focus on open. Styling: .hw-panel*.
 */
export function SidePanel({
  title,
  onClose,
  children,
  footer,
  labelledBy = "hw-panel-title",
  centered = false,
  ariaLabel = "Dialog",
}: {
  title?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  labelledBy?: string;
  centered?: boolean;
  ariaLabel?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="hw-panel" role="presentation">
      <div className="hw-panel__scrim" onClick={onClose} aria-hidden="true" />
      <div
        className="hw-panel__box"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? labelledBy : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        ref={panelRef}
      >
        <div className="hw-panel__head">
          {title ? <h2 id={labelledBy} className="hw-panel__title">{title}</h2> : null}
          <button type="button" className="hw-panel__close" aria-label="Close" onClick={onClose}>
            {/* thin line cross, same mark as the sidebar drawer close */}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className={"hw-panel__body" + (centered ? " hw-panel__body--centered" : "")}>{children}</div>
        {footer ? <div className="hw-panel__foot">{footer}</div> : null}
      </div>
    </div>
  );
}

export default SidePanel;
