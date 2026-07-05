// DEMO-ONLY relative-time formatting.
//
// The mock data uses fixed historical timestamps (see mocks/*, Phase 2.5), so a real
// `Date.now()` formatter would render everything as "months ago". Instead we format
// against a single fixed reference date so the UI reads like the Figma ("5 min ago",
// "2 hours ago"). This is NOT real relative-time behaviour — once the app has live
// data, drop MOCK_REFERENCE_DATE and pass `new Date()` as the reference.
export const MOCK_REFERENCE_DATE = new Date("2025-09-20T17:05:00+01:00");

export function formatRelativeTime(iso: string, reference: Date = MOCK_REFERENCE_DATE): string {
  const diffMs = reference.getTime() - new Date(iso).getTime();
  const min = Math.round(diffMs / 60000);
  const hr = Math.round(diffMs / 3_600_000);
  const day = Math.round(diffMs / 86_400_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
  return `${Math.round(day / 7)} week${Math.round(day / 7) === 1 ? "" : "s"} ago`;
}

// Deterministic naira formatting (explicit locale so server and client render the
// same string — avoids hydration mismatches from the runtime's default locale).
export function formatNaira(amount: number): string {
  return `NGN${amount.toLocaleString("en-US")}`;
}
