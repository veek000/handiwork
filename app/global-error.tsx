"use client";

// Last-resort boundary (the root layout itself failed), so it renders its own
// <html>/<body> and can't rely on the design-system stylesheets: inline styles only.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif", background: "#f5f5f5", color: "#141414" }}>
        <main style={{ maxWidth: 420, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>Something went wrong</h1>
          <p style={{ margin: "0 0 20px", color: "#555" }}>Handiwork couldn&apos;t load. Please try again.</p>
          <button type="button" onClick={reset} style={{ padding: "12px 20px", border: 0, background: "#001a13", color: "#e8f5ee", fontWeight: 700, cursor: "pointer" }}>
            Try Again
          </button>
        </main>
      </body>
    </html>
  );
}
