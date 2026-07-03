# Handiwork — Design System & Prototype Toolkit

A self-contained toolkit for building HTML prototypes with the **Handiwork** brand:
design tokens (color + typography), a 641-icon library, logos, illustrations, and
the brand guidelines. Everything works by opening the HTML files directly in a
browser — **no build step or server required** for day-to-day use.

- **Figma source:** https://www.figma.com/design/FzlongLhfcTEmS7QOsWTDv/Handiwork
  (colors: node `39:800`, typography: node `39:1000`)

---

## Quick start

Open **`index.html`** — a single page with every part of the system in tabbed
sections: Overview, Colors, Typography, Icons, Logos, Illustrations, Components.
It works offline (opens straight from the file system).

To build a new prototype page, link the two stylesheets and (optionally) the icon
component. Use the same relative paths from any page at the project root:

```html
<link rel="stylesheet" href="assets/css/tokens.css" />
<link rel="stylesheet" href="assets/css/typography.css" />
<script src="assets/icons/hw-icons.js"></script>

<h1 class="hw-heading-xl">Get it fixed, fast</h1>
<p class="hw-text-l hw-text-body">Trusted handy pros near you.</p>
<button style="background:var(--hw-primary); color:#fff;">
  <hw-icon name="hammer" variant="duo" size="18"></hw-icon> Book now
</button>
```

---

## Folder map

```
handiwork/
├─ index.html              Single-page system: overview · colors · typography ·
│                          icons · logos · illustrations · components (tabbed)
├─ PROJECT.md              This file
│
├─ components/             Reusable UI component demos (built on the tokens)
│  ├─ sidebar.html         Sidebar nav — standalone demo (also embedded in index)
│  ├─ button.html          Button demo (primary/secondary, states)
│  └─ input.html           Input demo (default/focus/disabled)
│
├─ assets/                 ← single home for everything a page links
│  ├─ css/
│  │  ├─ tokens.css        Compat shim → @imports tokens/primitives + tokens/semantic
│  │  ├─ tokens/
│  │  │  ├─ primitives.css Raw values (color ramps/type/spacing/radius/border/breakpoints)
│  │  │  └─ semantic.css   Role tokens (Light) + unwired [data-theme="dark"] + legacy aliases
│  │  ├─ typography.css    @font-face + heading/text classes
│  │  ├─ sidebar.css       Sidebar navigation component styles
│  │  ├─ button.css        Button component (.hw-button)
│  │  └─ input.css         Input component (.hw-input)
│  ├─ fonts/               Manrope (400–800) + Changa One (400), woff2, local
│  ├─ tokens.json          Same tokens, machine-readable (for tooling)
│  ├─ icons/
│  │  ├─ hw-icons.js       <hw-icon> web component, all icons embedded
│  │  ├─ catalog.json      List of every icon name per variant
│  │  └─ svg/{filled,hollow,duo}/   1923 raw SVGs (currentColor)
│  ├─ logo/                8 logos: horizontal / stacked / wordmark / logomark,
│  │                       each in -light and -dark
│  └─ illustration/        26 brand illustrations (illustration-01.svg …)
│
├─ brand/
│  └─ Handiwork Brand Guidelines.pdf
│
└─ scripts/
   └─ build-icons.mjs      Regenerates icons from the Abiswase icon package
```

---

## Token architecture (Primitive → Semantic)

Two layers per `TOKEN-GOVERNANCE.md`, mirrored in `assets/tokens.json`:

- **`tokens/primitives.css`** — raw values only, named `--hw-color-*`, `--hw-size-*`,
  `--hw-space-*`, `--hw-radius-*`, `--hw-border-width-*`, `--hw-bp-*`, type families/weights.
  Brand primary/secondary ramps 100–900, full gray + 10 extended palettes.
- **`tokens/semantic.css`** — role tokens that reference primitives:
  `--hw-text-*`, `--hw-bg-*`, `--hw-border-*` (incl. `--hw-border-focus` `#50C878`),
  `--hw-button-{primary,secondary}-{bg,text}-{default,hover,pressed,disabled}`,
  `--hw-input-*`, `--hw-feedback-{success,warning,error,info}-{bg,border,text}`,
  `--hw-icon-*`, `--hw-font-heading/body`. Light in `:root`; a **full but unwired**
  `[data-theme="dark"]` block (backlog); then a **legacy compatibility alias** layer
  keeping old flat `--hw-*` names alive (Option A).
- **`tokens.css`** is now just a 2-line `@import` shim so existing `<link>`s keep working.

Flagged / unresolved (comment-only, referenced by nothing): `--hw-input-bg-2`,
`--hw-bg-default-2` (identical to base in Light, diverge in Dark — purpose TBD).

