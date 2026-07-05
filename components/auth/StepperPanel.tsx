/**
 * StepperPanel — desktop brand-panel content for signup steps 2–3 (replaces the
 * BrandPanel via AuthShell's `panel` prop). Shows "Tell Us About You" + a vertical
 * numbered stepper. `active` is the 0-based index of the current step. Styling:
 * .hw-stepper*.
 */
const STEPS = [
  { label: "Personal Information", desc: "Enter your details to get started" },
  { label: "Confirmation", desc: "Enter the code sent to your email to confirm your account" },
];

export function StepperPanel({ active }: { active: number }) {
  return (
    <div className="hw-stepper">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hw-auth__panel-logo" src="/assets/logo/wordmark-light.svg" alt="Handiwork" />
      <h2 className="hw-stepper__title">Tell Us About You</h2>
      <ol className="hw-stepper__list">
        {STEPS.map((step, i) => {
          const state = i < active ? "is-done" : i === active ? "is-active" : "";
          return (
            <li key={step.label} className={"hw-stepper__step " + state}>
              <span className="hw-stepper__num">{i + 1}</span>
              <span className="hw-stepper__text">
                <span className="hw-stepper__label">{step.label}</span>
                <span className="hw-stepper__desc">{step.desc}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default StepperPanel;
