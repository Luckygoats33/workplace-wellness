/* ═══════════════════════════════════════════════
   v8 — Editorial Premium  ·  Workplace Wellness
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Mobile menu ──────────────────────────── */

  var menuBtn = document.getElementById('menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var open = menuBtn.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', open);
      mobileMenu.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menuBtn.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Header scroll state ──────────────────── */

  var header = document.getElementById('site-header');
  window.addEventListener('scroll', function () {
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 60);
    }
  }, { passive: true });

  /* ── Hero entrance animation ──────────────── */

  var heroEls = document.querySelectorAll('[data-hero-in]');
  heroEls.forEach(function (el, i) {
    var delay = .3 + i * .15;
    el.style.transition = 'opacity .7s cubic-bezier(.22,.7,.2,1) ' + delay + 's, transform .7s cubic-bezier(.22,.7,.2,1) ' + delay + 's';
    requestAnimationFrame(function () {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  });

  /* ── Living W stroke animation ────────────── */

  function animateW() {
    document.querySelectorAll('.mark__echo').forEach(function (el) {
      el.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.22,.7,.2,1) .1s';
      el.style.strokeDashoffset = '0';
    });
    document.querySelectorAll('.mark__main').forEach(function (el) {
      el.style.transition = 'stroke-dashoffset 1s cubic-bezier(.22,.7,.2,1) .3s';
      el.style.strokeDashoffset = '0';
    });
  }
  requestAnimationFrame(function () { setTimeout(animateW, 200); });

  /* ── GSAP scroll reveals ──────────────────── */

  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.sec').forEach(function (sec) {
      var els = sec.querySelectorAll('[data-reveal]');
      if (els.length === 0) {
        els = sec.querySelectorAll('h2, h3, p, .exp-card, .pace-card, .fac-card, .enh-card, .process-card, .faq-item, .later-banner');
      }
      gsap.from(els, {
        y: 28,
        opacity: 0,
        duration: .65,
        stagger: .07,
        ease: 'power2.out',
        scrollTrigger: { trigger: sec, start: 'top 82%', once: true }
      });
    });

    var actItems = document.querySelectorAll('.act-item');
    if (actItems.length) {
      gsap.from(actItems, {
        y: 24,
        opacity: 0,
        duration: .5,
        stagger: .1,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.act-strip', start: 'top 80%', once: true }
      });
    }

    var heroMedia = document.querySelector('.hero__img');
    if (heroMedia) {
      gsap.to(heroMedia, {
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  }

  if (document.readyState === 'complete') {
    initGSAP();
  } else {
    window.addEventListener('load', initGSAP);
  }

  /* ── FAQ tabs ─────────────────────────────── */

  var faqTabs = document.querySelectorAll('.faq-tab');
  var faqPanels = document.querySelectorAll('.faq-panel');

  faqTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var which = tab.getAttribute('data-faq');
      faqTabs.forEach(function (t) { t.classList.remove('is-active'); });
      faqPanels.forEach(function (p) { p.classList.remove('is-visible'); });
      tab.classList.add('is-active');
      var panel = document.getElementById('faq-' + which);
      if (panel) panel.classList.add('is-visible');
    });
  });

  /* ── Timeline toggle ──────────────────────── */

  var tlBtns = document.querySelectorAll('.timeline-toggle__btn');
  var tlHalf = document.querySelector('.timeline--half');
  var tlFull = document.querySelector('.timeline--full');

  tlBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var which = btn.getAttribute('data-tl');
      tlBtns.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      if (which === 'full') {
        if (tlHalf) tlHalf.classList.add('is-hidden');
        if (tlFull) tlFull.classList.add('is-visible');
      } else {
        if (tlHalf) tlHalf.classList.remove('is-hidden');
        if (tlFull) tlFull.classList.remove('is-visible');
      }
    });
  });

  /* ── Inquiry form tabs ────────────────────── */

  var inquiryTabs = document.querySelectorAll('.inquiry-tab');
  var formQuick = document.getElementById('form-quick');
  var formDetailed = document.getElementById('form-detailed');
  var inquirySuccess = document.getElementById('inquiry-success');

  inquiryTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var which = tab.getAttribute('data-form');
      inquiryTabs.forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      if (formQuick) formQuick.classList.toggle('is-visible', which === 'quick');
      if (formDetailed) formDetailed.classList.toggle('is-visible', which === 'detailed');
    });
  });

  [formQuick, formDetailed].forEach(function (form) {
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.classList.remove('is-visible');
      if (inquirySuccess) inquirySuccess.style.display = 'block';
      inquiryTabs.forEach(function (t) { t.style.display = 'none'; });
    });
  });

})();
