/* v4.js — Workplace Wellness Immersive Experience */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Wait for GSAP ── */
  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(function () {

    /* =========================================================
       1. GSAP + ScrollTrigger setup
       ========================================================= */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
      gsap.registerPlugin(ScrollTrigger);
      initGSAP();
    } else if (!prefersReducedMotion && typeof gsap === 'undefined') {
      window.addEventListener('load', function () {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
          gsap.registerPlugin(ScrollTrigger);
          initGSAP();
        } else {
          showAllRevealElements();
        }
      });
    } else {
      showAllRevealElements();
    }

    function showAllRevealElements() {
      var els = document.querySelectorAll('.reveal');
      for (var i = 0; i < els.length; i++) els[i].classList.add('is-visible');
      var hero = document.querySelector('.hero__w');
      if (hero) hero.style.opacity = '1';
      var words = document.querySelectorAll('.hero__word');
      for (var j = 0; j < words.length; j++) words[j].style.opacity = '1';
    }

    function initGSAP() {
      /* Hero W draw-in */
      var heroW = document.querySelector('.hero__w');
      if (heroW) {
        var paths = heroW.querySelectorAll('path');
        paths.forEach(function (p) {
          var len = p.getTotalLength ? p.getTotalLength() : 400;
          p.style.strokeDasharray = len;
          p.style.strokeDashoffset = len;
        });
        gsap.to(heroW, { opacity: 1, duration: 0.5, delay: 0.3 });
        gsap.to(paths, {
          strokeDashoffset: 0,
          duration: 2,
          delay: 0.5,
          stagger: 0.3,
          ease: 'power2.out'
        });
      }

      /* Kinetic words */
      gsap.from('.hero__word', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.15,
        delay: 1.2,
        ease: 'power3.out',
        onComplete: function () {
          document.querySelectorAll('.hero__word').forEach(function (w) {
            w.style.opacity = '1';
            w.style.transform = 'none';
          });
        }
      });

      /* Hero title + subtitle */
      gsap.from('.hero-title', { opacity: 0, y: 30, duration: 0.8, delay: 2, ease: 'power2.out' });
      gsap.from('.hero__subtitle', { opacity: 0, y: 20, duration: 0.8, delay: 2.3, ease: 'power2.out' });
      gsap.from('.btn--primary', { opacity: 0, y: 15, duration: 0.6, delay: 2.6, ease: 'power2.out' });

      /* Scroll reveal for sections */
      var reveals = document.querySelectorAll('.reveal');
      reveals.forEach(function (el) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: function () {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power2.out',
              onComplete: function () { el.classList.add('is-visible'); }
            });
          }
        });
      });
    }

    /* =========================================================
       2. Chapter walkthrough tabs
       ========================================================= */
    var chapterTabs = document.querySelectorAll('.chapters__tab');
    var chapterNames = ['welcome', 'movement', 'breathing', 'education', 'connection', 'closing'];

    chapterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-chapter');
        chapterTabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');

        chapterNames.forEach(function (name) {
          var panel = document.getElementById('ch-' + name);
          if (!panel) return;
          if (name === target) {
            panel.classList.add('is-visible');
            if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
              gsap.from(panel.children, { opacity: 0, y: 15, duration: 0.4, stagger: 0.1, ease: 'power2.out' });
            }
          } else {
            panel.classList.remove('is-visible');
          }
        });
      });
    });

    /* =========================================================
       3. Program toggle
       ========================================================= */
    var progBtns = document.querySelectorAll('.program-toggle__btn');
    progBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-program');
        progBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        document.getElementById('prog-half').classList.toggle('is-visible', target === 'half');
        document.getElementById('prog-full').classList.toggle('is-visible', target === 'full');
      });
    });

    /* =========================================================
       4. Event configurator
       ========================================================= */
    var configForm = document.querySelector('.config-form');
    if (configForm) {
      var formatLabels = { half: 'half-day', full: 'full-day' };
      var typeLabels = { employee: 'Employee gathering', leadership: 'Leadership retreat', conference: 'Company conference' };
      var sizeLabels = { small: 'Under 50', medium: '50–150', large: '150+' };

      var halfAgenda = [
        'Welcome and participation options',
        'Guided movement and education with Sean',
        'Pause and transition',
        'Guided breathing with Brandon',
        'Group closing and practical reflections'
      ];
      var fullAgenda = [
        'Welcome and participation options',
        'Movement Session I with Sean',
        'Break',
        'Breathing workshop with Brandon',
        'Lunch and informal connection',
        'Movement Session II with Sean',
        'Education, discussion and group reflection',
        'Closing ceremony and takeaways'
      ];

      function updatePreview() {
        var fmt = configForm.querySelector('input[name="format"]:checked');
        var evt = configForm.querySelector('input[name="event-type"]:checked');
        var att = configForm.querySelector('input[name="attendees"]:checked');
        var posture = document.getElementById('enh-posture');
        var resources = document.getElementById('enh-resources');

        var fmtVal = fmt ? fmt.value : 'half';
        var evtVal = evt ? evt.value : 'employee';
        var attVal = att ? att.value : 'small';

        document.getElementById('preview-title').textContent = 'Core ' + formatLabels[fmtVal] + ' experience';
        document.getElementById('preview-meta').textContent = typeLabels[evtVal] + ' · ' + sizeLabels[attVal] + ' attendees';

        var items = fmtVal === 'full' ? fullAgenda.slice() : halfAgenda.slice();
        if (posture && posture.checked) items.push('Optional posture support session with Mike');
        if (resources && resources.checked) items.push('Discuss optional post-event resource sharing');

        var list = document.getElementById('preview-list');
        list.innerHTML = '';
        items.forEach(function (item) {
          var li = document.createElement('li');
          li.textContent = item;
          list.appendChild(li);
        });
      }

      configForm.addEventListener('change', updatePreview);
      updatePreview();
    }

    /* Copy outline */
    var copyBtn = document.getElementById('copy-outline');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var title = document.getElementById('preview-title').textContent;
        var meta = document.getElementById('preview-meta').textContent;
        var items = document.querySelectorAll('#preview-list li');
        var text = title + '\n' + meta + '\n\n';
        items.forEach(function (li) { text += '• ' + li.textContent + '\n'; });
        text += '\nThis is an illustrative outline. No capacity, facilitator availability, specific duration, price, or enhancement is guaranteed.';

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            copyBtn.textContent = 'Copied!';
            setTimeout(function () { copyBtn.textContent = 'Copy event outline'; }, 2000);
          });
        } else {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); copyBtn.textContent = 'Copied!'; } catch (e) { /* silent */ }
          document.body.removeChild(ta);
          setTimeout(function () { copyBtn.textContent = 'Copy event outline'; }, 2000);
        }
      });
    }

    /* =========================================================
       5. Breathing ring
       ========================================================= */
    var breathBtn = document.getElementById('breath-btn');
    var breathCircle = document.getElementById('breath-circle');
    var breathLabel = document.getElementById('breath-label');
    var breathRunning = false;
    var breathAnim = null;

    if (breathBtn && breathCircle && breathLabel) {
      breathBtn.addEventListener('click', function () {
        if (breathRunning) {
          stopBreathing();
        } else {
          startBreathing();
        }
      });
    }

    function startBreathing() {
      breathRunning = true;
      breathBtn.textContent = 'Stop';
      breathCycle();
    }

    function stopBreathing() {
      breathRunning = false;
      breathBtn.textContent = 'Start breathing';
      breathLabel.textContent = 'Press start';
      if (breathAnim) cancelAnimationFrame(breathAnim);
      breathCircle.setAttribute('r', '40');
    }

    function breathCycle() {
      if (!breathRunning) return;
      var dur = 4000;
      var start = performance.now();

      /* Inhale */
      breathLabel.textContent = 'Inhale...';
      function inhale(now) {
        if (!breathRunning) return;
        var elapsed = now - start;
        var t = Math.min(elapsed / dur, 1);
        var r = 40 + 18 * easeInOut(t);
        breathCircle.setAttribute('r', r);
        if (t < 1) { breathAnim = requestAnimationFrame(inhale); }
        else { exhalePhase(); }
      }
      breathAnim = requestAnimationFrame(inhale);

      function exhalePhase() {
        if (!breathRunning) return;
        breathLabel.textContent = 'Exhale...';
        var exStart = performance.now();
        function exhale(now) {
          if (!breathRunning) return;
          var elapsed = now - exStart;
          var t = Math.min(elapsed / dur, 1);
          var r = 58 - 18 * easeInOut(t);
          breathCircle.setAttribute('r', r);
          if (t < 1) { breathAnim = requestAnimationFrame(exhale); }
          else { breathCycle(); }
        }
        breathAnim = requestAnimationFrame(exhale);
      }
    }

    function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

    /* =========================================================
       6. FAQ accordion
       ========================================================= */
    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function (item) {
      var btn = item.querySelector('.faq-item__q');
      var answer = item.querySelector('.faq-item__a');
      if (!btn || !answer) return;

      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        /* Close all */
        faqItems.forEach(function (other) {
          other.classList.remove('is-open');
          var a = other.querySelector('.faq-item__a');
          var b = other.querySelector('.faq-item__q');
          if (a) a.style.maxHeight = '0';
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    /* =========================================================
       7. Inquiry form (client-side only)
       ========================================================= */
    var form = document.getElementById('inquiry-form');
    var success = document.getElementById('form-success');
    if (form && success) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = document.getElementById('f-name');
        var email = document.getElementById('f-email');
        var valid = true;
        if (name && !name.value.trim()) { name.focus(); valid = false; }
        if (email && !email.value.trim()) { email.focus(); valid = false; }
        if (!valid) return;
        form.style.display = 'none';
        success.classList.add('is-visible');
        success.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
      });
    }

    /* =========================================================
       8. Smooth scroll for anchor links
       ========================================================= */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      });
    });

  }); /* end onReady */
})();
