# Handiwork — Token Governance & Migration Rules

Standing rules for reconciling the original flat `--hw-*` token set with the
layered Primitive → Semantic token architecture now coming out of Figma.
This applies to the current migration **and** every future variable export.

---

## 1. Architecture: two layers, not one flat file

The Figma file is now structured as **Primitives** (raw palette, raw type scale,
raw spacing/radius/breakpoint numbers) feeding **Semantics** (role-based aliases:
`Text/primary`, `Buttons/primary/bg/hover`, `Border/focus`, etc.), each with
Light/Dark modes. The old `tokens.css` was flat — everything was a primitive,
even things that were really roles (`--hw-success`, `--hw-content-primary`).

**New file structure** (splits `assets/css/tokens.css` into two files):

```
assets/css/
├─ tokens/
│  ├─ primitives.css     Raw values: color ramps, type scale, spacing, radius, breakpoints
│  └─ semantic.css       Role-based aliases that reference primitives, incl. [data-theme="dark"]
├─ typography.css        (unchanged — already correct)
└─ sidebar.css           (unchanged for now — see Section 4)
```

Rule going forward: **a token only belongs in `primitives.css` if it's a raw
value with no contextual meaning** (a hex, a px number). The moment a token
represents a *role* ("this is what button backgrounds do on hover"), it goes
in `semantic.css` and references a primitive — never a hardcoded value.

---

## 2. Naming transform (apply uniformly, every import)

Figma path → CSS var: lowercase, spaces and slashes → hyphens, `hw-` prefix,
layer/category first.

```
Primitives:  Brand/primary/500          → --hw-color-brand-primary-500
             Size/L (type)              → --hw-size-l
             Space/M                    → --hw-space-m
             Radius/M                   → --hw-radius-m
             Breakpoints/L              → --hw-breakpoint-l

Semantics:   Text/primary               → --hw-text-primary
             Background/default 2       → --hw-bg-default-2   (flag — see Section 3)
             Buttons/primary/bg/hover   → --hw-button-primary-bg-hover
             Border/focus               → --hw-border-focus
             Input/bg 2                 → --hw-input-bg-2      (flag — see Section 3)
```

Apply this even where Figma's own naming is inconsistent (Title Case vs
lowercase vs trailing numbers) — never carry source inconsistency into code.

---

## 3. Flagged/ambiguous tokens — do not resolve silently

Anything ending in a bare number (`Background/default 2`, `Input/bg 2`) or
anything with no clear parallel in the old system gets a comment in the CSS,
not a guess:

```css
--hw-input-bg-2: #001A13; /* dark mode only differs from --hw-input-bg here —
                              purpose unconfirmed, check Figma usage before relying on this */
```

Still open from the last audit, unresolved:
- **`Input/bg 2`** — identical to `Input/bg` in Light, diverges in Dark. Purpose unconfirmed.
- **`--hw-heading-title` (#152536)** — no equivalent exists anywhere in the new
  Figma export. Either it's a legacy hand-picked value with no live source, or
  it maps to something not yet re-exported. Needs a decision: keep as a
  standalone legacy override, or retire it in favor of `--hw-text-primary`.

---

## 4. Migration path for existing code (don't break `sidebar.css`)

`sidebar.css` and `components/sidebar.html` are live, working, and presumably
reference old flat names (`--hw-primary`, etc.). Two options — pick one
explicitly rather than letting it happen by default:

**Option A — Compatibility aliases (safer, recommended for now)**
Keep every old `--hw-*` name alive in `semantic.css`, but point it at the new
correct value/token instead of its old hardcoded one:

```css
/* Legacy compatibility layer — do not use in new code.
   Remove once sidebar.css is migrated to semantic names directly. */
--hw-primary: var(--hw-color-brand-primary-500);
--hw-content-primary: var(--hw-text-primary);
--hw-success: var(--hw-feedback-success-text); /* was flat #198754, now role-correct */
```

This means `sidebar.css` keeps working unmodified today, and gets the
*corrected* values (e.g. properly-contrasted status colors) for free, while
new component work uses the new semantic names directly.

**Option B — Hard cutover**
Rename everything in `sidebar.css` to the new semantic names in the same pass.
Cleaner long-term, but touches working code for no functional gain right now.

Recommendation: **Option A now, Option B later** — once Button/Input/Card
components are built on the new names and the system has stabilized, do one
deliberate pass to retire the compatibility layer and update `sidebar.css` to
match. Don't let Claude Code decide this silently either way — confirm before
it touches `sidebar.css`.

---

## 5. What's net-new (wasn't in the old system at all)

These have no legacy equivalent — they're pure additions, not migrations:
- Full **Spacing** scale (`3XS`–`12XL`, 0–112px)
- Full **Border** radius (`None`–`Pill`) and width (`XS`–`XL`) scales
- **Layout breakpoints** as tokens (393 / 768 / 1024 / 1440) — previously just a hardcoded `768px` in a comment
- **`Buttons/primary`, `Buttons/secondary`** — full default/hover/pressed/disabled, bg+text, Light+Dark
- **`Input/*`** — bg, border, placeholder, text
- **`Border/focus`** — single, confirmed value for keyboard focus rings
- **`Feedback/*`** — proper 3-role (bg/border/text) status colors, replacing the old flat success/warning/danger/info

These slot straight into `semantic.css`/`primitives.css` with no reconciliation
needed — there's nothing old to conflict with.

---

## 6. Open scope decisions (still pending — do not default silently)

Carried over from the variable audit, unchanged:
1. **Dark mode** — tokens are fully specced (`[data-theme="dark"]` block is
   ready to write), but is it in scope for the current build pass or backlog?
2. **`Input/bg 2`** — see Section 3.

---

## 7. Standing reconciliation protocol (applies to every future export)

Whenever new token exports arrive from Figma:
1. Diff against current `primitives.css` / `semantic.css` — list every
   conflict and every net-new token before writing anything.
2. Apply the Section 2 naming transform uniformly.
3. Flag ambiguous tokens per Section 3 — comment, don't guess.
4. Get sign-off on scope questions (Section 6-style) before touching component
   or page CSS.
5. Only after 1–4: update the token files, then note the change in the
   `PROJECT.md` progress log.
