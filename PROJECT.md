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
- **Branching (since 2026-07-05):** day-to-day work happens on **`dev`** (branched from
  `master`); each push to `dev` gets its own Vercel **preview** URL. **`master` is production
  and is only updated via a deliberate merge from `dev`** — never commit feature work straight
  to `master`. Target branch is decided per change, not defaulted.

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

- **Next.js migration (rewrite-based static serving)** — Wrapped the completed static
  pages in a Next.js app (App Router, TypeScript, Next 16 / React 19) **without porting
  any HTML to JSX**. `landing.html` / `faq.html` / `contact.html` moved verbatim into
  `public/`, and `assets/` into `public/assets/` (single source, no sync script). Clean
  routes are served by **rewrites** in `next.config.mjs` (`/`→`/landing.html`,
  `/faq`→`/faq.html`, `/contact`→`/contact.html`); **no `app/` page owns those paths**
  (a matching route would silently override the rewrite). `app/layout.tsx` is a minimal
  root layout only — it exists to satisfy the App Router and host future `app/` routes
  (customer/vendor dashboards). All internal asset paths were already relative, so they
  resolve identically once served from `public/`. Verified: all 3 routes 200 + byte-for-byte
  verbatim, zero 404s (CSS `@import`s + woff2 fonts included), `next build` passes.
  `index.html` + `components/*.html` deliberately left **out** of `public/` (internal
  style-guide tools, not production routes).

- **App layer — component wrappers + dashboard scaffolding (Phase 1)** — Added the React
  app layer over the design system, no redesign: thin wrappers whose props map 1:1 onto the
  existing BEM modifiers. **5 components** — `Button` (`.hw-button` + `--primary/--secondary/--block`
  + icon slot), `Input` (`.hw-input` passthrough), `Sidebar` (client component; role nav from the
  `sidebar.css` docs — Customer 4 items / Vendor 7 items — active item via `usePathname()` → `.is-active`),
  `DashboardShell` (server component; flex shell = 220px sidebar + fluid main, `DashboardShell.module.css`),
  and `Placeholder` (page stub). **11 pages** across two parenthesised route groups (add no URL
  segment): `(customer)` → `/customer{,/jobs,/messages,/support}`, `(vendor)` →
  `/vendor{,/services,/orders,/messages,/reviews,/analytics,/support}`. **3 layouts** — root
  (`app/layout.tsx`, wires the DS stylesheets via `<link>` + loads `hw-icons.js` at
  `strategy="afterInteractive"`) plus one per group (each renders `DashboardShell` with its role).
  **1 type declaration** (`types/hw-icon.d.ts`, JSX intrinsic element for `<hw-icon>`). Design-system
  CSS is `<link>`ed from `public/` (same files the static pages use — no duplication/drift). `npx tsc
  --noEmit` passes with zero errors; both route groups verified in-browser (correct role sidebar, icons,
  active-item highlighting). The residual hydration attribute warning was traced to a **browser wallet
  extension injecting `<html>` attributes pre-hydration** (Bybit) — an environment artifact, not an app
  bug; no code change. Foundation only — no real dashboard screen content yet (Phase 2 = data types).

- **Data-shape types (Phase 2)** — Plain TypeScript interfaces derived screen-by-screen
  from the Customer + Vendor desktop Figma flows (16 screens inspected); no DB, no mock
  data, no components. Split by domain + barrel: `types/{user,service,job,review,message,
  notification,wallet}.ts` + `types/index.ts`. **User** is a role-discriminated union
  (`CustomerUser | VendorUser`, `role` discriminator from the signup "Looking to Hire /
  Provide a Service" toggle); vendor-only fields (bio, yearsOfExperience, jobsCompleted,
  rating aggregate, availability) come off the Vendor Profile. **Job** is the core
  customer⇄vendor transaction (the vendor "My Orders" section is just a label — every field
  says Job); `JobStatus = pending | quoted | in_progress | completed | cancelled | rejected`
  ("rejected" = vendor declined, distinct from customer "cancelled"). **Service** carries
  `price` (whole-naira NGN) + `priceUnit` (`hr|day|wk`). **Review** uses a strict
  `Rating = 1|2|3|4|5` (aggregate averages stay `number`). Timestamps are ISO strings
  formatted at render (proven by the same job showing "2025-09-20 | 10:30 AM" on one screen
  and "Requested 5 min Ago" on another). **Conversation** is fully evidenced; **Message** is
  included but explicitly commented as speculative — no chat-thread screen exists yet.
  Deliberately not modelled: analytics counts (derived from Job filters) and favourites
  (no screen). `npx tsc --noEmit` passes. Next: mock data, then real dashboard screens.

