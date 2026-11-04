"use client";

import { SidePanel } from "@/components/SidePanel";
import { Button } from "@/components/Button";

/**
 * ConfirmPanel — a destructive-action confirmation in the shared SidePanel (Figma
 * "Confirm Job Cancellation", 6619:6625 / mobile 6619:21014): illustration, title,
 * explanation, then Confirm (secondary) above Back (primary) — Back is the emphasised,
 * safe choice. Styling: .hw-booked* (shared message layout) + .hw-form__stack.
 */
export function ConfirmPanel({
  art = "/assets/illustration/illustration-25.svg",
  title,
  text,
  confirmLabel = "Confirm",
  backLabel = "Back",
  onConfirm,
  onClose,
}: {
  art?: string;
  title: string;
  text: string;
  confirmLabel?: string;
  backLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <SidePanel
      centered
      ariaLabel={title}
      onClose={onClose}
      footer={
        <div className="hw-form__stack">
          <Button variant="secondary" block onClick={onConfirm}>{confirmLabel}</Button>
          <Button variant="primary" block onClick={onClose}>{backLabel}</Button>
        </div>
      }
    >
      <div className="hw-booked">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hw-booked__art" src={art} alt="" width={128} height={128} />
        <h2 className="hw-booked__title hw-booked__title--s">{title}</h2>
        <p className="hw-booked__text hw-booked__text--s">{text}</p>
      </div>
    </SidePanel>
  );
}

export default ConfirmPanel;
