import type { ReactNode } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

// The three completed pages (/, /faq, /contact) are served verbatim from public/
// via rewrites and never pass through React. This root layout hosts the app/ routes
// (the (customer)/(vendor) dashboards) and wires the shared design system.
export const metadata = {
  title: "Handiwork",
  description: "Handiwork — your handy home partner.",
};

// Design-system stylesheets, served straight from public/ (the SAME files the static
// pages link) — linked here rather than JS-imported so the React routes render
// identically with zero CSS duplication / drift. Order matters: tokens → type → components.
const DESIGN_SYSTEM_CSS = [
  "/assets/css/tokens/primitives.css",
  "/assets/css/tokens/semantic.css",
  "/assets/css/typography.css",
  "/assets/css/button.css",
  "/assets/css/input.css",
  "/assets/css/sidebar.css",
  "/assets/css/auth.css",
  "/assets/css/dashboard.css",
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {DESIGN_SYSTEM_CSS.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </head>
      <body>
        {children}
        {/* <hw-icon> web component. Must define AFTER hydration, not before: the element
            upgrades by injecting SVG into its light DOM, so defining it pre-hydration makes
            React see unexpected children and throws a hydration mismatch. afterInteractive
            leaves the SSR-empty <hw-icon> matching at hydrate time, then upgrades. */}
        <Script src="/assets/icons/hw-icons.js" strategy="afterInteractive" />
        <Analytics />
      </body>
    </html>
  );
}
