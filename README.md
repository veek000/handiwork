# Handiwork Design System

A self-contained, **offline-ready** design system & prototype toolkit for the
Handiwork brand — colors, typography, 641 icons, logos, illustrations, and UI
components, all in one static site (no build step, no server).

**→ Open `index.html`** for the full system (Overview · Colors · Typography ·
Icons · Logos · Illustrations · Components).

See **[PROJECT.md](PROJECT.md)** for the folder map, token reference, and usage.

## Using the tokens in a page

```html
<link rel="stylesheet" href="assets/css/tokens.css" />
<link rel="stylesheet" href="assets/css/typography.css" />
<script src="assets/icons/hw-icons.js"></script>

<h1 class="hw-heading-xl">Get it fixed, fast</h1>
<button style="background:var(--hw-primary);color:#fff;">
  <hw-icon name="hammer" variant="duo" size="18"></hw-icon> Book now
</button>
```

## Stack

Plain HTML + CSS + a tiny vanilla-JS web component (`<hw-icon>`). Fonts (Manrope,
Changa One) are vendored locally. Deployable as static files anywhere.
