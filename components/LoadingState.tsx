/**
 * LoadingState — what a dashboard page shows while its live data arrives: the same
 * pulsing dot as the route guard, centred in the page area. Styling: .hw-loading.
 */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="hw-loading" role="status" aria-live="polite">
      <span className="hw-dash-gate__dot" aria-hidden="true" />
      <span className="hw-sr-only">{label}</span>
    </div>
  );
}

export default LoadingState;
