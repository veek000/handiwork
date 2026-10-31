import type { ReactNode } from "react";
import Link from "next/link";

/**
 * QuickActionTile — navigation row (Quick Action on Vendor Home):
 * icon + label + trailing chevron. Renders a Next <Link> for client-side
 * navigation (consistent with the Analysis "View details" link). Styling: .hw-action*.
 */
export function QuickActionTile({
  icon,
  label,
  href,
}: {
  icon: ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link href={href} className="hw-action">
      <span className="hw-action__icon">{icon}</span>
      <span className="hw-action__label">{label}</span>
      <hw-icon
        suppressHydrationWarning
        name="angle-right"
        variant="hollow"
        size="16"
      ></hw-icon>
    </Link>
  );
}

export default QuickActionTile;
