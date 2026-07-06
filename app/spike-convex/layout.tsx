import type { ReactNode } from "react";
import { ConvexClientProvider } from "./ConvexClientProvider";

// ⚠️ SPIKE — THROWAWAY route group. Not linked from anywhere in the real app.
// force-dynamic so `next build` never tries to statically prerender the Convex
// provider (which would run without a configured deployment on the CI build).
export const dynamic = "force-dynamic";
export const metadata = { title: "Convex Spike (throwaway)" };

export default function SpikeLayout({ children }: { children: ReactNode }) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
