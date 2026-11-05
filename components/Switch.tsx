/**
 * Switch — an on/off setting (role="switch"). The row's title and description label it,
 * so the whole row reads "Job updates, switch, on". Styling: .hw-switch*.
 */
export function Switch({
  checked,
  onChange,
  labelledBy,
  describedBy,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  labelledBy: string;
  describedBy?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      disabled={disabled}
      className={"hw-switch" + (checked ? " is-on" : "")}
      onClick={() => onChange(!checked)}
    >
      <span className="hw-switch__knob" aria-hidden="true" />
    </button>
  );
}

export default Switch;
