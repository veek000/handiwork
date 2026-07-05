import type { ReactNode } from "react";

// (auth) route group — pre-dashboard screens (login, signup). Each page renders its
// own <AuthShell> so it can control the panel (Login uses the brand panel; the Signup
// wizard swaps in its Stepper for steps 2–3). This layout is just a passthrough.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
