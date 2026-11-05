# Handiwork — Component Build Rules
(Corrected version — see change notes at bottom for what was fixed and why)

Pairs with `TOKEN-GOVERNANCE.md`. That file governs tokens; this file governs
components built on top of them.

---

## Naming
BEM-style, `hw-` prefixed.
- Block: `.hw-{component}`
- Element: `.hw-{component}__{element}`
- Modifier: `.hw-{component}--{modifier}` (variants/themes)
- State: plain state class, not a modifier (`is-active`, `is-disabled`)

## File structure
One CSS file per component in `assets/css/`, one standalone demo page in
`components/` — both following the existing `sidebar.css` / `sidebar.html`
pattern.

## Tokens only
No raw hex/px/rem values in component CSS. Every value must reference an
existing `var(--hw-*)`. If a needed value doesn't exist as a token, stop and
flag it — do not hardcode, do not silently add a new token.

## Required states per interactive component
Default, hover, focus-visible, disabled, plus any additional state visible in
the Figma component's variants (error, loading, filled, etc.) — enumerate from
Figma variants explicitly, never assume a state doesn't exist just because the
current page doesn't show it.

## Button & Input — specced, do not invent
States are defined in `Semantic__Color` (Light + Dark): default, hover,
pressed, disabled, for both bg and text.
**Focus-visible: use `var(--hw-border-focus)` (`#50C878`, confirmed identical
in Light and Dark) as a 2px outline with 2px offset.** This is a real,
confirmed token — not a derived approximation.
Flag any ambiguous token (e.g. `Input/bg 2`, still unresolved) rather than
guessing its use — do not build a state that depends on an unresolved token
until it's clarified.

## Un-specced components (no Figma semantic tokens exist yet)
Applies to anything NOT already covered by a confirmed semantic group —
currently that's everything except Button and Input (e.g. Card, Badge, Tag).
1. Do not invent silently. Derive states from existing primitives — radius,
   spacing, semantic color, border — and match the visual weight of
   components already in the system (sidebar, typography scale).
2. Before treating it as canon: list every state built, with a one-line
   rationale for each, for review. Do not fold an invented component into the
   shared library without sign-off.

## Fonts
One system, two families, all breakpoints: **Changa One (headings) + Manrope
(body)**, both already vendored in `assets/fonts/`. Mobile uses the same two
families at smaller sizes (confirmed against `Semantic__Type/Mobile.tokens.json`)
— there is no separate mobile font pair, nothing else to vendor, no CDN
fallback needed.

## Breakpoints (source: Figma `Layout`, exact names — do not rename)
```
--hw-bp-s:  393px
--hw-bp-m:  768px
--hw-bp-l:  1024px
--hw-bp-xl: 1440px
```
Mobile-first. S is the unstyled base; M/L/XL layer on via `min-width` media
queries. No max-width queries, no intermediate breakpoints.

## Theming scope
Dark mode tokens exist in full (`Semantic__Color/Dark.tokens.json`) but are
**not in scope by default.** Capture Dark values in `semantic.css` as an
unused `[data-theme="dark"]` block only if explicitly requested — do not wire
up theme switching unprompted. (Still an open decision per
`TOKEN-GOVERNANCE.md` §6 — this is the safe default until you say otherwise,
not a final call.)

## Documentation
Every new component gets: (1) a demo page in `components/`, (2) an entry in
the Components tab of `index.html`, (3) a line in the Progress Log in
`PROJECT.md`.

**Open decision, not yet resolved — flag, don't default silently:** should all
components move to one consolidated page (stacked sections in a single
`components.html` / Components tab) instead of one demo page per component?
If so, does `sidebar.html` migrate into that format now, or stay as a
documented legacy exception? Recommend the latter (leave `sidebar.html` as-is,
note the exception explicitly in the Progress Log) so live, working code isn't
touched for a documentation-format change — but confirm before Claude Code
acts on it either way.

## Reuse over fork
If a later screen needs a variant/state a component doesn't have, extend the
shared component file. Never duplicate and modify inline for a single page.

## Data access — hooks only, never Convex or mocks/ directly
**No component, page, or layout may call Convex queries or import from `mocks/`
directly.** Reads go through `hooks/` — live Convex subscriptions (`useServices`,
`useServiceDetail`, `useCustomerJobs`, `useVendorJobs`, `useThreads`,
`useThreadMessages`, `useWallet`, `useVendorReviews`, `useNotifications`,
`useViewer`, …) that return `undefined` while loading, then the UI types from
`types/` (shaped on the server in `convex/model.ts`). Pages handle the loading
(`LoadingState`) and not-found cases and pass data down as props; leaf components
(`ServiceCard`, `NotificationList`, …) stay prop-driven.

Writes call the function references in `lib/convexApi.ts` (`live.*`, `api.*`) with
`useMutation`, wrapped in `lib/useRunner` so a failure shows `ActionError` with the
server's user-facing `ConvexError` message. Never update local copies of server data
— the subscriptions update the screen by themselves.

`mocks/` is no longer read by the app: it holds the UI-phase fixtures that
`convex/seed.ts` turns into showcase vendors, services and reviews.

## Token updates (standing rule, not one-time)
Every time new token exports arrive: diff against existing
`tokens/primitives.css`, `tokens/semantic.css`, and `tokens.json`; list every
conflict and every new token; apply the naming transform from
`TOKEN-GOVERNANCE.md` §2; get sign-off before touching component or page CSS.
Log the reconciliation in the Progress Log.

---

### Change notes (corrections made to the version you pasted)
- **Removed:** Fugaz One / Outfit mobile-fonts requirement — fabricated,
  contradicted by the actual token files. No such fonts exist anywhere in the
  export.
- **Corrected:** Focus-visible rule — `Border/focus` is a real, confirmed
  token (`#50C878`, both modes). Replaced the "derive from `--hw-icon-primary`"
  workaround with the actual token.
- **Corrected:** Un-specced-components example — Button is fully specced
  (`Buttons/primary` / `Buttons/secondary` in `Semantic__Color`), so it no
  longer belongs under "derive silently, don't invent." That section now
  applies to genuinely un-specced components only.
- **Kept as-is (verified accurate):** BEM naming, file structure, tokens-only
  rule, required-states rule, breakpoints (match `Layout` exactly), naming
  transform, reconciliation protocol, documentation-decision flag.