- **Mock data (Phase 2.5)** — Plain fixture arrays in `mocks/` (kept separate from `types/`
  so the layer is swappable for a real source later), one file per domain + `index.ts`
  barrel: categories, users, services, reviews, jobs, conversations, wallets, notifications.
  **Referential integrity verified programmatically** (throwaway tsx script): every
  `Job.{customerId,vendorId,serviceId}`, `Review.{serviceId,vendorId}`, `Service.providerId`,
  wallet key and `Conversation.participantName` resolves; each job's vendor matches its
  service's provider; vendor/service `ratingAverage`+`reviewCount` aggregates are recomputed
  from the reviews array (not the Figma "20" placeholder). Counts: 10 users (5 customers /
  5 vendors), 9 services, 13 reviews, 14 jobs, 5 conversations, 5 notifications, 5 wallets.
  **Edge cases covered:** zero-job customer (Kristin), many-job customer (Jane, 10 → paginates),
  zero-review vendor (Grace), all six `JobStatus` values present, a conversation with
  `unreadCount>0` and one with `isTyping:true`. **Message left unmocked** (still speculative —
  only `Conversation.lastMessagePreview` carries message-shaped content). Realistic
  Lagos/Nigerian content + NGN pricing, not placeholder filler. Service imagery uses a single
  shared `public/assets/img/service-placeholder.png`; user avatars omitted (UI falls back to
  initials like the "VD" header). `npx tsc --noEmit` passes.

- **Customer Login screen (first real app screen)** — Built `/login` from Figma Customer
  Login `289:3541` (desktop + mobile are the same flow; the frames originally linked were
  the vendor variant — identical layout, differing only in active toggle + subtitle). One
  role-agnostic screen: the `RoleToggle` switches role + subtitle and submit routes to
  `/customer` or `/vendor` (UI only — no auth until Phase 6; email/password/role are local
  state, not tied to the `User` type). New **`(auth)` route group** with a shared
  `AuthShell` layout (dark brand panel + centered form; panel hidden below `--hw-bp-l`
  1024px, replaced by a top logo). Net-new reusable components (token-built, shared with
  Signup later): `AuthShell`, `RoleToggle`, `PasswordInput` (composes `Input` + eye
  show/hide, `eye`/`eye-slash` hw-icons), `SocialButton` (facebook/google/apple), plus
  `.hw-link` + `.hw-divider` utilities — all in `assets/css/auth.css`, linked in the root
  layout. Assets added: `icons/social/{google,apple,facebook}.svg` (user-supplied brand
  marks), `illustration/illustration-28.svg` (verified-worker, user-supplied),
  `img/service-placeholder.png`. Mobile-first, focus-visible via `--hw-border-focus`,
  `--hw-duration-fast` transitions, reduced-motion guarded. `npx tsc --noEmit` passes.
  Debt: `.hw-field` form pattern is duplicated (site.css for static pages, auth.css for the
  app) — consolidate into a shared form stylesheet when Signup lands.
  - **Polish pass (signed off):** viewport-locked shell (`100vh`, only the form column
    scrolls); base reset (`box-sizing` + `body{margin:0}`) added to typography.css since the
    app doesn't load site.css; `<p>` subtitles zeroed (their default margin was swamping the
    flex gaps); footer moved to normal flow (form `margin:auto 0`) so it can't overlap the
    sign-up line; mobile logo given an explicit bottom gap (auto-margin collapses when the
    form overflows a short viewport); panel logo matched to the sidebar (`height:24px`,
    left-aligned); Login heading + subtitle centred on mobile, left-aligned on desktop.
    Brand-panel glove pattern: the exported `Handiwork Pattern.svg` is a 1240×312 strip whose
    rows sit on a 134px period (2.33 periods tall) so it can't tile seamlessly — cropped a
    **2-period (268px) seamless tile → `Handiwork Pattern Tile.svg`**, rendered `720px` wide,
    bottom-anchored in a fixed-height region (`3 × ~155.6px ≈ 467px`) so exactly three clean
    bands stack, base-aligned with the illustration, nothing cut off. Login screen approved.

