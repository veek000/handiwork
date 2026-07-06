"use client";

// Convex Auth provider scoped to the (auth) route group (login + signup). Client-side
// localStorage session flow — the same one the spike proved. Scoped here (not the root
// layout) so the dashboards + static pages are untouched this pass (minimal scope).
//
// Fallback URL keeps `next build` from throwing where Convex isn't configured (Vercel
// preview/prod). Auth only actually works where NEXT_PUBLIC_CONVEX_URL is set (local
// .env.local now; Vercel env vars are a later step).
import type { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://auth-not-configured.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

export function AuthConvexProvider({ children }: { children: ReactNode }) {
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}
