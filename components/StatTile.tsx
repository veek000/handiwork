import type { ReactNode } from "react";

/**
 * StatTile — metric card (Analysis on Vendor Home).
 * Figma layout: icon top-left, value top-right, label bottom.
 * Styling: .hw-stat*.
 */
export function StatTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="hw-stat">
      <div className="hw-stat__top">
        <span className="hw-stat__icon">{icon}</span>
        <span className="hw-stat__value">{value}</span>
      </div>
      <span className="hw-stat__label">{label}</span>
    </div>
  );
}

export default StatTile;
