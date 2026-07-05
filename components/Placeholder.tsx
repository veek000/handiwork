import type { ReactNode } from "react";

/**
 * Placeholder — foundation-phase page body. The deliverable this phase is the
 * layout + role sidebar rendering correctly, not screen content. Uses the global
 * typography classes so it also proves those stylesheets are wired.
 */
export function Placeholder({
  role,
  title,
  children,
}: {
  role: "Customer" | "Vendor";
  title: string;
  children?: ReactNode;
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span
        style={{
          fontFamily: "var(--hw-font-body)",
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--hw-text-tertiary)",
        }}
      >
        {role}
      </span>
      <h1 className="hw-heading-l" style={{ margin: 0 }}>
        {title}
      </h1>
      <p className="hw-text-l" style={{ margin: 0, color: "var(--hw-text-secondary)" }}>
        Placeholder screen — real content arrives in a later phase.
      </p>
      {children}
    </section>
  );
}

export default Placeholder;
