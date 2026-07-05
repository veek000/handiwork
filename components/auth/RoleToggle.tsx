"use client";

/**
 * RoleToggle — the two-segment control on the auth screens.
 * "Looking to Hire" = customer, "Provide a Service" = vendor. Controlled: the
 * parent owns the value. Shared by Login and Signup. Styling: .hw-segment*.
 */
export type AuthRole = "customer" | "vendor";

const OPTIONS: { value: AuthRole; label: string }[] = [
  { value: "customer", label: "Looking to Hire" },
  { value: "vendor", label: "Provide a Service" },
];

export function RoleToggle({
  value,
  onChange,
}: {
  value: AuthRole;
  onChange: (role: AuthRole) => void;
}) {
  return (
    <div className="hw-segment" role="tablist" aria-label="Account type">
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
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

export default RoleToggle;
