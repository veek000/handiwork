/**
 * ActionError — a dismissible banner pinned to the bottom of the screen when an action
 * (cancel, save, send…) fails. Pairs with lib/useRunner. Styling: .hw-actionerr.
 */
export function ActionError({ error, onDismiss }: { error: string | null; onDismiss: () => void }) {
  if (!error) return null;
  return (
    <div className="hw-actionerr" role="alert">
      <hw-icon suppressHydrationWarning name="circle-exclamation" variant="filled" size="16"></hw-icon>
      <span className="hw-actionerr__text">{error}</span>
      <button type="button" className="hw-actionerr__close" aria-label="Dismiss" onClick={onDismiss}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}

export default ActionError;
