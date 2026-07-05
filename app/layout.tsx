import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";

// Minimal root layout. The three completed pages (/, /faq, /contact) are
// served verbatim from public/ via rewrites in next.config.mjs and never pass
// through React. This layout only exists to satisfy the App Router and to host
// future app/ routes (e.g. customer/vendor dashboards).
export const metadata = {
  title: "Handiwork",
  description: "Handiwork — your handy home partner.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
