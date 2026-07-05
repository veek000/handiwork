import type { ReactNode } from "react";

/**
 * The default dark-green brand panel (logo, verified-worker illustration, tagline)
 * used by Login and Signup step 1. Extracted so AuthShell can swap it for another
 * panel (e.g. the signup Stepper) via the `panel` prop.
 */
function BrandPanel() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hw-auth__panel-logo" src="/assets/logo/wordmark-light.svg" alt="Handiwork" />
      <div className="hw-auth__panel-body">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hw-auth__panel-art" src="/assets/illustration/illustration-28.svg" alt="" aria-hidden="true" />
      </div>
      <div className="hw-auth__panel-copy">
        <h2 className="hw-auth__panel-title">Your Trusted Partner.</h2>
        <p className="hw-auth__panel-sub">
          Find the right professional for any job, our platform connects you with
          verified, top-rated artisans.
        </p>
      </div>
    </>
  );
}

/**
 * AuthShell — two-column auth layout shared by Login and Signup.
 * - `panel`: overrides the default brand panel in the desktop aside (the signup
 *   wizard passes its Stepper here for steps 2–3). Aside is hidden below --hw-bp-l.
 * - `mobileHeader`: rendered above the form on mobile only (the signup wizard passes
 *   its StepProgress bar here). Its own CSS hides it on desktop.
 * - `children`: the page's form column.
 */
export function AuthShell({
  children,
  panel,
  mobileHeader,
}: {
  children: ReactNode;
  panel?: ReactNode;
  mobileHeader?: ReactNode;
}) {
  return (
    <div className="hw-auth">
      <aside className="hw-auth__panel">{panel ?? <BrandPanel />}</aside>

      <main className="hw-auth__main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hw-auth__mobile-logo" src="/assets/logo/wordmark-dark.svg" alt="Handiwork" />
        {mobileHeader}
        {children}
      </main>
    </div>
  );
}

export default AuthShell;