## Typography system

Defined in `assets/css/typography.css`. **Changa One** for headings, **Manrope**
for body. Fonts are **vendored locally** in `assets/fonts/` (woff2, latin +
latin-ext) — fully offline, no CDN dependency. `system-ui` is the fallback.

- **Headings:** `.hw-heading-5xl` … `.hw-heading-2xs` (10 steps). Responsive —
  uses the Figma *Desktop* ramp by default and switches to the *Mobile* ramp below
  768px.
- **Body:** `.hw-text-xl` … `.hw-text-xs`, each with a `-bold` variant
  (e.g. `.hw-text-l-bold`). Helpers: `.hw-bold`, `.hw-text-muted`, `.hw-text-brand`, etc.
- Raw size / line-height / letter-spacing scales are also available as vars
  (`--hw-size-*`, `--hw-lh-*`, `--hw-ls-*`).

## Icons

`<hw-icon name="…" variant="filled|hollow|duo" size="24" color="…">`. 641 icons per
variant, recolored to `currentColor` so they follow CSS text color. All icons are
embedded in `hw-icons.js` (works over `file://`). Browse & copy tags in
the **Icons** tab in `index.html`. Programmatic API on `window.HandiworkIcons` (`.names()`, `.has()`, `.svg()`).

To pull in future upstream icon additions:

```bash
node scripts/build-icons.mjs
```

---

## Components

Reusable UI built on the tokens. Include the component's CSS + `hw-icons.js`.

### Sidebar navigation — `assets/css/sidebar.css`

```html
<aside class="hw-sidebar">                      <!-- add --noir for near-black, --drawer for mobile -->
  <div class="hw-sidebar__header">
    <img class="hw-sidebar__logo" src="assets/logo/wordmark-light.svg" alt="Handiwork">
    <hr class="hw-sidebar__divider">
  </div>
  <nav class="hw-sidebar__nav">
    <a class="hw-nav-item is-active" href="#"><hw-icon name="home" variant="filled" size="14"></hw-icon><span>Home</span></a>
    <a class="hw-nav-item" href="#"><hw-icon name="clipboard" variant="filled" size="14"></hw-icon><span>My Jobs</span></a>
  </nav>
  <div class="hw-sidebar__footer">
    <a class="hw-nav-item hw-nav-item--logout" href="#"><hw-icon name="arrow-right-from-bracket" variant="filled" size="14"></hw-icon><span>Log Out</span></a>
  </div>
</aside>
```

- **States:** add `is-active` to the current item (bg tint, green text/icon, 2px left bar); hover is automatic.
- **Themes:** `.hw-sidebar--noir` for the near-black surface (default is brand dark-green).
- **Mobile drawer:** `.hw-sidebar--drawer` + a `.hw-sidebar__close` button and `.hw-sidebar__profile` block (avatar / name / email / chevron).
- **Roles:** Customer (Home, My Jobs, Messages, Help & Support) and Vendor (adds My Services, My Orders, My Reviews, Analytics) — just change the nav items.
- Live demo of every variant: `components/sidebar.html`.

### Button — `assets/css/button.css`

```html
<button class="hw-button hw-button--primary">
  <hw-icon class="hw-button__icon" name="hammer" variant="filled" size="18"></hw-icon>
  <span class="hw-button__label">Book now</span>
</button>
<button class="hw-button hw-button--secondary">Log In</button>
```

