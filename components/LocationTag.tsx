import type { User } from "@/types";

/**
 * LocationTag — "📍 Your Location / Lagos, Nigeria ✎". Rendered in the desktop header
 * (left) and, on mobile, as a separate row below the header (per Figma). `className`
 * lets the caller control per-context visibility. Styling: .hw-loc*.
 */
export function LocationTag({ user, className }: { user: User; className?: string }) {
  return (
    <div className={"hw-loc" + (className ? " " + className : "")}>
      <span className="hw-loc__pin" aria-hidden="true">
        <hw-icon suppressHydrationWarning name="map-pin" variant="filled" size="28"></hw-icon>
      </span>
      <span className="hw-loc__text">
        <span className="hw-loc__label">Your Location</span>
        <span className="hw-loc__value">
          {user.location}
          <hw-icon suppressHydrationWarning name="pencil" variant="hollow" size="12"></hw-icon>
        </span>
      </span>
    </div>
  );
}

export default LocationTag;
