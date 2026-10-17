/* v5 — Cinematic Experience • JavaScript */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Living W SVG draw-on animation ── */
  function initLivingW() {
    document.querySelectorAll('.mark__main, .mark__echo').forEach(function (p) {
      var len = p.getTotalLength ? p.getTotalLength() : 314;
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = reduced ? '0' : String(len);
    });
    if (reduced) return;
    gsap.utils.toArray('.mark__main, .mark__echo').forEach(function (p) {
      var len = p.getTotalLength ? p.getTotalLength() : 314;
      gsap.to(p, { strokeDashoffset: 0, duration: 2, ease: 'power2.out', delay: 0.3 });
    });
    // Scroll-linked subtle pulse on hero W
    var heroW = document.querySelector('.hero__w');
    if (heroW) {
      gsap.to(heroW, {
        scale: 1.05,
        opacity: 0.7,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
  }

  /* ── 2. Kinetic hero headline ── */
  function initHero() {
    var words = document.querySelectorAll('.hero__headline .word');
    var sub = document.querySelector('.hero__sub');
    var actions = document.querySelector('.hero__actions');
    if (reduced) {
      words.forEach(function (w) { w.style.opacity = '1'; w.style.transform = 'none'; });
      if (sub) sub.style.opacity = '1';
      if (actions) actions.style.opacity = '1';
      return;
    }
    gsap.to(words, {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power2.out', delay: 0.8
    });
    if (sub) gsap.to(sub, { opacity: 1, duration: 0.8, delay: 1.6 });
    if (actions) gsap.to(actions, { opacity: 1, duration: 0.8, delay: 1.9 });
  }

  /* ── 3. Sticky header: compact + hide/show ── */
  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;
    var lastY = 0;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var y = window.scrollY;
          if (y > 200) {
            header.classList.add('is-compact');
          } else {
            header.classList.remove('is-compact');
          }
          if (y > lastY && y > 400) {
            header.classList.add('is-hidden');
          } else {
            header.classList.remove('is-hidden');
          }
          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ── 4. Experience selector (section 02) ── */
  function initExperience() {
    var pills = document.querySelectorAll('.exp-pill');
    var panels = document.querySelectorAll('.exp-panel');
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var key = this.getAttribute('data-exp');
        pills.forEach(function (p) { p.classList.remove('is-active'); p.setAttribute('aria-selected', 'false'); });
        this.classList.add('is-active');
        this.setAttribute('aria-selected', 'true');
        panels.forEach(function (p) { p.classList.remove('is-visible'); });
        var target = document.getElementById('exp-' + key);
        if (target) target.classList.add('is-visible');
      });
    });
  }

  /* ── 5. Chapter walkthrough (section 03) ── */
  function initChapters() {
    var tabs = document.querySelectorAll('.chapter-tab');
    var panels = document.querySelectorAll('.chapter-panel');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var ch = this.getAttribute('data-chapter');
        tabs.forEach(function (t) { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
        this.classList.add('is-active');
        this.setAttribute('aria-selected', 'true');
        panels.forEach(function (p) { p.classList.remove('is-visible'); });
        var target = document.getElementById('chapter-' + ch);
        if (target) target.classList.add('is-visible');
      });
      tab.addEventListener('keydown', function (e) {
        var allTabs = Array.from(tabs);
        var idx = allTabs.indexOf(this);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          var next = allTabs[(idx + 1) % allTabs.length];
          next.click();
          next.focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          var prev = allTabs[(idx - 1 + allTabs.length) % allTabs.length];
          prev.click();
          prev.focus();
        }
      });
    });
  }

  /* ── 6. Program comparison (section 05) ── */
  function initPrograms() {
    var btns = document.querySelectorAll('.program-toggle__btn');
    var half = document.getElementById('program-half');
    var full = document.getElementById('program-full');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = this.getAttribute('data-program');
        btns.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
        this.classList.add('is-active');
        this.setAttribute('aria-selected', 'true');
        if (key === 'half') {
          half.classList.add('is-visible');
          full.classList.remove('is-visible');
        } else {
          full.classList.add('is-visible');
          half.classList.remove('is-visible');
        }
      });
    });
  }

  /* ── 7. Event configurator (section 06) ── */
  function initBuilder() {
    var form = document.querySelector('.builder-controls');
    if (!form) return;
    var titleEl = document.getElementById('bp-title');
    var metaEl = document.getElementById('bp-meta');
    var listEl = document.getElementById('bp-list');
    var copyBtn = document.getElementById('builder-copy');

    var halfItems = [
      'Welcome and participation options',
      'Guided movement and education with Sean',
      'Pause and transition',
      'Guided breathing with Brandon',
      'Group closing and practical reflections'
    ];
    var fullItems = [
      'Welcome and participation options',
      'Movement session I with Sean',
      'Break and reflection',
      'Breathing workshop with Brandon',
      'Lunch break',
      'Movement session II',
      'Education and group discussion',
      'Closing ceremony and takeaways'
    ];
    var typeLabels = { employee: 'Employee gathering', leadership: 'Leadership retreat', conference: 'Company conference' };
    var sizeLabels = { small: 'Under 50 attendees', medium: '50–150 attendees', large: '150+ attendees' };

    function update() {
      var fmt = form.querySelector('[name="b-format"]:checked');
      var typ = form.querySelector('[name="b-type"]:checked');
      var sz = form.querySelector('[name="b-size"]:checked');
      var posture = form.querySelector('[name="b-posture"]');
      var takeaway = form.querySelector('[name="b-takeaway"]');

      var isHalf = fmt && fmt.value === 'half';
      titleEl.textContent = (isHalf ? 'Core half-day' : 'Extended full-day') + ' experience';
      metaEl.textContent = (typ ? typeLabels[typ.value] || '' : '') + ' · ' + (sz ? sizeLabels[sz.value] || '' : '');

      var items = isHalf ? halfItems.slice() : fullItems.slice();
      if (posture && posture.checked) items.push('Optional posture support session with Mike');
      if (takeaway && takeaway.checked) items.push('Discuss optional post-event resource sharing');

      listEl.innerHTML = '';
      items.forEach(function (item) {
        var li = document.createElement('li');
        li.textContent = item;
        listEl.appendChild(li);
      });
    }

    form.addEventListener('change', update);

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = titleEl.textContent + '\n' + metaEl.textContent + '\n\n';
        var items = listEl.querySelectorAll('li');
        items.forEach(function (li) { text += '— ' + li.textContent + '\n'; });
        text += '\nIllustrative outline only. Availability, pricing, and capacity are confirmed during planning.';
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            copyBtn.textContent = 'Copied!';
            setTimeout(function () { copyBtn.textContent = 'Copy outline'; }, 2000);
          });
        }
      });
    }

    // Pre-fill inquiry from builder
    var proposeBtn = document.getElementById('builder-propose');
    if (proposeBtn) {
      proposeBtn.addEventListener('click', function () {
        var typ = form.querySelector('[name="b-type"]:checked');
        if (typ) {
          var fEvent = document.getElementById('f-event');
          if (fEvent) fEvent.value = typ.value;
        }
      });
    }
  }

  /* ── 8. Breathing ring (section 07) ── */
  function initBreathing() {
    var btn = document.getElementById('breath-btn');
    var text = document.getElementById('breath-text');
    var ring = document.querySelector('.breath-ring__circle');
    if (!btn || !text || !ring) return;

    var running = false;
    var phase = 'in';
    var timer = null;
    var count = 0;

    function tick() {
      count++;
      if (count <= 4) {
        text.textContent = 'Breathe in... ' + count;
        ring.setAttribute('r', String(50 + count * 5));
      } else if (count <= 8) {
        text.textContent = 'Breathe out... ' + (count - 4);
        ring.setAttribute('r', String(70 - (count - 4) * 5));
      }
      if (count >= 8) count = 0;
    }

    btn.addEventListener('click', function () {
      if (running) {
        clearInterval(timer);
        running = false;
        btn.textContent = 'Start';
        btn.classList.remove('is-active');
        text.textContent = 'Ready';
        ring.setAttribute('r', '50');
        count = 0;
      } else {
        running = true;
        btn.textContent = 'Pause';
        btn.classList.add('is-active');
        count = 0;
        tick();
        timer = setInterval(tick, 1000);
      }
    });
  }

  /* ── 9. Participation demo (section 07) ── */
  function initParticipation() {
    var cards = document.querySelectorAll('.participation-opt');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        cards.forEach(function (c) { c.classList.remove('is-active'); });
        this.classList.add('is-active');
      });
    });
  }

  /* ── 10. Accordion (sections 08, 09) ── */
  function initAccordion() {
    document.querySelectorAll('.accordion__trigger').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var item = this.closest('.accordion__item');
        var isOpen = item.classList.contains('is-open');
        // Close siblings
        item.parentElement.querySelectorAll('.accordion__item').forEach(function (i) {
          i.classList.remove('is-open');
          i.querySelector('.accordion__trigger').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          this.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ── 11. Scroll reveal animations ── */
  function initScrollReveal() {
    if (reduced) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.reveal').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        }
      );
    });
  }

  /* ── 12. Smooth scroll for anchor links ── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (id === '#') return;
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Close mobile menu if open
          var menu = document.getElementById('mobile-menu');
          if (menu) menu.classList.remove('is-open');
        }
      });
    });
  }

  /* ── 13. Mobile menu ── */
  function initMobileMenu() {
    var menu = document.getElementById('mobile-menu');
    var openBtn = document.getElementById('menu-open');
    var closeBtn = document.getElementById('menu-close');
    if (!menu || !openBtn) return;

    openBtn.addEventListener('click', function () {
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      openBtn.setAttribute('aria-expanded', 'true');
      if (closeBtn) closeBtn.focus();
    });

    function close() {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('aria-expanded', 'false');
    }
    if (closeBtn) closeBtn.addEventListener('click', close);
    menu.addEventListener('click', function (e) {
      if (e.target === menu) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
    });
  }

  /* ── 14. Form handling ── */
  function initForm() {
    var form = document.getElementById('inquiry-form');
    var success = document.getElementById('form-success');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        if (!f.value.trim()) { valid = false; f.style.borderColor = '#C17E68'; }
        else { f.style.borderColor = ''; }
      });
      if (valid) {
        form.style.display = 'none';
        if (success) success.classList.add('is-visible');
      }
    });

    // Form toggle for optional fields
    var toggleBtn = document.getElementById('form-toggle-btn');
    var toggle = document.getElementById('form-toggle');
    if (toggleBtn && toggle) {
      toggleBtn.addEventListener('click', function () {
        toggle.classList.toggle('is-open');
      });
    }
  }

  /* ── Init everything ── */
  function init() {
    initLivingW();
    initHero();
    initHeader();
    initExperience();
    initChapters();
    initPrograms();
    initBuilder();
    initBreathing();
    initParticipation();
    initAccordion();
    initScrollReveal();
    initSmoothScroll();
    initMobileMenu();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
