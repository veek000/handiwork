/**
 * StepperPanel — desktop brand-panel content for the signup onboarding steps
 * (replaces the BrandPanel via AuthShell's `panel` prop). Shows "Tell Us About You"
 * + a vertical numbered stepper. `active` is the 0-based index of the current step.
 * `steps` is the per-role step list (customer = 2, vendor = 4); it defaults to the
 * customer flow so existing callers keep working. Styling: .hw-stepper*.
 */
export type StepperStep = { label: string; desc: string };

const CUSTOMER_STEPS: StepperStep[] = [
  { label: "Personal Information", desc: "Enter your details to get started" },
  { label: "Confirmation", desc: "Enter the code sent to your email to confirm your account" },
];

export function StepperPanel({
  active,
  steps = CUSTOMER_STEPS,
}: {
  active: number;
  steps?: StepperStep[];
}) {
  return (
    <div className="hw-stepper">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hw-auth__panel-logo" src="/assets/logo/wordmark-light.svg" alt="Handiwork" />
      <h2 className="hw-stepper__title">Tell Us About You</h2>
      <ol className="hw-stepper__list">
        {steps.map((step, i) => {
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
