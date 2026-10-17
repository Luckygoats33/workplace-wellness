/* v6 — The Human Experience — Interactive behaviors */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Version dropdown ── */
  var vp = document.getElementById('version-picker');
  if (vp) vp.addEventListener('change', function () { window.location.href = this.value; });

  /* ── GSAP setup ── */
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ── Living W draw ── */
  if (!reduced) {
    document.querySelectorAll('.living-w').forEach(function (w) {
      var paths = w.querySelectorAll('path');
      paths.forEach(function (p) { p.style.strokeDashoffset = '0'; });
      if (gsap) {
        gsap.fromTo(w.querySelectorAll('.mark__main'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2, ease: 'power2.out', delay: .4 });
        gsap.fromTo(w.querySelectorAll('.mark__echo'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.5, ease: 'power2.out', delay: .6 });
      }
    });
  }

  /* ── Hero reveal ── */
  if (!reduced && gsap) {
    var tl = gsap.timeline({ delay: .2 });
    var heroTitle = document.querySelector('.hero__title');
    var heroSub = document.querySelector('.hero__sub');
    var heroActions = document.querySelector('.hero__actions');
    if (heroTitle) tl.from(heroTitle, { opacity: 0, y: 30, duration: .8, ease: 'power3.out' });
    if (heroSub) tl.from(heroSub, { opacity: 0, y: 20, duration: .6, ease: 'power3.out' }, '-=.4');
    if (heroActions) tl.from(heroActions, { opacity: 0, y: 20, duration: .6, ease: 'power3.out' }, '-=.3');
  }

  /* ── Sticky header ── */
  var header = document.querySelector('.site-header');
  if (header) {
    var lastY = 0;
    var heroEl = document.querySelector('.hero');
    var heroH = heroEl ? heroEl.offsetHeight : 400;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y > heroH) {
        header.classList.add('is-compact');
        header.classList.toggle('is-hidden', y > lastY && y > heroH + 200);
      } else {
        header.classList.remove('is-compact', 'is-hidden');
      }
      lastY = y;
    }, { passive: true });
  }

  /* ── Mobile menu ── */
  var menuBtn = document.querySelector('.hdr-menu-btn');
  var menuOverlay = document.querySelector('.mobile-menu');
  var menuClose = menuOverlay ? menuOverlay.querySelector('.mobile-menu__close') : null;
  function toggleMenu(open) {
    if (!menuOverlay) return;
    menuOverlay.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { toggleMenu(true); });
  if (menuClose) menuClose.addEventListener('click', function () { toggleMenu(false); });
  if (menuOverlay) menuOverlay.addEventListener('click', function (e) { if (e.target === menuOverlay) toggleMenu(false); });
  document.querySelectorAll('.mobile-menu a').forEach(function (a) {
    a.addEventListener('click', function () { toggleMenu(false); });
  });

  /* ── Experience pills (section 02) ── */
  var expPills = document.querySelectorAll('.exp-pill');
  var expPanels = document.querySelectorAll('.exp-panel');
  expPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var t = pill.dataset.target;
      expPills.forEach(function (p) { p.classList.remove('is-active'); });
      pill.classList.add('is-active');
      expPanels.forEach(function (panel) {
        var show = panel.id === t;
        panel.classList.toggle('is-active', show);
      });
    });
  });

  /* ── Mindful moment (section 03) ── */
  var momentBtn = document.querySelector('.moment-start .btn-primary');
  var momentRing = document.querySelector('.moment-ring');
  var momentTimer = document.querySelector('.moment-timer');
  var momentPhase = document.querySelector('.moment-phase');
  var momentComplete = document.querySelector('.moment-complete');
  var momentStartWrap = document.querySelector('.moment-start');
  var phases = [
    'Notice where you are…',
    'Feel your feet on the floor…',
    'Let your shoulders relax…',
    'Take one natural breath…'
  ];
  var momentInterval = null;

  if (momentBtn && !reduced) {
    momentBtn.addEventListener('click', function () {
      var seconds = 20;
      var phaseIdx = 0;
      momentBtn.style.display = 'none';
      if (momentRing) momentRing.classList.add('is-breathing');
      if (momentPhase) momentPhase.textContent = phases[0];
      if (momentTimer) momentTimer.textContent = seconds;

      momentInterval = setInterval(function () {
        seconds--;
        if (momentTimer) momentTimer.textContent = seconds;
        if (seconds === 15) phaseIdx = 1;
        else if (seconds === 10) phaseIdx = 2;
        else if (seconds === 5) phaseIdx = 3;
        if (momentPhase) momentPhase.textContent = phases[phaseIdx];

        if (seconds <= 0) {
          clearInterval(momentInterval);
          if (momentRing) momentRing.classList.remove('is-breathing');
          if (momentPhase) momentPhase.textContent = '';
          if (momentTimer) momentTimer.textContent = '';
          if (momentComplete) momentComplete.classList.add('is-visible');
          if (momentStartWrap) momentStartWrap.style.display = 'none';
        }
      }, 1000);
    });
  }
  if (reduced && momentPhase) {
    momentPhase.textContent = 'Notice your surroundings. Feel your feet on the floor. Let your breathing settle naturally.';
  }

  /* ── Walkthrough chapters (section 05) ── */
  var walkTabs = document.querySelectorAll('.walk-tab');
  var walkChapters = document.querySelectorAll('.walk-chapter');
  walkTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var t = tab.dataset.chapter;
      walkTabs.forEach(function (tb) { tb.classList.remove('is-active'); });
      tab.classList.add('is-active');
      walkChapters.forEach(function (ch) {
        ch.classList.toggle('is-active', ch.id === t);
      });
    });
    tab.addEventListener('keydown', function (e) {
      var tabs = Array.from(walkTabs);
      var idx = tabs.indexOf(tab);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        var next = tabs[(idx + 1) % tabs.length];
        next.click();
        next.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        var prev = tabs[(idx - 1 + tabs.length) % tabs.length];
        prev.click();
        prev.focus();
      }
    });
  });

  /* ── Event configurator (section 06) ── */
  var configForm = document.querySelector('.config-choices');
  var previewTitle = document.getElementById('config-title');
  var previewMeta = document.getElementById('config-meta');
  var previewList = document.getElementById('config-steps');
  var halfDaySteps = ['Welcome and participation options', 'Guided movement with Sean', 'Break and transition', 'Guided breathing with Brandon', 'Group discussion and reflections', 'Closing and practical takeaways'];
  var fullDaySteps = ['Welcome and participation options', 'Movement session I with Sean', 'Break and transition', 'Breathing workshop with Brandon', 'Lunch break', 'Movement session II', 'Education and group discussion', 'Closing ceremony and takeaways'];

  function updatePreview() {
    if (!configForm) return;
    var fd = new FormData(configForm);
    var eventType = fd.get('event-type') || 'Employee gathering';
    var format = fd.get('format') || 'half';
    var audience = fd.get('audience') || 'Under 50';
    var posture = fd.get('posture');
    var resources = fd.get('resources');

    var formatLabel = format === 'full' ? 'Full-day' : 'Half-day';
    if (previewTitle) previewTitle.textContent = formatLabel + ' experience';
    if (previewMeta) previewMeta.textContent = eventType + ' · ' + audience + ' attendees';

    var steps = format === 'full' ? fullDaySteps.slice() : halfDaySteps.slice();
    if (posture) steps.splice(steps.length - 1, 0, 'Optional posture session with Mike');
    if (resources) steps.push('Post-event resource distribution');

    if (previewList) {
      previewList.innerHTML = '';
      steps.forEach(function (s) {
        var li = document.createElement('li');
        li.textContent = s;
        previewList.appendChild(li);
      });
    }
  }

  if (configForm) {
    configForm.addEventListener('change', updatePreview);
    updatePreview();
  }

  var copyBtn = document.getElementById('config-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var title = previewTitle ? previewTitle.textContent : '';
      var meta = previewMeta ? previewMeta.textContent : '';
      var items = previewList ? Array.from(previewList.children).map(function (li, i) { return (i + 1) + '. ' + li.textContent; }).join('\n') : '';
      var text = 'Workplace Wellness — Proposed Experience\n' + title + '\n' + meta + '\n\n' + items + '\n\nIllustrative outline only. Details confirmed during planning.';
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.textContent = 'Copied!';
        setTimeout(function () { copyBtn.textContent = 'Copy outline'; }, 2000);
      });
    });
  }

  var planBtn = document.getElementById('config-plan');
  if (planBtn) {
    planBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var fd = new FormData(configForm);
      var eventType = fd.get('event-type') || '';
      var audience = fd.get('audience') || '';
      var planSection = document.getElementById('plan');
      if (planSection) planSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(function () {
        var evSel = document.getElementById('inq-event');
        var auSel = document.getElementById('inq-audience');
        if (evSel && eventType) {
          for (var i = 0; i < evSel.options.length; i++) {
            if (evSel.options[i].value.toLowerCase().indexOf(eventType.toLowerCase().split(' ')[0]) > -1) {
              evSel.selectedIndex = i; break;
            }
          }
        }
        if (auSel && audience) {
          for (var j = 0; j < auSel.options.length; j++) {
            if (auSel.options[j].text.indexOf(audience.split(' ')[0]) > -1) {
              auSel.selectedIndex = j; break;
            }
          }
        }
      }, 600);
    });
  }

  /* ── Accordion ── */
  document.querySelectorAll('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var body = item.querySelector('.acc-body');
      var inner = body ? body.querySelector('.acc-body__inner') : null;
      var isOpen = item.classList.contains('is-open');

      item.parentElement.querySelectorAll('.acc-item').forEach(function (it) {
        it.classList.remove('is-open');
        var b = it.querySelector('.acc-body');
        if (b) b.style.maxHeight = '0';
      });

      if (!isOpen && body && inner) {
        item.classList.add('is-open');
        body.style.maxHeight = inner.scrollHeight + 'px';
      }
    });
  });

  /* ── Form ── */
  var formToggle = document.querySelector('.form-toggle button');
  var formExtra = document.querySelector('.form-extra');
  if (formToggle && formExtra) {
    formToggle.addEventListener('click', function () {
      var open = formExtra.classList.toggle('is-open');
      formToggle.textContent = open ? 'Hide additional details' : '+ Add more detail';
    });
  }

  var inqForm = document.getElementById('inquiry-form');
  var formSuccess = document.querySelector('.form-success');
  if (inqForm) {
    inqForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      inqForm.querySelectorAll('[required]').forEach(function (f) {
        var group = f.closest('.form-group');
        if (!f.value.trim()) {
          if (group) group.classList.add('has-error');
          valid = false;
        } else {
          if (group) group.classList.remove('has-error');
        }
      });
      var emailField = inqForm.querySelector('[type=email]');
      if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        var eg = emailField.closest('.form-group');
        if (eg) eg.classList.add('has-error');
        valid = false;
      }
      if (valid) {
        inqForm.style.display = 'none';
        if (formSuccess) formSuccess.classList.add('is-visible');
      }
    });
    inqForm.querySelectorAll('[required]').forEach(function (f) {
      f.addEventListener('input', function () {
        var g = f.closest('.form-group');
        if (g && f.value.trim()) g.classList.remove('has-error');
      });
    });
  }

  /* ── Scroll reveal ── */
  if (!reduced) {
    if (gsap && ScrollTrigger) {
      gsap.utils.toArray('.reveal').forEach(function (el) {
        gsap.fromTo(el, { opacity: 0, y: 24 }, {
          opacity: 1, y: 0, duration: .7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      });
    } else {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: .1 });
      document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
    }
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ── Smooth scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

})();
