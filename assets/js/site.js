/* ==========================================================================
   Handiwork — shared site behaviour (all pages)
   Scroll-reveal observer, mobile-menu state machine, FAQ accordion.
   All guard for missing elements, so each page only wires what it has.
   ========================================================================== */
(function () {
  'use strict';

  /* ---- Scroll reveal: reveal groups/elements once as they enter, then unobserve ---- */
  if ('IntersectionObserver' in window) {
    var CAP = 5;
    // Grids flagged for row stagger: assign --reveal-i by visual row (breakpoint-robust).
    document.querySelectorAll('[data-reveal-stagger="row"]').forEach(function (grid) {
      var rows = [];
      Array.prototype.slice.call(grid.querySelectorAll('.reveal')).forEach(function (el) {
        var top = el.offsetTop, row = -1;
        for (var i = 0; i < rows.length; i++) { if (Math.abs(rows[i] - top) < 8) { row = i; break; } }
        if (row === -1) { rows.push(top); row = rows.length - 1; }
        el.style.setProperty('--reveal-i', Math.min(row, CAP));
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
  }

  /* ---- Mobile menu: open cascade + reverse-close cascade ---- */
  var burger = document.getElementById('burger');
  var scrim = document.getElementById('scrim');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    var navCloseTimer;
    var setNav = function (open) {
      clearTimeout(navCloseTimer);
      var body = document.body;
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) {
        body.classList.remove('nav-closing');
        body.classList.add('nav-open');
        return;
      }
      if (!body.classList.contains('nav-open')) return;   // already closed / closing
      body.classList.remove('nav-open');
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;   // instant close
      body.classList.add('nav-closing');                  // hold the panel while items exit, then drop it
      navCloseTimer = setTimeout(function () { body.classList.remove('nav-closing'); }, 420);
    };
    burger.addEventListener('click', function () { setNav(!document.body.classList.contains('nav-open')); });
    if (scrim) scrim.addEventListener('click', function () { setNav(false); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
  }

  /* ---- FAQ accordion (single-open; animates max-height) ---- */
  var faqButtons = document.querySelectorAll('.faq-item__q');
  faqButtons.forEach(function (btn) {
    var panel = btn.nextElementSibling;
    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      faqButtons.forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.style.maxHeight = null;
      });
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
})();
