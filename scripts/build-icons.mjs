// Handiwork icon build script
// Copies the Abiswase icon set into the Handiwork project and makes the SVGs
// usable in a plain HTML prototype:
//   1. Copies every SVG, swapping fill/stroke "black" -> "currentColor" so icons
//      inherit CSS text color.
//   2. Emits a single self-contained JS file that registers a <hw-icon> custom
//      element with every icon embedded (works over file:// with no server).
//
// Run:  node scripts/build-icons.mjs
//
// Source can be overridden with the first CLI arg.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const SRC =
  process.argv[2] ||
  'C:/Users/timmy/Documents/GitHub/Abiswase/packages/icons/svg';

const OUT_SVG = path.join(PROJECT_ROOT, 'assets', 'icons', 'svg');
const OUT_JS = path.join(PROJECT_ROOT, 'assets', 'icons', 'hw-icons.js');
const OUT_CATALOG = path.join(PROJECT_ROOT, 'assets', 'icons', 'catalog.json');

const VARIANTS = ['filled', 'hollow', 'duo'];

// Pull viewBox + inner markup out of an <svg>, recoloring black -> currentColor.
function transform(svg) {
  const viewBox = (svg.match(/viewBox="([^"]*)"/) || [, '0 0 16 16'])[1];
  let inner = svg
    .replace(/<svg[^>]*>/i, '')
    .replace(/<\/svg>\s*$/i, '')
    .trim();
  // Recolor: solid black shapes should follow the current text color.
  inner = inner
    .replace(/fill="black"/g, 'fill="currentColor"')
    .replace(/stroke="black"/g, 'stroke="currentColor"')
    .replace(/fill="#000000"/gi, 'fill="currentColor"')
    .replace(/fill="#000"/gi, 'fill="currentColor"');
  // Collapse whitespace between tags to trim file size.
  inner = inner.replace(/>\s+</g, '><');
  return { viewBox, inner };
}

async function main() {
  const data = {};
  const catalog = { variants: VARIANTS, icons: {} };
  let total = 0;

  for (const variant of VARIANTS) {
    const srcDir = path.join(SRC, variant);
    const outDir = path.join(OUT_SVG, variant);
    await fs.mkdir(outDir, { recursive: true });

    const files = (await fs.readdir(srcDir)).filter((f) => f.endsWith('.svg'));
    files.sort();

    data[variant] = {};
    catalog.icons[variant] = [];

    for (const file of files) {
      const name = file.replace(/\.svg$/, '');
      const raw = await fs.readFile(path.join(srcDir, file), 'utf8');
      const { viewBox, inner } = transform(raw);

      // Write recolored standalone SVG.
      const standalone = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none">${inner}</svg>\n`;
      await fs.writeFile(path.join(outDir, file), standalone);

      data[variant][name] = { v: viewBox, p: inner };
      catalog.icons[variant].push(name);
      total++;
    }
  }

  await fs.writeFile(OUT_CATALOG, JSON.stringify(catalog, null, 2));
  await fs.writeFile(OUT_JS, buildComponentJs(data));

  console.log(`Built ${total} icons across ${VARIANTS.length} variants.`);
  console.log(`  SVGs:      ${path.relative(PROJECT_ROOT, OUT_SVG)}`);
  console.log(`  Component: ${path.relative(PROJECT_ROOT, OUT_JS)}`);
  console.log(`  Catalog:   ${path.relative(PROJECT_ROOT, OUT_CATALOG)}`);
}

function buildComponentJs(data) {
  const json = JSON.stringify(data);
  return `/**
 * Handiwork icons — self-contained.
 * Include this file, then use the element anywhere:
 *
 *   <script src="assets/icons/hw-icons.js"></script>
 *   <hw-icon name="hammer" variant="duo" size="24"></hw-icon>
 *
 * Attributes:
 *   name     required   icon name, e.g. "home", "hammer", "user"
 *   variant  filled     "filled" | "hollow" | "duo"
 *   size     24         pixel size (number or CSS length)
 *   color    inherit    any CSS color; defaults to surrounding text color
 *
 * Programmatic access: window.HandiworkIcons.names('filled'), .has(name, variant)
 */
(function () {
  var ICONS = ${json};

  function render(el) {
    var name = el.getAttribute('name');
    var variant = el.getAttribute('variant') || 'filled';
    var size = el.getAttribute('size') || '24';
    var color = el.getAttribute('color');
    var set = ICONS[variant] || ICONS.filled;
    var icon = set && set[name];

    var px = /^\\d+$/.test(String(size)) ? size + 'px' : size;
    el.style.display = 'inline-flex';
    el.style.width = px;
    el.style.height = px;
    el.style.lineHeight = '0';
    if (color) el.style.color = color;

    if (!icon) {
      el.innerHTML = '';
      if (name) console.warn('[hw-icon] unknown icon: ' + variant + '/' + name);
      return;
    }
    el.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"' +
      ' viewBox="' + icon.v + '" fill="none" aria-hidden="true"' +
      ' style="display:block">' + icon.p + '</svg>';
  }

  var HwIcon = function () {};
  if (typeof HTMLElement !== 'undefined') {
    HwIcon = class extends HTMLElement {
      static get observedAttributes() { return ['name', 'variant', 'size', 'color']; }
      connectedCallback() { render(this); }
      attributeChangedCallback() { if (this.isConnected) render(this); }
    };
    if (!customElements.get('hw-icon')) customElements.define('hw-icon', HwIcon);
  }

  window.HandiworkIcons = {
    data: ICONS,
    names: function (variant) { return Object.keys(ICONS[variant || 'filled'] || {}); },
    has: function (name, variant) {
      var set = ICONS[variant || 'filled'];
      return !!(set && set[name]);
    },
    // Returns an <svg> markup string, handy for injecting without the element.
    svg: function (name, opts) {
      opts = opts || {};
      var set = ICONS[opts.variant || 'filled'] || ICONS.filled;
      var icon = set[name];
      if (!icon) return '';
      var size = opts.size || 24;
      var px = /^\\d+$/.test(String(size)) ? size + 'px' : size;
      var style = 'width:' + px + ';height:' + px +
        (opts.color ? ';color:' + opts.color : '');
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + icon.v +
        '" fill="none" style="' + style + '">' + icon.p + '</svg>';
    }
  };
})();
`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
