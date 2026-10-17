/* ═══════════════════════════════════════════════
   v9 — Vitruvian
   JS: mobile menu, scroll header, GSAP reveals,
       hero entrance, FAQ tabs, timeline toggle,
       inquiry form, geometric parallax
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Mobile menu ─────────────────────────────── */
  var menuBtn = document.querySelector('.sh-menu-btn');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      menuBtn.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open');
      document.body.style.overflow = mobileMenu.classList.contains('is-open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menuBtn.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Header scroll state ─────────────────────── */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Hero entrance ───────────────────────────── */
  var heroEls = document.querySelectorAll('[data-hero-in]');
  if (heroEls.length) {
    var delay = 0;
    heroEls.forEach(function (el) {
      setTimeout(function () {
        el.style.transition = 'opacity .7s cubic-bezier(.22,.7,.2,1), transform .7s cubic-bezier(.22,.7,.2,1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, delay);
      delay += 120;
    });
  }

  /* ── Living W stroke animation ───────────────── */
  document.querySelectorAll('.mark__main, .mark__echo').forEach(function (path) {
    var len = path.getTotalLength ? path.getTotalLength() : 200;
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    path.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.22,.7,.2,1)';
    setTimeout(function () { path.style.strokeDashoffset = '0'; }, 600);
  });

  /* ── Geometric parallax (hero) ───────────────── */
  var heroGeo = document.querySelector('.hero__geo');
  if (heroGeo) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < window.innerHeight) {
        heroGeo.style.transform = 'translate(-50%, calc(-50% + ' + (y * 0.08) + 'px)) rotate(' + (y * 0.015) + 'deg)';
      }
    }, { passive: true });
  }

  /* ── GSAP ScrollTrigger reveals ──────────────── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.sec').forEach(function (sec) {
      gsap.from(sec.querySelectorAll('[data-reveal]'), {
        scrollTrigger: { trigger: sec, start: 'top 82%', toggleActions: 'play none none none' },
        opacity: 0,
        y: 28,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all'
      });
    });

    document.querySelectorAll('.geo').forEach(function (g) {
      gsap.from(g, {
        scrollTrigger: { trigger: g.parentElement, start: 'top 90%', toggleActions: 'play none none none' },
        scale: 0.6,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out'
      });
    });
  }

  /* ── FAQ tabs ────────────────────────────────── */
  var faqTabs = document.querySelectorAll('[data-faq]');
  faqTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = this.getAttribute('data-faq');
      faqTabs.forEach(function (t) { t.classList.remove('is-active'); });
      this.classList.add('is-active');
      document.querySelectorAll('.faq-panel').forEach(function (p) {
        p.classList.toggle('is-visible', p.id === target);
      });
    });
  });

  /* ── Timeline toggle ─────────────────────────── */
  var tlBtns = document.querySelectorAll('[data-tl]');
  tlBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = this.getAttribute('data-tl');
      tlBtns.forEach(function (b) { b.classList.remove('is-active'); });
      this.classList.add('is-active');
      var halfTl = document.querySelector('.timeline--half');
      var fullTl = document.querySelector('.timeline--full');
      if (target === 'full') {
        halfTl.classList.add('is-hidden');
        fullTl.classList.add('is-visible');
      } else {
        halfTl.classList.remove('is-hidden');
        fullTl.classList.remove('is-visible');
      }
    });
  });

  /* ── Inquiry form tabs ───────────────────────── */
  var iqTabs = document.querySelectorAll('[data-iq]');
  iqTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = this.getAttribute('data-iq');
      iqTabs.forEach(function (t) { t.classList.remove('is-active'); });
      this.classList.add('is-active');
      document.querySelectorAll('.inquiry-form').forEach(function (f) {
        f.classList.toggle('is-visible', f.id === target);
      });
    });
  });

  /* ── Form submit ─────────────────────────────── */
  document.querySelectorAll('.inquiry-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.style.display = 'none';
      var success = document.querySelector('.inquiry-success');
      if (success) success.style.display = 'block';
    });
  });

})();
