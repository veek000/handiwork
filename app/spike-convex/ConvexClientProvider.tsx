"use client";

// ⚠️ SPIKE — THROWAWAY. Client-side Convex Auth provider, scoped to the /spike-convex
// route only (mounted from app/spike-convex/layout.tsx). Deliberately uses the
// localStorage-based @convex-dev/auth/react provider — NOT the Next.js cookie +
// middleware server flow — so it needs no middleware.ts and no root-layout change,
// and cannot affect any real route. NOTE: this means the spike proves the *client*
// auth/session flow; the cookie/SSR flow the real app may adopt is NOT exercised here.
import type { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

// Fallback keeps `next build` from throwing when the env is absent (e.g. the Vercel
// preview, where Convex isn't configured). The spike only actually works locally with
// `npx convex dev` running and NEXT_PUBLIC_CONVEX_URL set in .env.local.
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://spike-not-configured.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}
