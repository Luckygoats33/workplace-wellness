(function () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (typeof THREE === 'undefined' || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  var reveals = document.querySelectorAll('.reveal');
  reveals.forEach(function (el) { el.classList.add('is-visible'); });

  /* ── Custom cursor glow ──────────────────────── */
  var cursorEl = document.createElement('div');
  cursorEl.className = 'cursor-glow';
  document.body.appendChild(cursorEl);
  var cursorActive = false;

  document.addEventListener('mousemove', function (e) {
    if (!cursorActive) { cursorEl.classList.add('is-active'); cursorActive = true; }
    cursorEl.style.left = e.clientX + 'px';
    cursorEl.style.top = e.clientY + 'px';
  });

  /* ── Three.js — Organic morphing sphere ──────── */
  var canvas = document.getElementById('hero-gl');
  if (canvas) {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    var ambientLight = new THREE.AmbientLight(0xC4A77D, 0.25);
    scene.add(ambientLight);

    var warmLight = new THREE.PointLight(0xC4A77D, 1.2, 25);
    warmLight.position.set(3, 3, 4);
    scene.add(warmLight);

    var sageLight = new THREE.PointLight(0x7B9E87, 0.8, 20);
    sageLight.position.set(-3, -2, 3);
    scene.add(sageLight);

    var etherealLight = new THREE.PointLight(0xA78BBA, 0.5, 18);
    etherealLight.position.set(0, 4, 2);
    scene.add(etherealLight);

    /* ── Morphing icosahedron ─────────────────────── */
    var sphereGeo = new THREE.IcosahedronGeometry(1.4, 4);
    var posAttr = sphereGeo.attributes.position;
    var origPositions = new Float32Array(posAttr.array.length);
    origPositions.set(posAttr.array);

    var sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0xC4A77D,
      metalness: 0.35,
      roughness: 0.35,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
      emissive: 0x2A1810,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.85
    });
    var sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    /* ── Wireframe overlay ────────────────────────── */
    var wireGeo = new THREE.IcosahedronGeometry(1.42, 3);
    var wireMat = new THREE.MeshBasicMaterial({ color: 0xC4A77D, wireframe: true, transparent: true, opacity: 0.06 });
    var wireframe = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireframe);

    /* ── Golden particle field ────────────────────── */
    var particleCount = 400;
    var positions = new Float32Array(particleCount * 3);
    for (var i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    var particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var particleMat = new THREE.PointsMaterial({
      color: 0xC4A77D,
      size: 0.025,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    var particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    /* ── Orbital rings — sacred geometry feel ─────── */
    var ring1Geo = new THREE.TorusGeometry(2.4, 0.006, 16, 120);
    var ring1Mat = new THREE.MeshBasicMaterial({ color: 0xA78BBA, transparent: true, opacity: 0.12 });
    var ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI * 0.4;
    ring1.rotation.z = Math.PI * 0.08;
    scene.add(ring1);

    var ring2Geo = new THREE.TorusGeometry(3.0, 0.004, 16, 120);
    var ring2Mat = new THREE.MeshBasicMaterial({ color: 0x7B9E87, transparent: true, opacity: 0.08 });
    var ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI * 0.6;
    ring2.rotation.z = -Math.PI * 0.12;
    scene.add(ring2);

    var ring3Geo = new THREE.TorusGeometry(1.9, 0.005, 16, 100);
    var ring3Mat = new THREE.MeshBasicMaterial({ color: 0xC4A77D, transparent: true, opacity: 0.1 });
    var ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = Math.PI * 0.25;
    ring3.rotation.z = Math.PI * 0.3;
    scene.add(ring3);

    /* ── Mouse tracking ──────────────────────────── */
    var mouse = { x: 0, y: 0 };
    var target = { x: 0, y: 0 };
    document.addEventListener('mousemove', function (e) {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

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
    var rafId;

    function animate() {
      rafId = requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      target.x += (mouse.x - target.x) * 0.04;
      target.y += (mouse.y - target.y) * 0.04;

      /* Morph vertices — slow breathing organic shape */
      var arr = posAttr.array;
      for (var idx = 0; idx < posAttr.count; idx++) {
        var ox = origPositions[idx * 3];
        var oy = origPositions[idx * 3 + 1];
        var oz = origPositions[idx * 3 + 2];
        var noise = Math.sin(ox * 2.5 + t * 0.6) *
                    Math.sin(oy * 2.5 + t * 0.45) *
                    Math.sin(oz * 2.5 + t * 0.35) * 0.12;
        var breathe = Math.sin(t * 0.4) * 0.03;
        var scale = 1 + noise + breathe;
        arr[idx * 3] = ox * scale;
        arr[idx * 3 + 1] = oy * scale;
        arr[idx * 3 + 2] = oz * scale;
      }
      posAttr.needsUpdate = true;
      sphereGeo.computeVertexNormals();

      sphere.rotation.x = t * 0.08 + target.y * 0.2;
      sphere.rotation.y = t * 0.1 + target.x * 0.2;
      wireframe.rotation.x = sphere.rotation.x;
      wireframe.rotation.y = sphere.rotation.y;

      ring1.rotation.z = Math.PI * 0.08 + t * 0.05;
      ring2.rotation.z = -Math.PI * 0.12 - t * 0.04;
      ring3.rotation.z = Math.PI * 0.3 + t * 0.06;

      warmLight.position.x = Math.sin(t * 0.3) * 3.5;
      warmLight.position.y = Math.cos(t * 0.25) * 3;
      sageLight.position.x = Math.cos(t * 0.35) * 3;
      sageLight.position.y = Math.sin(t * 0.4) * -2.5;

      camera.position.x = target.x * 0.4;
      camera.position.y = -target.y * 0.25;
      camera.lookAt(0, 0, 0);

      var pArr = particles.geometry.attributes.position.array;
      for (var pi = 0; pi < particleCount; pi++) {
        pArr[pi * 3 + 1] += 0.0015;
        if (pArr[pi * 3 + 1] > 7) pArr[pi * 3 + 1] = -7;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = t * 0.015;

      renderer.render(scene, camera);
    }
    rafId = requestAnimationFrame(animate);

    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onLeave: function () { cancelAnimationFrame(rafId); },
      onEnterBack: function () { rafId = requestAnimationFrame(animate); }
    });

    gsap.to(sphere.scale, {
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
      x: 0.2, y: 0.2, z: 0.2, ease: 'none'
    });
    gsap.to([sphereMat, wireMat, ring1Mat, ring2Mat, ring3Mat], {
      scrollTrigger: { trigger: '.hero', start: '50% top', end: 'bottom top', scrub: 1 },
      opacity: 0, ease: 'none'
    });
    gsap.to(particleMat, {
      scrollTrigger: { trigger: '.hero', start: '50% top', end: 'bottom top', scrub: 1 },
      opacity: 0, ease: 'none'
    });
  }

  /* ── Hero staggered reveal ─────────────────── */
  var heroEls = document.querySelectorAll('.hero-in');
  if (heroEls.length) {
    gsap.set(heroEls, { opacity: 0, y: 50 });
    heroEls.forEach(function (el) { el.classList.add('is-revealed'); });
    gsap.to(heroEls, {
      opacity: 1, y: 0,
      duration: 1.2, ease: 'power3.out',
      stagger: 0.15, delay: 0.4,
      clearProps: 'transform'
    });
  }

  var heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    gsap.from(heroTitle, {
      opacity: 0, y: 70, scale: 0.97,
      duration: 1.4, ease: 'power3.out', delay: 0.15,
      clearProps: 'transform'
    });
  }

  /* ── Section headings — scale + rotate in ──── */
  var headings = document.querySelectorAll('.section-head h2, .choice__intro h2, .plan__intro h2, .later__title');
  headings.forEach(function (h) {
    gsap.from(h, {
      scrollTrigger: { trigger: h, start: 'top 85%', toggleActions: 'play none none none' },
      opacity: 0, y: 60, rotateX: 10, scale: 0.96,
      duration: 1.1, ease: 'power3.out'
    });
  });

  var ledes = document.querySelectorAll('.section-lede');
  ledes.forEach(function (l) {
    gsap.from(l, {
      scrollTrigger: { trigger: l, start: 'top 88%', toggleActions: 'play none none none' },
      opacity: 0, y: 35,
      duration: 1, ease: 'power2.out', delay: 0.2
    });
  });

  /* ── Experience cards — horizontal scroll hint ── */
  var actsContainer = document.querySelector('.acts');
  if (actsContainer) {
    var acts = actsContainer.querySelectorAll('.act');
    gsap.from(acts, {
      scrollTrigger: { trigger: actsContainer, start: 'top 80%', toggleActions: 'play none none none' },
      opacity: 0, x: 60, rotateY: 8,
      duration: 0.8, ease: 'power2.out', stagger: 0.1
    });
  }

  /* ── Format cards with stagger ─────────────── */
  var formats = document.querySelectorAll('.format, .suits');
  if (formats.length) {
    gsap.from(formats, {
      scrollTrigger: { trigger: '.formats', start: 'top 80%', toggleActions: 'play none none none' },
      opacity: 0, y: 50, scale: 0.95,
      duration: 0.9, ease: 'power2.out', stagger: 0.12
    });
  }

  /* ── Step cards — journey reveal ───────────── */
  var steps = document.querySelectorAll('.step');
  if (steps.length) {
    gsap.from(steps, {
      scrollTrigger: { trigger: '.steps', start: 'top 80%', toggleActions: 'play none none none' },
      opacity: 0, y: 50, x: -20,
      duration: 0.8, ease: 'power2.out', stagger: 0.1
    });
  }

  /* ── Facilitator photos — fade in with scale ── */
  var personPhotos = document.querySelectorAll('.person__img');
  personPhotos.forEach(function (photo) {
    gsap.from(photo, {
      scrollTrigger: { trigger: photo, start: 'top 82%', toggleActions: 'play none none none' },
      opacity: 0, scale: 0.9, y: 30,
      duration: 1.2, ease: 'power3.out',
      clearProps: 'transform'
    });
  });

  /* ── Participation cards ───────────────────── */
  var pcards = document.querySelectorAll('.pcard');
  if (pcards.length) {
    gsap.from(pcards, {
      scrollTrigger: { trigger: '.pcards', start: 'top 82%', toggleActions: 'play none none none' },
      opacity: 0, x: -40, rotateY: 6,
      duration: 0.8, ease: 'power2.out', stagger: 0.08
    });
  }

  /* ── Addon cards ───────────────────────────── */
  var addons = document.querySelectorAll('.addon');
  if (addons.length) {
    gsap.from(addons, {
      scrollTrigger: { trigger: '.enh__grid', start: 'top 80%', toggleActions: 'play none none none' },
      opacity: 0, y: 40, rotateX: 5, scale: 0.97,
      duration: 0.8, ease: 'power2.out', stagger: 0.1
    });
  }

  /* ── 3D card tilt on hover ─────────────────── */
  var tiltCards = document.querySelectorAll('.format, .addon, .step, .pcard, .act');
  tiltCards.forEach(function (card) {
    card.classList.add('gsap-3d-card');
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateY: x * 6,
        rotateX: -y * 6,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: 1200
      });
    });
    card.addEventListener('mouseleave', function () {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.5, ease: 'power2.out' });
    });
  });

  /* ── Footer big text ───────────────────────── */
  var footerBig = document.querySelector('.footer__big');
  if (footerBig) {
    gsap.from(footerBig, {
      scrollTrigger: { trigger: footerBig, start: 'top 92%', toggleActions: 'play none none none' },
      opacity: 0, y: 60, scale: 0.92,
      duration: 1.4, ease: 'power3.out'
    });
  }

  /* ── Choice stage parallax ─────────────────── */
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
        { textShadow: '0 0 30px rgba(196,167,125,0.8)' },
        { textShadow: '0 0 0px rgba(196,167,125,0)', duration: 0.8, ease: 'power2.out' }
      );
    });
    observer.observe(expCur, { characterData: true, childList: true, subtree: true });
  }

  /* ── Later section — gentle float in ─────── */
  var laterInner = document.querySelector('.later__inner');
  if (laterInner) {
    gsap.from(laterInner, {
      scrollTrigger: { trigger: laterInner, start: 'top 85%', toggleActions: 'play none none none' },
      opacity: 0, y: 40, scale: 0.97,
      duration: 1, ease: 'power3.out'
    });
  }

  /* ── Form card entrance ────────────────────── */
  var formCard = document.querySelector('.form-card');
  if (formCard) {
    gsap.from(formCard, {
      scrollTrigger: { trigger: formCard, start: 'top 85%', toggleActions: 'play none none none' },
      opacity: 0, y: 40, scale: 0.98,
      duration: 1, ease: 'power3.out'
    });
  }

  /* ── Sacred geometry SVG injections ─────────── */
  function injectSacredGeo() {
    var sections = document.querySelectorAll('.section');
    sections.forEach(function (sec, idx) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '200');
      svg.setAttribute('height', '200');
      svg.setAttribute('viewBox', '0 0 200 200');
      svg.style.cssText = 'position:absolute;pointer-events:none;opacity:0.025;z-index:0;';

      if (idx % 2 === 0) {
        svg.style.right = '-40px';
        svg.style.top = '10%';
      } else {
        svg.style.left = '-40px';
        svg.style.bottom = '10%';
      }

      var circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle1.setAttribute('cx', '100'); circle1.setAttribute('cy', '100');
      circle1.setAttribute('r', '90'); circle1.setAttribute('fill', 'none');
      circle1.setAttribute('stroke', '#C4A77D'); circle1.setAttribute('stroke-width', '0.5');
      svg.appendChild(circle1);

      var circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle2.setAttribute('cx', '100'); circle2.setAttribute('cy', '100');
      circle2.setAttribute('r', '60'); circle2.setAttribute('fill', 'none');
      circle2.setAttribute('stroke', '#A78BBA'); circle2.setAttribute('stroke-width', '0.5');
      svg.appendChild(circle2);

      var circle3 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle3.setAttribute('cx', '100'); circle3.setAttribute('cy', '100');
      circle3.setAttribute('r', '30'); circle3.setAttribute('fill', 'none');
      circle3.setAttribute('stroke', '#7B9E87'); circle3.setAttribute('stroke-width', '0.5');
      svg.appendChild(circle3);

      for (var a = 0; a < 6; a++) {
        var angle = (a * 60) * Math.PI / 180;
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '100'); line.setAttribute('y1', '100');
        line.setAttribute('x2', String(100 + Math.cos(angle) * 90));
        line.setAttribute('y2', String(100 + Math.sin(angle) * 90));
        line.setAttribute('stroke', '#C4A77D'); line.setAttribute('stroke-width', '0.3');
        line.setAttribute('opacity', '0.5');
        svg.appendChild(line);
      }

      sec.appendChild(svg);
    });
  }
  injectSacredGeo();
})();
