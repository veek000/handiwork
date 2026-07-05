/**
 * StepProgress — mobile step indicator (the desktop equivalent is StepperPanel in
 * the aside). A `total`-segment bar with the first `current` segments filled, plus
 * "Step {current} of {total}". Hidden on desktop via CSS. Styling: .hw-step-progress*.
 */
export function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="hw-step-progress">
      <div className="hw-step-progress__bar">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={"hw-step-progress__seg" + (i < current ? " is-active" : "")} />
        ))}
      </div>
      <span className="hw-step-progress__label">
        Step {current} of {total}
      </span>
    </div>
  );
}

export default StepProgress;
