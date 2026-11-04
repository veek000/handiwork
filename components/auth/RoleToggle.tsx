"use client";

import { SegmentedControl } from "@/components/SegmentedControl";

/**
 * RoleToggle — the two-segment control on the auth screens.
 * "Looking to Hire" = customer, "Provide a Service" = vendor. Controlled: the
 * parent owns the value. Shared by Login and Signup. Built on SegmentedControl.
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
  return <SegmentedControl ariaLabel="Account type" value={value} onChange={onChange} options={OPTIONS} />;
}

export default RoleToggle;
