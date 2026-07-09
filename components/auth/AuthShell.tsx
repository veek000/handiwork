import { useEffect, useRef, useState, type ReactNode } from "react";

/*
 * Glove glyph pattern — inline SVG, no HTTP request.
 *
 * Tile: 76 × 152 px (two rows, each 76 px tall — no gap between glyphs).
 * Row 1: one glyph at x=0.
 * Row 2: two glyph copies at x=−38 and x=+38 (50% horizontal brick stagger).
 *   Two copies are needed because the +38 copy overflows the tile's right edge;
 *   the −38 copy fills that same space from the adjacent tile repeat, preventing
 *   clipped half-glyphs on the right side of each row.
 *
 * Height: computed at runtime via ResizeObserver so only complete 76px rows
 * are rendered. The SVG is bottom-anchored inside its wrapper so any sub-row
 * remainder appears as empty space at the top rather than a clipped row at the
 * bottom (near the illustration and copy, where completeness matters most).
 *
 * Color: --hw-color-brand-primary-light (#DFF1E1) at opacity 0.1 via CSS —
 * matches Figma "Background/primary alpha" spec exactly.
 *
 * clipPath note: applied to the INNER <g> (inside each transform) so it
 * resolves in the glyph's own local coordinate space, not the pattern origin.
 */

const TILE_ROW_PX = 76;
const GLYPH_PATH = "M48.1372 -5.70806C47.2155 -9.33835 45.3848 -11.3282 43.8291 -11.3282H3.02148C4.81654 -11.3282 6.61159 -8.1669 7.20994 -5.88369L18.155 36.9703L23.8441 59.2754C24.5734 62.0947 25.8785 64.1931 27.4342 64.1931H32.4604C31.144 64.1931 29.4686 61.2073 29.1096 59.6267L25.9982 47.3325C25.6392 46.1031 25.2802 44.1711 26.4769 43.6442C27.6736 43.1174 28.1523 44.1711 28.6309 46.1031L32.1014 59.6267C32.7782 61.6314 34.4948 64.1931 36.0505 64.1931H41.5553C39.88 64.1931 37.9652 61.383 37.4865 59.6267L34.6144 48.3863C34.3751 47.5081 34.1358 45.9274 35.3325 45.2249C36.2898 44.8737 36.8882 45.4006 37.4865 47.3325L40.7177 59.6267C41.1963 61.383 43.111 64.1931 44.9061 64.1931H49.4535C48.0175 64.1931 46.3422 61.2073 45.8635 59.6267L42.1537 44.5224C41.9144 43.4686 41.6489 41.7836 42.8717 41.1854C43.9487 40.6585 44.5471 41.7123 45.1454 43.9955L49.2142 59.6267C49.6929 61.2073 51.3683 64.1931 52.4453 64.1931H58.1402C56.9345 64.1572 54.8322 61.5323 54.3601 59.6267L44.3077 19.4072C43.9487 18.0021 43.9487 16.5971 44.9061 15.8946C45.9831 15.3677 46.7012 16.4214 47.0602 17.8265L51.2486 33.9845C52.206 37.6728 55.6764 39.7804 58.9075 37.6728L49.9522 1.49281L48.1372 -5.70806Z";

function GlovePattern() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      setSvgHeight(Math.floor(h / TILE_ROW_PX) * TILE_ROW_PX);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="hw-auth__pattern-wrap" aria-hidden="true">
      {svgHeight > 0 && (
        <svg
          className="hw-auth__pattern"
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: svgHeight }}
        >
          <defs>
            <clipPath id="hw-glyph-clip">
              <rect width="75.0198" height="75.0198" />
            </clipPath>
            <pattern
              id="hw-glove-pattern"
              patternUnits="userSpaceOnUse"
              width="76"
              height="152"
            >
              {/* Row 1 */}
              <g transform="translate(0, 0)">
                <g clipPath="url(#hw-glyph-clip)">
                  <path fill="currentColor" d={GLYPH_PATH} />
                </g>
              </g>
              {/* Row 2: two copies 76px apart to prevent right-edge clipping */}
              <g transform="translate(-38, 76)">
                <g clipPath="url(#hw-glyph-clip)">
                  <path fill="currentColor" d={GLYPH_PATH} />
                </g>
              </g>
              <g transform="translate(38, 76)">
                <g clipPath="url(#hw-glyph-clip)">
                  <path fill="currentColor" d={GLYPH_PATH} />
                </g>
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hw-glove-pattern)" />
        </svg>
      )}
    </div>
  );
}

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
        <GlovePattern />
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
