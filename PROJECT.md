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
├─ components/             Reusable UI components (built on the tokens)
│  └─ sidebar.html         Sidebar nav — standalone demo (also embedded in index)
│
├─ assets/                 ← single home for everything a page links
│  ├─ css/
│  │  ├─ tokens.css        All design tokens as CSS vars (--hw-*)
│  │  ├─ typography.css    @font-face + heading/text classes
│  │  └─ sidebar.css       Sidebar navigation component styles
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

## Color system

Defined in `assets/css/tokens.css` (CSS vars) and `assets/tokens.json`.

| Group     | Tokens | Notes |
|-----------|--------|-------|
| Brand     | `--hw-primary` `#50C878`, `--hw-primary-dark` `#001A13`, `--hw-primary-light` `#DFF1E1`, `--hw-secondary` `#FFC300`, `--hw-secondary-dark` `#816207`, `--hw-secondary-light` `#FFECB3` | Emerald + gold |
| Neutrals  | `--hw-gray-100` … `--hw-gray-900`, `--hw-white`, `--hw-black` | Gray ramp |
| Content   | `--hw-content-primary/secondary/tertiary`, `--hw-heading-title` `#152536`, `--hw-body-text` `#6B7176`, `--hw-border-subtle` `#E5E5E5` | Text & borders |
| Semantic  | `--hw-success` `#198754`, `--hw-warning` `#FFC107`, `--hw-danger` `#DC3545`, `--hw-info` `#0DCAF0` | Status colors |
| Palettes  | `--hw-{blue,indigo,purple,pink,red,orange,yellow,green,teal,cyan}-{100..900}` | Extended ramps |

> One value was inferred: `--hw-blue-300` (`#6EA8FE`) — Figma exposed the blue ramp
> without a 300 step; the standard value was filled in to complete the ramp.

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

### Ideas / next steps

- Component CSS (buttons, inputs, cards, badges) built on these tokens.
- A page scaffold/template that pre-links the stylesheets.
- Optional dark theme via a `[data-theme="dark"]` token override block.
