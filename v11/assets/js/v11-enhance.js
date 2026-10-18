(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* ── Lenis smooth scroll ────────────────────── */
  var lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.2, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, touchMultiplier: 1.5 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ── Star field canvas ──────────────────────── */
  var canvas = document.getElementById('stars');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var stars = [];
    var STAR_COUNT = 180;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function sizeCanvas() {
      var rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initStars() {
      stars = [];
      var w = canvas.width / dpr;
      var h = canvas.height / dpr;
      for (var i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.3,
          a: Math.random() * 0.6 + 0.15,
          speed: Math.random() * 0.0008 + 0.0003,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    function drawStars(t) {
      var w = canvas.width / dpr;
      var h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var flicker = Math.sin(t * s.speed * 1000 + s.phase) * 0.3 + 0.7;
        var alpha = s.a * flicker;
        var isCelestial = i % 7 === 0;
        if (isCelestial) {
          ctx.fillStyle = 'rgba(107,173,196,' + (alpha * 0.9).toFixed(3) + ')';
          ctx.shadowColor = 'rgba(107,173,196,0.3)';
          ctx.shadowBlur = 6;
        } else if (i % 11 === 0) {
          ctx.fillStyle = 'rgba(201,168,192,' + (alpha * 0.8).toFixed(3) + ')';
          ctx.shadowColor = 'rgba(201,168,192,0.2)';
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = 'rgba(240,236,246,' + alpha.toFixed(3) + ')';
          ctx.shadowColor = '';
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * (isCelestial ? 1.3 : 1), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    sizeCanvas();
    initStars();

    var starRaf;
    function animateStars(t) {
      drawStars(t);
      starRaf = requestAnimationFrame(animateStars);
    }
    starRaf = requestAnimationFrame(animateStars);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { sizeCanvas(); initStars(); }, 200);
    });

    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onLeave: function () { cancelAnimationFrame(starRaf); },
      onEnterBack: function () { starRaf = requestAnimationFrame(animateStars); }
    });
  }

  /* ── Hero staggered reveal ──────────────────── */
  var heroEls = document.querySelectorAll('.hero-in');
  if (heroEls.length) {
    gsap.set(heroEls, { opacity: 0, y: 40 });
    heroEls.forEach(function (el) { el.classList.add('is-revealed'); });
    gsap.to(heroEls, {
      opacity: 1, y: 0,
      duration: 1, ease: 'power3.out',
      stagger: 0.12, delay: 0.2,
      clearProps: 'transform'
    });
  }

  var heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    gsap.from(heroTitle, {
      opacity: 0, y: 60, scale: 0.97,
      duration: 1.2, ease: 'power3.out', delay: 0.05
    });
  }

  /* ── Section heading reveals ────────────────── */
  var headings = document.querySelectorAll('.section-head h2, .choice__intro h2, .plan__intro h2, .footer__big');
  headings.forEach(function (h) {
    gsap.from(h, {
      scrollTrigger: {
        trigger: h,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      opacity: 0, y: 50,
      duration: 1, ease: 'power3.out'
    });
  });

  /* ── Section lede reveals ───────────────────── */
  var ledes = document.querySelectorAll('.section-lede');
  ledes.forEach(function (l) {
    gsap.from(l, {
      scrollTrigger: {
        trigger: l,
        start: 'top 88%',
        toggleActions: 'play none none none'
      },
      opacity: 0, y: 30,
      duration: 0.9, ease: 'power2.out', delay: 0.15
    });
  });

  /* ── Format cards stagger ───────────────────── */
  var formats = document.querySelectorAll('.format, .suits');
  if (formats.length) {
    gsap.from(formats, {
      scrollTrigger: {
        trigger: '.formats',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0, y: 40, scale: 0.97,
      duration: 0.8, ease: 'power2.out',
      stagger: 0.12
    });
  }

  /* ── Step cards stagger ─────────────────────── */
  var steps = document.querySelectorAll('.step');
  if (steps.length) {
    gsap.from(steps, {
      scrollTrigger: {
        trigger: '.steps',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0, y: 50, scale: 0.95,
      duration: 0.7, ease: 'power2.out',
      stagger: 0.1
    });
  }

  /* ── Facilitator photo reveals ──────────────── */
  var personPhotos = document.querySelectorAll('.person__img');
  personPhotos.forEach(function (photo) {
    gsap.from(photo, {
      scrollTrigger: {
        trigger: photo,
        start: 'top 82%',
        toggleActions: 'play none none none'
      },
      clipPath: 'inset(100% 0 0 0)',
      duration: 1.2, ease: 'power3.inOut'
    });
  });

  /* ── Participation cards ────────────────────── */
  var pcards = document.querySelectorAll('.pcard');
  if (pcards.length) {
    gsap.from(pcards, {
      scrollTrigger: {
        trigger: '.pcards',
        start: 'top 82%',
        toggleActions: 'play none none none'
      },
      opacity: 0, x: -30,
      duration: 0.7, ease: 'power2.out',
      stagger: 0.08
    });
  }

  /* ── Hero mesh parallax ─────────────────────── */
  var mesh = document.querySelector('.hero__mesh');
  if (mesh) {
    gsap.to(mesh, {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      },
      y: -100, opacity: 0.3, ease: 'none'
    });
  }

  /* ── Footer big text reveal ─────────────────── */
  var footerBig = document.querySelector('.footer__big');
  if (footerBig) {
    gsap.from(footerBig, {
      scrollTrigger: {
        trigger: footerBig,
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      opacity: 0, y: 60, scale: 0.95,
      duration: 1.2, ease: 'power3.out'
    });
  }

  /* ── Breathing ring section parallax ────────── */
  var choiceStage = document.querySelector('.choice__stage');
  if (choiceStage && window.innerWidth >= 1024) {
    gsap.fromTo(choiceStage,
      { y: 40 },
      {
        scrollTrigger: {
          trigger: '.s-choice',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        y: -40, ease: 'none'
      }
    );
  }

  /* ── Section background gradient transitions ── */
  var sections = document.querySelectorAll('.section');
  sections.forEach(function (sec) {
    gsap.fromTo(sec,
      { '--grad-progress': 0 },
      {
        '--grad-progress': 1,
        scrollTrigger: {
          trigger: sec,
          start: 'top bottom',
          end: 'top 30%',
          scrub: 1
        },
        ease: 'none'
      }
    );
  });

  /* ── Experience counter glow ────────────────── */
  var expCur = document.querySelector('.exp__cur');
  if (expCur) {
    var observer = new MutationObserver(function () {
      gsap.fromTo(expCur,
        { textShadow: '0 0 30px rgba(107,173,196,0.8)' },
        { textShadow: '0 0 0px rgba(107,173,196,0)', duration: 0.8, ease: 'power2.out' }
      );
    });
    observer.observe(expCur, { characterData: true, childList: true, subtree: true });
  }
})();