- Variants `--primary` / `--secondary`; layout modifier `--block` (full width).
- States pulled directly from `Semantic__Color` Buttons/* (default/hover/`:active`/disabled, bg+text). Focus: `Border/focus` 2px outline, 2px offset. Sharp corners (`radius-none`), Changa One. Demo: `components/button.html`.

### Input — `assets/css/input.css`

```html
<input class="hw-input" type="text" placeholder="Search by role, skills or keywords">
```

- States: default · `:focus-visible` (`Border/focus`) · disabled (`Border/disabled` + `Text/disabled`). **No hover** by design (no Input hover token). **No error** state yet (deferred until a screen needs it). `Input/bg 2` intentionally unused. Demo: `components/input.html`.

## Deploying

- **Live:** https://handiworkv1.vercel.app
- **Repo:** https://github.com/veek000/handiwork (GitHub ↔ Vercel connected)
- Every `git push` to `master` **auto-deploys** to production. Branches get preview URLs.
- Manual deploy (if ever needed): `vercel --prod` from the project root.

## Progress log

- **Icons** — Copied the 641-icon Abiswase set (filled/hollow/duo), recolored
  black → `currentColor`, packaged as the `<hw-icon>` web component + raw SVGs, and
  built the searchable gallery.
- **Color + typography** — Pulled every variable from the Figma Handiwork file
  (nodes 39:800 / 39:1000) into `tokens.css`, `typography.css`, and `tokens.json`;
  built the visual previews.
- **Structure** — Consolidated the earlier category folders (Document/Icon/
  Illustration/Logo) into a single conventional `assets/` layout with normalized,
  space-free filenames; added the `index.html` hub and this doc.
- **Fonts** — Vendored Manrope (400–800) + Changa One (400) locally as woff2 in
  `assets/fonts/`; typography is now fully offline (no CDN).
- **Sidebar component** — Implemented the 6 Figma sidebar designs as one component
  (`assets/css/sidebar.css` + `components/sidebar.html`): customer/vendor roles,
  active/hover states, dark-green & noir themes, and the mobile drawer with profile.
- **Unified site** — Merged the standalone styleguide + icon gallery into a single
  tabbed `index.html` (overview / colors / type / icons / logos / illustrations /
  components). Colors now render from CSS variables via `getComputedStyle` (no
  `fetch`, so they work offline — the earlier blank-color-sections bug is fixed).
  Logos and illustrations are displayed inline; each section is branded with the
  Handiwork logomark.
- **Token architecture migration** — Split the flat `tokens.css` into layered
  `tokens/primitives.css` + `tokens/semantic.css` from new Figma exports
  (Primitive/Semantic Color+Type, Spacing, Border, Layout), per `TOKEN-GOVERNANCE.md`.
  Added Option A legacy alias layer (`tokens.css` → `@import` shim), a full unwired
  `[data-theme="dark"]` block (backlog), and regenerated `tokens.json`. Adopted new
  verified primitives (gray-100 `#F5F5F5`, gray-200 `#EEEEEE`, green-800 `#0A442D`);
  retired `--hw-heading-title`/`--hw-body-text`/`--hw-border-subtle`/`--hw-content-secondary`
  (migrated call sites to `text-primary`/`text-secondary`/`border-divider`); fixed a
  `--hw-text-tertiary` alias collision; Circle radius set to `50%`.
- **Button + Input components** — `assets/css/button.css` + `assets/css/input.css`
  with demos in `components/`, tokens-only, states pulled directly from
  `Semantic__Color`. Focus rings use `--hw-border-focus`.
- **Motion tokens (Phase 4a)** — Added a Motion block to `primitives.css` / `tokens.json`
  (set directly, no Figma export): `--hw-duration-fast/base/slow` (100/150/250ms) +
  `--hw-ease-standard` (`cubic-bezier(0.4,0,0.2,1)`). Wired transitions: Button bg/text
  and Input focus outline/border @ `fast`; Sidebar nav-item bg/text @ `base` with the
  left-bar indicator animated (Option B — base `::before`, `scaleY(0)→scaleY(1)`) @ `base`.
  All guarded by `prefers-reduced-motion: reduce` (collapse to 0.01ms). New **Motion tab**
  in `index.html`.
- **Sidebar token cutover (Option B)** — Migrated `sidebar.css` off the legacy
  compatibility aliases to direct tokens (A+B): surface → `--hw-color-brand-primary-900`,
  default text → `--hw-text-placeholder`, logout → `--hw-feedback-error-text`, drawer
  whites → `--hw-color-default-white`, active bg/fg → `brand-primary-light-alpha` /
  `brand-primary-200`, profile name → `--hw-text-inverse`. Fixed two stale comments
  (the active-bg/fg no longer match `Background/primary-alpha` / `Buttons/.../pressed`).
  Five dark-surface literals kept (white/danger/primary alphas + `#F1F1F1` — no matching
  token). `--hw-gray-400` alias **retained** (not sidebar-only — the Colors tab reads the
  gray ramp dynamically).
- **Landing page** — Built `landing.html` section-by-section from Figma (desktop + mobile,
  responsive @ 393/768/1024/1440): header/nav + mobile drawer · hero · About · Services
  (12-tile grid) · How-it-works (3-step timeline) · Power (perks + worker photo) · Safety
  (dark trust cards + bleed graphic) · FAQ (interactive accordion) · Testimonials (infinite
  swipe carousel, cloned-set loop) · CTA banner (logo pattern + blurred glow) + footer.
  Layered tokens only. Migrated the landing buttons from the ad-hoc `.hw-btn` to the canonical
  `.hw-button` and **deleted `assets/css/buttons.css`**. Photos in `assets/img/`; social brand
  icons in `assets/icons/social/`. Illustrations pulled from the existing set (incl. the
  reused `Handiwork Pattern.svg`).
- **Scroll reveal (Phase 4b)** — Added a page-entrance motion tier to `primitives.css`:
  `--hw-duration-reveal` (600ms), `--hw-reveal-offset` (24px), `--hw-reveal-blur` (6px),
  `--hw-stagger-step` (80ms), reusing `--hw-ease-standard`. `.reveal` elements fade in +
  slide up (24px) + sharpen (blur 6→0) as they enter, via an IntersectionObserver toggling
  **`.is-visible`** (deliberately not `.is-active`), `rootMargin: 0 0 -10% 0`, **unobserved
  after first trigger**. Stagger = `--reveal-i × step`, **capped at index 5 (400ms)**; the
  Services grid staggers by **visual row** (JS groups by `offsetTop`, breakpoint-robust).
  Progressive enhancement: the hidden state is scoped under `html.js-reveal-ready`, a class
  added **before first paint but only when `IntersectionObserver` exists** — no-JS / unsupported
  / failed load leaves content fully visible. **`prefers-reduced-motion`: the reveal is skipped
  entirely** (opacity/transform/filter/transition all off — opacity is significant motion here).
  Bleed layers (hero/about art, banner pattern+glow, cloned carousel cards) excluded; hero art
  and safety decor are fade-only (`.reveal--fade`). Also added `scroll-behavior: smooth`
  (→ `auto` under reduced-motion) with wired in-page nav anchors (Home → `#top`, FAQs →
  `#faqs`, Contacts → `#contact`).

- **FAQ + Contact pages + shared chrome extraction** — Extracted the reusable site chrome from
  `landing.html` into **`assets/css/site.css`** (globals, scroll-reveal, header/nav, mobile menu +
  animations, CTA banner, footer, the `.faq-item` accordion component, a shared `.page-*` header
  pattern, and `.hw-field` form fields) and **`assets/js/site.js`** (reveal observer, mobile-menu
  state machine, accordion). Refactored `landing.html` to consume both (carousel JS stays inline);
  its nav now links out to the new pages. Built **`faq.html`** (categorised single-column accordion —
  5 groups, ~20 Q&A) and **`contact.html`** (two-column `.hw-input` form with a static success state
  + a dark brand-900 info panel using `<hw-icon>` envelope/phone/map-pin/clock). Added
  `textarea.hw-input` (min-height + resize) to `input.css`. Tokens only; reveal + reduced-motion +
  progressive-enhancement carried across all three pages.

### Tracked debts / open decisions

- **`.hw-btn` → `.hw-button` migration** — ✅ done. `landing.html` uses the canonical
  `.hw-button`; the ad-hoc `.hw-btn` stylesheet `assets/css/buttons.css` has been **deleted**.
- **Button `:active` scale (deferred, approved)** — Add a subtle `transform: scale(0.97)` on
  `:active` to `.hw-button` (on top of the existing colour transition), reduced-motion-guarded.
  Approved as its own standalone edit to the finalized Button component — **not** folded into
  the landing/Phase-4b work. Next up.
- **Parked landing flags (resolve together)** — off-system values reproduced faithfully but
  not yet tokenized, pending a joint cleanup pass: Services labels `#313131` (→ `--hw-text-primary`,
  1-shade delta); works step-body `rgba(39,45,55,0.8)` (→ `--hw-text-secondary`); works timeline
  `#EAEBF0` + FAQ item border `#DAE0E6` (both → `--hw-border-divider`; Figma "Neutral/700" isn't
  a token); footer social icons carry Figma's `#272D37`; banner subtitle `#BDBDBD` (→ `--hw-color-gray-400`);
  the "TradeTrust" placeholder copy in the works subtitle; and the three landing section headers
  (About/Services/Works/etc. badge+title+subtitle) could consolidate into one shared component.
- **Components-tab format (resolved)** — Went with a **single consolidated Components
  tab** in `index.html`: Sidebar, Button, and Input are previewable there as stacked
  sections. Standalone per-component demo pages in `components/` are kept too (deep
  links / isolation). `sidebar.html` stays as-is (no migration needed).
- **`sidebar.css` Option B** — ✅ done. `sidebar.css` no longer references any legacy
  compatibility alias. The alias layer itself stays (other pages still use it); retire
  it fully once `index.html` / `landing.html` are migrated too.
- **Shared brand-surface role (backlog)** — Sidebar surface and Button bg both resolve
  to `#001A13` (brand/900) but for independent reasons. Sidebar now points at the
  primitive `--hw-color-brand-primary-900` (not Button's token) to avoid coupling. If
  that coupling is ever intentional, introduce a shared semantic role
  (e.g. `--hw-surface-brand-strong`) referenced by both — don't have one point at the
  other's token.

### Ideas / next steps

- Card / Badge / Tag components (un-specced — derive from primitives per rules).
- A page scaffold/template that pre-links the stylesheets.
- Decide dark-mode scope (tokens are captured, switching not wired).