- **Signup wizard (second real screen)** — Built `/signup` from Figma desktop `289:6498` +
  mobile `363:12614` (same flow, two sizes). One client route, three steps: **Sign Up**
  (account: email + create/confirm password) → **Personal Information** → **Confirmation**
  (the step indicator counts only the two onboarding steps, not Sign Up). Role-agnostic like
  login; submit routes to `/customer` or `/vendor` (UI only, Phase 6 for real auth).
  **AuthShell extended** with a swappable `panel` + `mobileHeader` — login/signup-step-1 use
  the brand panel; steps 2–3 use the desktop `StepperPanel` (vertical numbered stepper w/
  connecting line, active = green `#50c878`, inactive = grey-filled) and the mobile
  `StepProgress` bar. Both login and signup pages now own their `AuthShell` (the `(auth)`
  layout is a passthrough). New reusable components: `Select` (**custom in-page dropdown** —
  native `<select>` was replaced because its OS popup spilled outside the window),
  `PhoneInput`, `OtpInput` (4 square boxes, auto-advance), `AvatarUpload` (static),
  `StepperPanel`, `StepProgress`, `ResendTimer`. Reference data in `data/locations.ts` (real
  36 states + FCT; real Lagos areas — other states out of scope, commented). Input-section
  icons are outlined (`hollow` eye + chevron); native password reveal hidden. Layout: each
  form splits into `__top` (fields) + `__foot` (button + everything under it) — on mobile the
  form fills the viewport and pins `__foot` to the base; desktop stays centred. State/Area
  side-by-side on desktop; email prefilled across steps (single value). `npx tsc --noEmit`
  passes. Signup approved.

- **Customer Home + Notification (first data-backed screen)** — Built `/customer` (Figma
  desktop `291:35211` / mobile `290:3862`), the first screen driven by real mock data. Fills
  the existing Phase-1 placeholder inside `DashboardShell`. Confirmed Customer (Book a True
  Professional, category browse, Popular Services, no wallet). **Shell rework:** the top bar
  is shared chrome, so `DashboardShell` (server) now picks the signed-in mock user by role
  (**customer → Jane Doe**, vendor → Veek) + mock notifications/messages count and renders a
  client `DashboardChrome` (owns the mobile-drawer state) → `DashboardHeader` + main. Shell is
  **viewport-locked** (fixed header, main scrolls internally) so screens like the notification
  page can pin their own top/bottom. `Sidebar` gained the real `sidebar.css` **mobile drawer**
  (close + `.hw-avatar`/`.hw-profile__*`); Messages is `mobileHidden` (envelope shortcut
  instead). **Reusable components:** `DashboardHeader`, `LocationTag`, `Avatar` (initials),
  `StarRating`, `CategoryTile`, `ServiceCard` (action slot, favourite = local UI toggle),
  `SearchBar` (uses the `Input` component for real states), `Notification{Bell,List,Item,Page}`.
  Notifications: desktop = dropdown "Tooltip" (pointer arrow); **mobile = a full page** at
  `/{role}/notifications` (back + breadcrumb + heading + tabs + list + pager, with fixed
  top/pager and only the list scrolling). Relative time via `lib/time.ts` `MOCK_REFERENCE_DATE`
  (demo-only, commented). **Assets exported from Figma into the repo:** 12 category
  illustrations (`illustration/category/*`), plus existing set files reused for invite cards
  (megaphone `illustration-22`, naira `illustration-23`) and the empty-notification bell
  (`illustration-16`); `google/apple/facebook` social icons added earlier. **Design fidelity
  pass (many rounds):** sharp corners throughout (no radius); white main bg; hero gradient
  glow over the glove pattern; category tiles are square light-green boxes with un-stretched
  illustrations (`preserveAspectRatio` fixed); invite cards in two colourways with bottom-right
  illustrations; 5 borderless service cards filling the width (5-col desktop / 2-col mobile)
  with title/price/rating/description; mobile header = 2-line hamburger + centred logo + bell,
  location on a row below with a messages envelope + unread badge; hidden scrollbars on scroll
  areas. `npx tsc --noEmit` + `next build` pass (17 routes).

