"use client";

/**
 * SegmentedControl — the grey two-up toggle with a raised white active segment: the
 * auth "Looking to Hire / Provide a Service" switch and the Vendor Profile
 * "Services / Reviews" tabs (Figma 6619:5023). Controlled. Renders as an ARIA tablist;
 * pass `panelId` per option when it switches tab panels. Styling: .hw-segment*.
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; panelId?: string }[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div className={"hw-segment" + (className ? " " + className : "")} role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={opt.panelId}
            className={"hw-segment__option" + (active ? " is-active" : "")}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
