/**
 * FormStatus — the one-line result under a form or setting: a success note (polite
 * status) or an error (alert, read out immediately). Renders nothing when idle.
 * Styling: .hw-formstatus*.
 */
export type Status = { kind: "idle" } | { kind: "busy" } | { kind: "ok"; text: string } | { kind: "error"; text: string };

export const IDLE: Status = { kind: "idle" };

export function FormStatus({ status }: { status: Status }) {
  if (status.kind === "ok") {
    return (
      <p className="hw-formstatus hw-formstatus--ok" role="status">
        <hw-icon suppressHydrationWarning name="circle-checkmark" variant="filled" size="16"></hw-icon>
        {status.text}
      </p>
    );
  }
  if (status.kind === "error") {
    return (
      <p className="hw-formstatus hw-formstatus--error" role="alert">
        <hw-icon suppressHydrationWarning name="circle-exclamation" variant="filled" size="16"></hw-icon>
        {status.text}
      </p>
    );
  }
  return null;
}

export default FormStatus;