- **Data-access layer (hooks/) + governance docs restored (2026-07-05)** — Retrofitted the
  first data-backed screen off direct `mocks/` imports onto a `hooks/` seam, before it could
  compound across more screens. One thin hook per domain — `useCurrentUser`, `useServices`,
  `useCategories`, `useNotifications`, `useJobs`, `useReviews`, `useConversations`, `useWallet`
  (+ barrel) — each a plain synchronous wrapper returning the existing fixtures typed against
  the Phase 2 types (no React state, so callable from server or client components; zero runtime
  change today). `mocks/` is now imported in **exactly one place — `hooks/`**; Home
  (`app/(customer)/customer/page.tsx`), `DashboardShell` (header user info + notifications +
  messages count), and `NotificationPage` consume hooks instead of importing mocks. New standing
  rule in `COMPONENT-BUILD-RULES.md` ("Data access — hooks only, never mocks/ directly"). This is
  the seam that swaps to Convex at Phase 6 (`useQuery` / server fetch) without touching a single
  consumer. Also **restored the two governance docs the repo referenced but was missing** —
  `TOKEN-GOVERNANCE.md` and `COMPONENT-BUILD-RULES.md` — into the root (PROJECT.md already linked
  TOKEN-GOVERNANCE.md; both were absent from the working tree). The Conversation per-Job `jobId`
  fix (see the Chat locked decision above) landed in the same pass. `npx tsc --noEmit` +
  `next build` pass (17 routes).

- **Customer Home visual refinements (2026-07-05)** — Tightened the first data screen to the
  mobile Figma (`290:3862` / invite row `290:4555`). **Category tiles:** the illustration now
  scales as a share of the tile (70%) instead of a fixed 48px that looked small on mobile.
  **Invite cards:** extracted into a client `InviteCarousel` — desktop keeps the 2-up grid;
  mobile is a **horizontal scroll-snap row (one full-width card per view, swipe to reveal the
  second) with sharp pagination dots that track the swipe**. Card spacing corrected to Figma
  (4px title→sub, 24px sub→button, 16px padding); the promo CTA is now a compact card-scoped
  `.hw-invite__btn` (Manrope 12px) rather than the heavier shared `.hw-button`; both illustrations
  kept (light = megaphone, dark = naira); the dark-card `#155d3e` literal was retired for
  `--hw-color-brand-primary-800`. **Popular Services:** now renders **6 on mobile (2×3), 5 on
  desktop** (the 6th hidden ≥1024px). **Hero:** mobile padding set so the search sits 16px from
  the sides *and* the base (equal gap, per Figma). Tokens only. `npx tsc --noEmit` + `next build`
  pass (17 routes).

