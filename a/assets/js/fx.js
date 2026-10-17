/* Direction A: Breath Field. A shared 4s-in / 6s-out breath drives the canvas field, the kinetic headline word, the control ring and the pacer. No dependencies, no network. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = function () { return reduceMQ.matches; };
  var IN = 4000, OUT = 6000, CYCLE = IN + OUT;
  var t0 = 0, paused = false, pointer = { x: -999, y: -999, on: false };

  function breath(now) { /* 0 (empty) .. 1 (full) */
    var t = (now - t0) % CYCLE; if (t < 0) t += CYCLE;
    var p = t < IN ? t / IN : 1 - (t - IN) / OUT;
    return 0.5 - 0.5 * Math.cos(p * Math.PI);
  }

  var kin = document.querySelector("[data-kin]");
  var ring = document.querySelector("[data-ring]");
  var toggle = document.querySelector("[data-field-toggle]");
  var toggleLabel = document.querySelector("[data-field-label]");
  var canvas = document.querySelector("[data-field]");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;

  /* ---- pace state: set by scrolling through / pressing the four choices ---- */
  var PACE = {
    join:    { speed: 1,    amp: 1,   style: "fill",  alpha: 0.7 },
    adapt:   { speed: 0.45, amp: 0.55, style: "fill",  alpha: 0.5 },
    observe: { speed: 0.12, amp: 0.25, style: "ring",  alpha: 0.5 },
    out:     { speed: 0,    amp: 0,   style: "dash",  alpha: 0.35 }
  };
  var pace = "join", lockUntil = 0, pending = null, pt = 0;
  var paceBtns = Array.prototype.slice.call(document.querySelectorAll("[data-pace-set]"));
  var paceStatus = document.querySelector("[data-pace-status]");
  var NAMES = { join: "Join in", adapt: "Adapt", observe: "Observe", out: "Step out" };
  function setPace(k, announce, force) {
    if (!PACE[k] || k === pace) return;
    if (!force && performance.now() < lockUntil) { pending = k; clearTimeout(pt); pt = setTimeout(function () { if (pending) setPace(pending, false); pending = null; }, lockUntil - performance.now() + 20); return; }
    pending = null;
    pace = k; root.setAttribute("data-pace", k);
    paceBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-pace-set") === k)); });
    if (announce && paceStatus) paceStatus.textContent = "Pace: " + NAMES[k] + ".";
    if (!animating()) drawStatic();
  }
  paceBtns.forEach(function (b) {
    b.addEventListener("click", function () { lockUntil = performance.now() + 1500; setPace(b.getAttribute("data-pace-set"), true, true); });
    b.addEventListener("focus", function () { setPace(b.getAttribute("data-pace-set"), false); });
  });
  var choice = document.querySelector("[data-choice]");
  if ("IntersectionObserver" in window && choice) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setPace(e.target.getAttribute("data-pace-set"), false); });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    paceBtns.forEach(function (b) { io.observe(b); });
    new IntersectionObserver(function (es) { if (!es[0].isIntersecting && pace !== "join") setPace("join", false); }, { threshold: 0 }).observe(choice);
  }

  /* ---- scroll-driven kinetic rows (mark the row nearest mid-screen) ---- */
  var rows = Array.prototype.slice.call(document.querySelectorAll(".act"));
  if ("IntersectionObserver" in window && rows.length) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle("is-mid", e.isIntersecting); });
    }, { rootMargin: "-42% 0px -42% 0px", threshold: 0 });
    rows.forEach(function (r) { rio.observe(r); });
  }

  /* ---- magnetic buttons (pointer devices only, motion allowed) ---- */
  if (!reduced() && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll("[data-magnet]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + "px");
        el.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.2).toFixed(1) + "px");
      });
      el.addEventListener("pointerleave", function () { el.style.setProperty("--mx", "0px"); el.style.setProperty("--my", "0px"); });
    });
  }

  /* ---- canvas field ---- */
  var W = 0, H = 0, dpr = 1, dots = [];
  var small = window.matchMedia("(max-width:760px)").matches;
  function seed() {
    dots = [];
    var n = small ? 70 : 150;
    for (var i = 0; i < n; i++) {
      dots.push({ x: Math.random(), y: Math.random(), ph: Math.random() * 6.283, sp: 0.4 + Math.random() * 0.9, r: 1.4 + Math.random() * 2.6, c: Math.random() < 0.72 ? 0 : 1 });
    }
  }
  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  var clock = 0, last = 0;
  function frame(now, b, dt) {
    var P = PACE[pace];
    clock += dt * P.speed;
    ctx.clearRect(0, 0, W, H);
    var cx = W / 2, cy = H * 0.42, scale = 1 + (b - 0.5) * 0.22 * P.amp;
    var lw = 1.5;
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      var bx = (d.x + Math.sin(clock * 0.00012 * d.sp + d.ph) * 0.05) * W;
      var by = (d.y + Math.cos(clock * 0.0001 * d.sp + d.ph * 1.3) * 0.05) * H;
      var x = cx + (bx - cx) * scale, y = cy + (by - cy) * scale;
      if (pointer.on) {
        var dx = x - pointer.x, dy = y - pointer.y, dd = dx * dx + dy * dy;
        if (dd < 22500 && P.speed > 0) { var f = (1 - Math.sqrt(dd) / 150) * 36; var m = Math.sqrt(dd) || 1; x += dx / m * f; y += dy / m * f; }
      }
      var r = d.r * (0.8 + b * 0.5 * P.amp + 0.2);
      ctx.globalAlpha = P.alpha * (0.35 + 0.5 * b * P.amp + 0.15);
      var col = d.c ? "#FF6B57" : "#D4FF3F";
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283);
      if (P.style === "fill") { ctx.fillStyle = col; ctx.fill(); }
      else { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(P.style === "dash" ? [2, 3] : []); ctx.stroke(); }
    }
    ctx.setLineDash([]); ctx.globalAlpha = 1;
  }
  function drawStatic() { if (ctx) { frame(0, 0.5, 0); } setVars(0.5); }

  function setVars(b) {
    if (kin) { kin.style.setProperty("--kw", (64 + 44 * b).toFixed(1)); kin.style.setProperty("--kwt", String(Math.round(650 + 250 * b))); }
    root.style.setProperty("--pb", (0.5 + 0.5 * b).toFixed(3));
  }

  /* ---- pacer (3 breaths, text prompts; the field and orb follow the same phase) ---- */
  var pacer = document.querySelector("[data-pacer]");
  var pStatus = pacer && pacer.querySelector("[data-pacer-status]");
  var pBtn = pacer && pacer.querySelector("[data-pacer-btn]");
  var pOrb = pacer && pacer.querySelector("[data-pacer-orb]");
  var pRun = false, pTimers = [];
  function pStop(msg) { pTimers.forEach(clearTimeout); pTimers = []; pRun = false; pBtn.textContent = "Start a slow breath"; pBtn.setAttribute("aria-pressed", "false"); pStatus.textContent = msg || "Ready when you are."; }
  function pCycle(n) {
    pStatus.textContent = "Breathe in… (about 4 seconds)";
    if (reduced() && pOrb) pOrb.style.setProperty("--pb", "1");
    pTimers.push(setTimeout(function () { pStatus.textContent = "And slowly out… (about 6 seconds)"; if (reduced() && pOrb) pOrb.style.setProperty("--pb", ".5"); }, IN));
    pTimers.push(setTimeout(function () { if (n > 1) pCycle(n - 1); else pStop("Nicely done. That’s the idea: simple, and always optional."); }, CYCLE));
  }
  if (pBtn) pBtn.addEventListener("click", function () {
    if (pRun) { pStop("Stopped. Pick it up any time."); return; }
    pRun = true; t0 = performance.now(); pBtn.textContent = "Stop"; pBtn.setAttribute("aria-pressed", "true"); pCycle(3);
  });

  /* ---- loop ---- */
  function animating() { return !paused && !reduced() && !document.hidden; }
  var raf = 0;
  function loop(now) {
    raf = 0; if (!animating()) return;
    var dt = Math.min(now - last, 50); last = now;
    var b = breath(now);
    setVars(b);
    if (pOrb) pOrb.style.setProperty("--pb", (0.5 + 0.5 * b).toFixed(3));
    if (ctx) frame(now, b, dt);
    raf = requestAnimationFrame(loop);
  }
  function start() { if (!raf && animating()) { last = performance.now(); raf = requestAnimationFrame(loop); } }

  if (ctx) {
    seed(); resize();
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { small = window.matchMedia("(max-width:760px)").matches; resize(); if (!animating()) drawStatic(); }, 150); });
    window.addEventListener("pointermove", function (e) { pointer.x = e.clientX; pointer.y = e.clientY; pointer.on = true; }, { passive: true });
    window.addEventListener("pointerleave", function () { pointer.on = false; });
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = 0; } else start(); });

  if (toggle) toggle.addEventListener("click", function () {
    paused = !paused;
    toggle.setAttribute("aria-pressed", String(paused));
    toggleLabel.textContent = paused ? "Play field" : "Pause field";
    if (paused) { if (raf) cancelAnimationFrame(raf); raf = 0; drawStatic(); } else start();
  });
  var onRM = function () { if (reduced()) { if (raf) cancelAnimationFrame(raf); raf = 0; drawStatic(); } else start(); };
  if (reduceMQ.addEventListener) reduceMQ.addEventListener("change", onRM);

  if (reduced()) drawStatic(); else { setVars(0.5); start(); }
})();
