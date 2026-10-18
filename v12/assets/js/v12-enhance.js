(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── Wait for Three.js + GSAP ──────────────── */
  if (typeof THREE === 'undefined' || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* ── Mark all .reveal elements visible so GSAP controls their animation ── */
  var reveals = document.querySelectorAll('.reveal');
  reveals.forEach(function (el) { el.classList.add('is-visible'); });

  /* ── Three.js hero scene ───────────────────── */
  var canvas = document.getElementById('hero-gl');
  if (canvas) {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5);

    var ambientLight = new THREE.AmbientLight(0x4FC3F7, 0.3);
    scene.add(ambientLight);

    var pointLight1 = new THREE.PointLight(0x4FC3F7, 1.5, 20);
    pointLight1.position.set(3, 3, 4);
    scene.add(pointLight1);

    var pointLight2 = new THREE.PointLight(0x9C7AE0, 1, 20);
    pointLight2.position.set(-3, -2, 3);
    scene.add(pointLight2);

    var pointLight3 = new THREE.PointLight(0xF0EBE3, 0.5, 15);
    pointLight3.position.set(0, 4, 2);
    scene.add(pointLight3);

    /* ── Torus knot with iridescent-style material ── */
    var torusGeo = new THREE.TorusKnotGeometry(1, 0.35, 128, 32, 2, 3);
    var torusMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a3e,
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.5,
      emissive: 0x0a1628,
      emissiveIntensity: 0.3
    });
    var torus = new THREE.Mesh(torusGeo, torusMat);
    scene.add(torus);

    /* ── Wireframe overlay for depth ───────────── */
    var wireGeo = new THREE.TorusKnotGeometry(1.01, 0.36, 64, 16, 2, 3);
    var wireMat = new THREE.MeshBasicMaterial({ color: 0x4FC3F7, wireframe: true, transparent: true, opacity: 0.06 });
    var wireframe = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireframe);

    /* ── Particle field ──────────────────────────── */
    var particleCount = 300;
    var positions = new Float32Array(particleCount * 3);
    var sizes = new Float32Array(particleCount);
    for (var i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      sizes[i] = Math.random() * 2 + 0.5;
    }
    var particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    var particleMat = new THREE.PointsMaterial({
      color: 0x4FC3F7,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    var particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    /* ── Orbital ring ────────────────────────────── */
    var ringGeo = new THREE.TorusGeometry(2.2, 0.008, 16, 100);
    var ringMat = new THREE.MeshBasicMaterial({ color: 0x9C7AE0, transparent: true, opacity: 0.2 });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.35;
    ring.rotation.z = Math.PI * 0.1;
    scene.add(ring);

    var ring2Geo = new THREE.TorusGeometry(2.8, 0.005, 16, 100);
    var ring2Mat = new THREE.MeshBasicMaterial({ color: 0x4FC3F7, transparent: true, opacity: 0.1 });
    var ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI * 0.55;
    ring2.rotation.z = -Math.PI * 0.15;
    scene.add(ring2);

    /* ── Mouse tracking ──────────────────────────── */
    var mouse = { x: 0, y: 0 };
    var target = { x: 0, y: 0 };
    document.addEventListener('mousemove', function (e) {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    /* ── Sizing ──────────────────────────────────── */
    function sizeRenderer() {
      var hero = canvas.parentElement;
      var w = hero.clientWidth;
      var h = hero.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    sizeRenderer();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(sizeRenderer, 200);
    });

    /* ── Animation loop ──────────────────────────── */
    var clock = new THREE.Clock();
    var heroVisible = true;
    var rafId;

    function animate() {
      rafId = requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      target.x += (mouse.x - target.x) * 0.05;
      target.y += (mouse.y - target.y) * 0.05;

      torus.rotation.x = t * 0.15 + target.y * 0.3;
      torus.rotation.y = t * 0.2 + target.x * 0.3;
      wireframe.rotation.x = torus.rotation.x;
      wireframe.rotation.y = torus.rotation.y;

      ring.rotation.z = Math.PI * 0.1 + t * 0.08;
      ring2.rotation.z = -Math.PI * 0.15 - t * 0.06;

      pointLight1.position.x = Math.sin(t * 0.5) * 3;
      pointLight1.position.y = Math.cos(t * 0.3) * 3;
      pointLight2.position.x = Math.cos(t * 0.4) * 3;
      pointLight2.position.y = Math.sin(t * 0.6) * -2;

      camera.position.x = target.x * 0.5;
      camera.position.y = -target.y * 0.3;
      camera.lookAt(0, 0, 0);

      var posArr = particles.geometry.attributes.position.array;
      for (var i = 0; i < particleCount; i++) {
        posArr[i * 3 + 1] += 0.002;
        if (posArr[i * 3 + 1] > 6) posArr[i * 3 + 1] = -6;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = t * 0.02;

      renderer.render(scene, camera);
    }
    rafId = requestAnimationFrame(animate);

    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onLeave: function () { heroVisible = false; cancelAnimationFrame(rafId); },
      onEnterBack: function () { heroVisible = true; rafId = requestAnimationFrame(animate); }
    });

    /* ── Scroll-driven torus scale + fade ─────── */
    gsap.to(torus.scale, {
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
      x: 0.3, y: 0.3, z: 0.3, ease: 'none'
    });
    gsap.to([torusMat, wireMat, ringMat, ring2Mat], {
      scrollTrigger: { trigger: '.hero', start: '60% top', end: 'bottom top', scrub: 1 },
      opacity: 0, ease: 'none'
    });
    gsap.to(particleMat, {
      scrollTrigger: { trigger: '.hero', start: '60% top', end: 'bottom top', scrub: 1 },
      opacity: 0, ease: 'none'
    });
  }

  /* ── Hero staggered reveal ─────────────────── */
  var heroEls = document.querySelectorAll('.hero-in');
  if (heroEls.length) {
    gsap.set(heroEls, { opacity: 0, y: 40 });
    heroEls.forEach(function (el) { el.classList.add('is-revealed'); });
    gsap.to(heroEls, {
      opacity: 1, y: 0,
      duration: 1, ease: 'power3.out',
      stagger: 0.12, delay: 0.3,
      clearProps: 'transform'
    });
  }

  var heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    gsap.from(heroTitle, {
      opacity: 0, y: 60, rotateX: 15,
      duration: 1.2, ease: 'power3.out', delay: 0.1,
      clearProps: 'transform'
    });
  }

  /* ── Section heading reveals with 3D rotate ── */
  var headings = document.querySelectorAll('.section-head h2, .choice__intro h2, .plan__intro h2');
  headings.forEach(function (h) {
    gsap.from(h, {
      scrollTrigger: { trigger: h, start: 'top 85%', toggleActions: 'play none none none' },
      opacity: 0, y: 50, rotateX: 8,
      duration: 1, ease: 'power3.out'
    });
  });

  /* ── Section lede reveals ──────────────────── */
  var ledes = document.querySelectorAll('.section-lede');
  ledes.forEach(function (l) {
    gsap.from(l, {
      scrollTrigger: { trigger: l, start: 'top 88%', toggleActions: 'play none none none' },
      opacity: 0, y: 30,
      duration: 0.9, ease: 'power2.out', delay: 0.15
    });
  });

  /* ── Format cards with 3D stagger ──────────── */
  var formats = document.querySelectorAll('.format, .suits');
  if (formats.length) {
    gsap.from(formats, {
      scrollTrigger: { trigger: '.formats', start: 'top 80%', toggleActions: 'play none none none' },
      opacity: 0, y: 40, rotateY: 5, scale: 0.97,
      duration: 0.8, ease: 'power2.out', stagger: 0.12
    });
  }

  /* ── Step cards stagger ────────────────────── */
  var steps = document.querySelectorAll('.step');
  if (steps.length) {
    gsap.from(steps, {
      scrollTrigger: { trigger: '.steps', start: 'top 80%', toggleActions: 'play none none none' },
      opacity: 0, y: 50, rotateX: 6, scale: 0.95,
      duration: 0.7, ease: 'power2.out', stagger: 0.1
    });
  }

  /* ── Facilitator photo 3D reveals ──────────── */
  var personPhotos = document.querySelectorAll('.person__img');
  personPhotos.forEach(function (photo) {
    gsap.from(photo, {
      scrollTrigger: { trigger: photo, start: 'top 82%', toggleActions: 'play none none none' },
      opacity: 0, rotateY: -12, x: -40,
      duration: 1.2, ease: 'power3.out',
      clearProps: 'transform'
    });
  });

  /* ── Participation cards slide-in ──────────── */
  var pcards = document.querySelectorAll('.pcard');
  if (pcards.length) {
    gsap.from(pcards, {
      scrollTrigger: { trigger: '.pcards', start: 'top 82%', toggleActions: 'play none none none' },
      opacity: 0, x: -30, rotateY: 8,
      duration: 0.7, ease: 'power2.out', stagger: 0.08
    });
  }

  /* ── 3D card tilt on hover ─────────────────── */
  var tiltCards = document.querySelectorAll('.format, .addon, .step, .pcard');
  tiltCards.forEach(function (card) {
    card.classList.add('gsap-3d-card');
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateY: x * 8,
        rotateX: -y * 8,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: 1200
      });
    });
    card.addEventListener('mouseleave', function () {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.5, ease: 'power2.out' });
    });
  });

  /* ── Footer big text reveal ────────────────── */
  var footerBig = document.querySelector('.footer__big');
  if (footerBig) {
    gsap.from(footerBig, {
      scrollTrigger: { trigger: footerBig, start: 'top 90%', toggleActions: 'play none none none' },
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
        scrollTrigger: { trigger: '.s-choice', start: 'top bottom', end: 'bottom top', scrub: 1 },
        y: -40, ease: 'none'
      }
    );
  }

  /* ── Experience counter glow ───────────────── */
  var expCur = document.querySelector('.exp__cur');
  if (expCur) {
    var observer = new MutationObserver(function () {
      gsap.fromTo(expCur,
        { textShadow: '0 0 30px rgba(79,195,247,0.8)' },
        { textShadow: '0 0 0px rgba(79,195,247,0)', duration: 0.8, ease: 'power2.out' }
      );
    });
    observer.observe(expCur, { characterData: true, childList: true, subtree: true });
  }
})();