- **Landing auth CTAs wired (2026-07-05)** — Linked the marketing chrome to the app: every
  **Log In / Login → `/login`** and **Get Started → `/signup`** across `landing.html`, `faq.html`,
  and `contact.html` (desktop header + mobile drawer; landing also covers the hero + the three
  section CTAs). Absolute paths so they hit the Next app routes directly, not the `/` rewrite.
  Out of scope, still `#`: landing "Contact Us" and the "Read Customer Story" testimonial cards.
  `next build` passes.

- **Favicon (2026-07-05)** — Added the Handiwork logomark (dark hand on brand green, 143×143 PNG)
  as the site favicon. Two placements cover the split serving model: `app/icon.png` (Next App
  Router auto-injects `<link rel="icon">` into every app route — `/login`, `/signup`, `/customer/*`,
  `/vendor/*`) and `public/favicon.png` referenced by an explicit `<link rel="icon" href="/favicon.png">`
  in the static pages (`landing.html`, `faq.html`, `contact.html`, `design-system.html`) that are
  served verbatim via rewrites. `next build` passes (now emits `/icon.png`).

- **Real Convex Auth on /login + /signup (Phase 6 start — minimal, 2026-07-06)** — Promoted the
  retired spike backend into real auth for the two auth screens. **Backend (`convex/`):** custom
  `users` table (authTables + optional signup profile fields: role, fullName, phone, countryCode,
  state, area, address); `auth.ts` = Password provider with a `profile()` mapping those fields +
  `verify: ResendOTP`, plus Google + Facebook OAuth (Apple scaffolded/commented — paid account);
  `ResendOTP.ts` sends a 4-digit email code (matches the 4-box OTP UI); `users:viewer` query.
  Deployed to the reused cloud deployment (project renamed **handiwork**, same `proper-wolf-657`).
  **Frontend:** a `(auth)`-scoped client `ConvexAuthProvider` (localStorage flow, `force-dynamic`);
  `/login` calls `signIn("password", flow:"signIn")` + Google/Facebook `signIn(provider)`; the
  `/signup` wizard creates the account at step 1 (`flow:"signUp"` with the full profile → emails
  the code) and verifies at step 2 (`flow:"email-verification"`); `useRoleRedirect` routes by the
  account's stored role (the login RoleToggle no longer drives routing — per the locked decision).
  Build-safe via `makeFunctionReference` (no `_generated` import) + fallback URL — verified `tsc`
  + `next build` pass with **no** `.env.local` and **no** `convex/_generated` (Vercel-safe). **Minimal
  scope (deliberate):** client flow only — **no route protection/middleware**, and `hooks/useCurrentUser`
  still returns the mock Jane/Veek (dashboards unchanged). **Blocked on external creds** (set via
  `npx convex env set` when provided): `AUTH_RESEND_KEY` (signup can't send codes without it),
  `AUTH_GOOGLE_ID/SECRET`, `AUTH_FACEBOOK_ID/SECRET` (+ register callback URLs at
  `https://proper-wolf-657.convex.site/api/auth/callback/{google,facebook}`). Deferred to a later
  "full" pass: middleware route protection, replacing the mock current-user, Apple OAuth, and
  Vercel/prod env wiring.

- **Dev preview deploys fixed + Preview env wiring (2026-07-07)** — Diagnosed why the auth work
  "wasn't showing up on a dev preview": it wasn't a build failure at all. Preview deploys were
  succeeding, but **`dev` and `master` had converged to the identical commit** (repeated
  `merge master: Fast-forward` on dev), so dev previews were byte-identical to production — nothing
  distinct to see. **Re-established real divergence** by committing this session's work to `dev`
  only and pushing; `dev` is now ahead of `master` by one commit, master/production untouched.
  **This was the first real test of the dev-first branching rule since it was written (2026-07-05)
  — it passed** (work landed on dev, master didn't move, dev got its own green preview
  `handiwork-4n4dlkzc9…`). **Preview env vars added** — `NEXT_PUBLIC_CONVEX_URL` +
  `NEXT_PUBLIC_CONVEX_SITE_URL` (→ `proper-wolf-657.convex.{cloud,site}`), scoped to the **`dev`**
  preview branch. Previously these existed only for Development + Production, so preview builds fell
  back to the `auth-not-configured` URL. **Runtime-verified, not just build-success:** the preview
  URL is behind Vercel Deployment Protection (SSO → `vercel.com/sso-api`, so not anonymously
  fetchable), so verification was done by pulling the exact `preview/dev` env Vercel provides,
  reproducing the production build locally, and grepping the compiled client bundle — the real
  `proper-wolf-657.convex.cloud` **is** baked into `.next/static/chunks/*.js` and the
  `auth-not-configured` fallback string is **absent**. **Deliberately NOT added to Vercel:
  `JWT_PRIVATE_KEY`, `JWKS`, `CONVEX_DEPLOYMENT`.** Reasoning (recorded so a future session doesn't
  "fix" this by re-adding them): the Vercel-built Next app reads **only** `NEXT_PUBLIC_CONVEX_URL`
  (`app/(auth)/AuthConvexProvider.tsx`; no middleware, client-side localStorage flow).
  `JWT_PRIVATE_KEY`/`JWKS` are **Convex-side** signing keys — already set on the `proper-wolf-657`
  deployment (`npx convex env list`), used by Convex server-side, never read by the Vercel runtime.
  `CONVEX_DEPLOYMENT` is a **local-CLI-only** pointer (`npx convex dev/deploy`); the Vercel build is
  plain `next build` with no `convex deploy` step. Putting any of the three on Vercel would be dead
  config (and needless secret-spread for the keys). **Also:** closed a `.gitignore` gap
  (`.env.production.local` was untracked-but-not-ignored; a root prod build / `vercel env pull`
  could have committed it). Logged a Tracked-debt to later diff `refs/original/refs/heads/dev`
  (pre-filter-branch spike history) against dev.
- **Welcome email templates committed to dev (2026-07-07)** — Customer + handyman welcome email
  HTML (`customer_welcome.html`, `handyman_welcome.html`) plus 8 image assets, committed to `dev`
  as the first dev-first unit of work. **Location note:** they live at **`emails/` in the repo
  root** (with `emails/assets/`), **not** `public/assets/email/` — flagging because they were
  referred to as being under `public/assets/email/`, which does not exist. **NOT yet tested / NOT
  wired:** these are static template files only. The Resend/Convex test-send path (the emailed
  welcome flow) **has not been built in this thread** — do not read this entry as verified working
  email delivery. Sending still depends on the deferred email wiring + `AUTH_RESEND_KEY` already
  set on Convex.

## Locked decisions for future phases (not yet built)

Consolidated from the planning conversation and organized by area so it stays scannable
as it grows. Items marked **Open** are *not* settled — they are logged deliberately so
they don't get quietly treated as decided.

### Design system

- **Breakpoints:** S=393, M=768, L=1024, XL=1440 — exact Figma names, never renamed.
  Mobile-first, `min-width` media queries only, no intermediate breakpoints.
- **Token naming transform:** Figma path → lowercase, spaces/slashes → hyphens, `hw-`
  prefix (e.g. `Buttons/primary/bg/hover` → `--hw-button-primary-bg-hover`).
- **Two-layer architecture:** `primitives.css` (raw values) → `semantic.css` (role
  tokens referencing primitives). Legacy `tokens.css` kept as a 2-line `@import` shim so
  old `<link>`s still work.
- **Fonts:** Changa One for headings, Manrope for body — **both breakpoints, one font
  system, not two.** Mobile headings use the same Changa One family as desktop, just at
  smaller sizes (verified against `Semantic__Type/Mobile.tokens.json`). Fixed at the
  Figma source, not just downstream.
- **Dark mode:** tokens captured (Light + Dark both exist), switching NOT wired.
  Explicitly deferred to v2 — decided, not still open.
- **Button/Input states** sourced directly from Figma `Semantic Color` tokens, never
  invented. **Focus-visible uses the existing `Border/focus` token (`#50C878`, present in
  both Light and Dark modes) — already in the token export, not invented** (2px
  outline/offset).
- **Component docs:** single consolidated Components tab in `index.html` (stacked
  sections) + standalone demo pages in `components/` kept for deep links. `sidebar.html`
  stays as-is, no migration.

### Landing & static routes

- Landing page stays static HTML — never ported to JSX.
- Served via Next.js rewrites: `/`→`/landing.html`, `/faq`→`/faq.html`,
  `/contact`→`/contact.html`. No `app/` page may own these paths (would silently override
  the rewrite).
- Assets moved into `public/` once — no sync script (single-person project; sync scripts
  solve a multi-team problem this doesn't have).

### Repo architecture

- Single Next.js app, not a monorepo — one repo, one deploy, one domain.
- `<hw-icon>` web component kept in Next.js (not converted to SVGR) — verified in-browser;
  a hydration warning was traced to a browser wallet extension, not a real bug.
- Shared shell: `(customer)`/`(vendor)` route groups, one `Sidebar` component fed by
  role-based nav config — never forked per role.
- Build order: UI first (mock data, real screens) before backend wiring — not
  backend-first.

### Backend

- **Convex over Firebase** — official AI-friendly tooling (`ai-files install`, MCP server,
  published guidelines/evals) outweighs the general newer-framework hallucination risk.
- **Auth + backend (Phase 6): Convex only, for both auth and backend — no fallback
  vendor.** Convex Auth for authentication, Convex as the backend/database. A deliberate
  single-vendor commitment, not a hedge. Convex Auth is officially beta (accepted risk);
  mitigations (mandatory): pin the exact version in `package.json`, and test the full auth
  flow in an isolated spike before real screens depend on it. Role derived from the
  authenticated user, replacing the current local-state RoleToggle.
- **Convex spike (prerequisite to the above):** ✅ **done + retired (2026-07-06).** Ran an
  isolated throwaway (`convex/` + `app/spike-convex/`) that verified sign-up/sign-in,
  session persistence across reload + tab close/reopen, and two-sender live message
  rendering — all passed against a real cloud deployment. The spike scaffolding has since
  been **promoted into real auth** (see the progress-log entry) and the spike route/table
  deleted.
- **Chat (post-mock-data):** text + read receipts + typing indicators, scoped per
  Job/order thread (not an open inbox) — **now enforced in the type (corrected
  2026-07-05).** `types/message.ts` `Conversation` carries a required **`jobId`** that
  scopes each thread to a specific Job. `mocks/conversations.ts` references real jobIds,
  and referential integrity was re-verified via a throwaway script: every `jobId` resolves
  to a real Job whose `customerId` is the signed-in viewer (Jane, `usr_jane`) and whose
  `vendorId` is the conversation's `participantName`. Typing indicators via the official
  `@convex-dev/presence` component — ephemeral/subscribed state, NOT a persisted field on
  Conversation. Current mock `isTyping: true` is a stand-in only; do not carry it forward
  as the real data shape when Convex wiring starts.
- **Email:** `@convex-dev/resend` (official component) — not SES/Postmark/SendGrid. Stay
  on the free tier (3,000/mo); no reason to pay or switch providers at current volume.
  - **Categories (decided):** welcome (signup); login alert (new device/location only —
    never routine logins); transactional (job lifecycle: vendor accepted/declined, job
    completed, cancelled by either party); review prompts (post-completion, both
    directions); vendor payout notification (distinct from a generic "transaction");
    password-changed confirmation; email-changed confirmation; OTP (email verification
    only); password-reset (magic link).
  - **Explicitly excluded:** promotional/marketing email — reputation risk to
    transactional deliverability (OTP/reset), and against Resend's transactional-plan
    terms. Revisit only with a dedicated sending subdomain and real consent management,
    once there's an actual audience to market to.
- **OTP scope:** email verification only, at signup. NOT used for phone (phone is
  intentionally unverified — see Trust & Safety) and NOT used for password reset.
- **Password reset:** magic link, not OTP. Reason: OTPs are readable-aloud, the exact
  mechanism behind common Nigerian fintech phone-scam fraud ("read me the code"); a magic
  link has no dictatable secret, closing that vector. If OTP is ever reconsidered for
  reset: 10-min expiry, 5-attempt lock, explicit "we will never call asking for this code"
  warning in the email, notify-on-request even if not the account owner, and invalidate
  all active sessions on successful reset.

### Payments (Flutterwave escrow)

- **Flutterwave over Paystack** — has an actual hold-then-release escrow API; Paystack's
  split is instant, not a true escrow pattern.
- **Fee structure — split, not blended:** 2% service fee (Handiwork's margin) +
  Flutterwave's processing fee passed through at cost (~1.4–1.5%, no markup). Fee lives in
  a referenced Fee Schedule, not hardcoded into ToS prose.
- **Refund/cancellation — tiered by stage and who cancelled:**
  - Before vendor accepts / vendor declines → full refund, both fees.
  - Customer cancels after vendor accepted/started → service fee retained as a disclosed
    cancellation fee; processing fee non-refundable.
  - Vendor cancels/no-shows at any stage → full refund to Customer, always, no fee charged.
  - Rejected explicitly: a blanket non-refundable fee regardless of cancellation cause
    (chargeback + disclosure risk).
- **Open, not yet decided:** dispute window length, evidence-review process, and who makes
  the final release/refund call. Currently a bracketed placeholder in the Terms of Use —
  not a real policy yet.

### Legal documents

- Privacy Policy + Terms of Use: real draft content (not honest-placeholder, not
  layout-only) — written to reflect actual current practices, marked
  `<!-- DRAFT: pending legal review -->` in source until reviewed.
- Named sub-processors: Convex, Convex Auth, Resend, Flutterwave.
- **Open:** liability cap left bracketed `[TBD]` — a real decision, not a placeholder to
  auto-fill.
- **Open, flagged but not actioned:** CAC business registration and tax obligations
  (FIRS/VAT) once real commission revenue exists — required before real launch, not before
  portfolio display.

### Trust & Safety

- Phone number is collected but **intentionally NOT verified** — its purpose is scoped
  narrowly to coordination between Customer and Vendor (arrival time, address details), not
  identity/trust vetting. A deliberate, purpose-matched decision, not an oversight — do not
  "fix" it later by demanding verification for a purpose it was never meant to serve.
- UI implication: no copy near the phone number should imply it's verified or
  guaranteed-reachable (e.g. no "verified contact" language).
- **Open — known gap, logged on purpose, not yet actioned:** if this becomes a real
  platform with real jobs happening in person, an unverified/wrong phone number becomes a
  real trust-and-safety failure at the worst moment (day-of-job coordination). Revisit
  before real launch — SMS OTP via Termii or Africa's Talking (better Nigerian
  coverage/pricing than Twilio) if phone verification is ever added.

### Scope boundary — explicitly not yet decided

- "Sellable real platform" (payments licensing exposure, KYC, production security
  hardening, dispute arbitration) was raised as an ambition but has **NOT** been scoped as
  a committed project. Treat as a separate future conversation, not something to assume is
  in progress.

### Tracked debts / open decisions

- **Verify pre-filter-branch spike history left nothing sensitive on the remote** — A
  `git filter-branch` was run on **2026-07-06 ~08:30 WAT** (per the `dev` reflog), immediately
  after the throwaway Convex spike commit, evidently to scrub the spike from history when it was
  retired. It left the automatic backup ref `refs/original/refs/heads/dev` (pre-rewrite history)
  and a duplicated spike commit. Likely benign per the reflog timing + the spike-retirement notes,
  **but not yet confirmed by an actual diff.** Follow-up (not urgent): diff
  `refs/original/refs/heads/dev` against current `dev` to see exactly what the rewrite removed, and
  confirm none of it survived on the GitHub remote. Don't let this disappear unaddressed.
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
