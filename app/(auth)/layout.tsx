import type { ReactNode } from "react";
import { AuthConvexProvider } from "./AuthConvexProvider";

// (auth) route group — pre-dashboard screens (login, signup). Each page renders its
// own <AuthShell> so it can control the panel (Login uses the brand panel; the Signup
// wizard swaps in its Stepper for steps 2–3). This layout wraps them in the Convex Auth
// provider (client/localStorage session), scoped to just these routes.
//
// force-dynamic so `next build` never statically prerenders the Convex provider where
// no deployment is configured (mirrors the spike's build-safety approach).
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthConvexProvider>{children}</AuthConvexProvider>;
}
