/* ═══════════════════════════════════════════════
   v7 — Scalable Platform  ·  Workplace Wellness
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

  /* ── Hero headline stagger ────────────────── */

  var hws = document.querySelectorAll('.hw');
  hws.forEach(function (el, i) {
    el.style.transition = 'opacity .6s ease ' + (.4 + i * .12) + 's, transform .6s ease ' + (.4 + i * .12) + 's';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });

  /* ── GSAP scroll reveals ──────────────────── */

  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.sec').forEach(function (sec) {
      var els = sec.querySelectorAll('h2, h3, p, .experience-card, .expert-card, .insight-card, .process__step, .value-col, .faq__item');
      gsap.from(els, {
        y: 24,
        opacity: 0,
        duration: .6,
        stagger: .08,
        ease: 'power2.out',
        scrollTrigger: { trigger: sec, start: 'top 80%', once: true }
      });
    });
  }

  if (document.readyState === 'complete') {
    initGSAP();
  } else {
    window.addEventListener('load', initGSAP);
  }

  /* ── Program toggle (half-day / full-day) ── */
  document.querySelectorAll('.program-toggle-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-prog');
      document.querySelectorAll('.program-toggle-btn').forEach(function (b) {
        b.classList.remove('is-active', 'btn--clay');
        b.classList.add('btn--outline');
      });
      btn.classList.add('is-active', 'btn--clay');
      btn.classList.remove('btn--outline');
      document.querySelectorAll('.program-panel').forEach(function (p) {
        p.style.display = 'none';
        p.classList.remove('is-active');
      });
      var panel = document.getElementById('prog-' + target);
      if (panel) {
        panel.style.display = '';
        panel.classList.add('is-active');
      }
    });
  });

  /* ── Chapter tabs ─────────────────────────── */

  var chapterTabs = document.querySelectorAll('.chapters__tab');
  var chapterPanels = document.querySelectorAll('.chapters__panel');

  chapterTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var idx = tab.getAttribute('data-chapter');
      chapterTabs.forEach(function (t) { t.classList.remove('is-active'); });
      chapterPanels.forEach(function (p) { p.classList.remove('is-visible'); });
      tab.classList.add('is-active');
      var panel = document.querySelector('.chapters__panel[data-panel="' + idx + '"]');
      if (panel) panel.classList.add('is-visible');
    });
  });

  /* ── Interest-based builder ───────────────── */

  var pills = document.querySelectorAll('.pill');
  var step2 = document.getElementById('builder-step2');
  var bpTitle = document.getElementById('bp-title');
  var bpMeta = document.getElementById('bp-meta');
  var bpReco = document.getElementById('bp-reco');
  var bpList = document.getElementById('bp-list');
  var bpActions = document.getElementById('bp-actions');
  var bpCopy = document.getElementById('bp-copy');

  var selected = {};

  var interestData = {
    movement:   { label: 'Movement & posture', expert: 'Sean', program: 'Movement & Posture' },
    breathing:  { label: 'Breathing education', expert: 'Brandon', program: 'Breathing & Mindful Practice' },
    connection: { label: 'Team connection', expert: 'Sean & Brandon', program: 'Flagship Experience' },
    learning:   { label: 'Practical wellness learning', expert: 'Sean & Brandon', program: 'Flagship Experience' },
    posture:    { label: 'Posture support (enhancement)', expert: 'Mike', program: 'Posture Enhancement' }
  };

  function updateBuilder() {
    var keys = Object.keys(selected).filter(function (k) { return selected[k]; });

    if (keys.length === 0) {
      bpTitle.textContent = 'Select your interests to begin';
      bpMeta.textContent = '';
      bpReco.innerHTML = '';
      bpList.innerHTML = '';
      bpActions.style.display = 'none';
      if (step2) step2.classList.add('builder__step--hidden');
      return;
    }

    if (step2) step2.classList.remove('builder__step--hidden');
    bpActions.style.display = 'flex';

    var experts = [];
    var programs = [];
    keys.forEach(function (k) {
      var d = interestData[k];
      if (d) {
        if (experts.indexOf(d.expert) === -1) experts.push(d.expert);
        if (programs.indexOf(d.program) === -1) programs.push(d.program);
      }
    });

    var hasBoth = keys.indexOf('movement') !== -1 && keys.indexOf('breathing') !== -1;
    var hasConnection = keys.indexOf('connection') !== -1 || keys.indexOf('learning') !== -1;

    if (hasBoth || hasConnection) {
      bpTitle.textContent = 'Flagship Experience';
      bpReco.innerHTML = '<p>Recommended: Our signature two-facilitator program</p>';
    } else if (keys.length === 1 && keys[0] === 'posture') {
      bpTitle.textContent = 'Posture Enhancement';
      bpReco.innerHTML = '<p>Note: Mike is available as an add-on to other programs</p>';
    } else {
      bpTitle.textContent = programs[0] || 'Custom Experience';
      bpReco.innerHTML = '';
    }

    var formatRadio = document.querySelector('input[name="b-format"]:checked');
    var typeRadio = document.querySelector('input[name="b-type"]:checked');
    var sizeRadio = document.querySelector('input[name="b-size"]:checked');
    var format = formatRadio ? formatRadio.value : 'half';
    var type = typeRadio ? typeRadio.parentElement.textContent.trim() : '';
    var size = sizeRadio ? sizeRadio.parentElement.textContent.trim() : '';

    bpMeta.textContent = (format === 'half' ? 'Half-day' : 'Full-day') + ' · ' + type + ' · ' + size;

    var items = [];
    keys.forEach(function (k) {
      var d = interestData[k];
      if (d) items.push(d.label + ' with ' + d.expert);
    });
    bpList.innerHTML = items.map(function (t) { return '<li>' + t + '</li>'; }).join('');
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var interest = pill.getAttribute('data-interest');
      selected[interest] = !selected[interest];
      pill.classList.toggle('is-selected', selected[interest]);
      updateBuilder();
    });
  });

  document.querySelectorAll('input[name="b-format"], input[name="b-type"], input[name="b-size"]').forEach(function (radio) {
    radio.addEventListener('change', updateBuilder);
  });

  if (bpCopy) {
    bpCopy.addEventListener('click', function () {
      var keys = Object.keys(selected).filter(function (k) { return selected[k]; });
      var text = 'Interests: ' + keys.map(function (k) { return interestData[k] ? interestData[k].label : k; }).join(', ');
      var formatRadio = document.querySelector('input[name="b-format"]:checked');
      var typeRadio = document.querySelector('input[name="b-type"]:checked');
      if (formatRadio) text += '\nFormat: ' + (formatRadio.value === 'half' ? 'Half-day' : 'Full-day');
      if (typeRadio) text += '\nEvent: ' + typeRadio.parentElement.textContent.trim();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        bpCopy.textContent = 'Copied!';
        setTimeout(function () { bpCopy.textContent = 'Copy my selections'; }, 2000);
      }
    });
  }

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

  /* ── Header scroll effect ─────────────────── */

  var header = document.getElementById('site-header');
  var lastY = 0;

  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (header) {
      if (y > 100) {
        header.style.boxShadow = '0 2px 12px rgba(0,0,0,.06)';
      } else {
        header.style.boxShadow = '';
      }
    }
    lastY = y;
  }, { passive: true });

})();
