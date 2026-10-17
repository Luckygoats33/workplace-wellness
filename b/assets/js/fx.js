/* Direction B: Pace Dial. Press-and-hold breath orb, a page-wide pace dial (Join in / Adapt / Observe / Step out), a scroll-drawn flowing spine and a guided slow-breath sample. No dependencies, no network. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = function () { return reduceMQ.matches; };

  /* ---- pace dial ---- */
  var radios = Array.prototype.slice.call(document.querySelectorAll("[data-pace-radio]"));
  function applyPace(k) { root.setAttribute("data-pace", k); }
  radios.forEach(function (r) { r.addEventListener("change", function () { if (r.checked) applyPace(r.value); }); });
  if (reduced()) { radios.forEach(function (r) { r.checked = r.value === "out"; }); applyPace("out"); }

  /* ---- hold-to-breathe orb ---- */
  var orb = document.querySelector("[data-orb]");
  var status = document.querySelector("[data-orb-status]");
  var label = document.querySelector("[data-orb-label]");
  if (orb) {
    var held = false, count = 0;
    var hold = function () {
      if (held) return; held = true; orb.classList.add("is-held");
      status.textContent = "Breathing in…"; label.textContent = "In…";
    };
    var release = function () {
      if (!held) return; held = false; orb.classList.remove("is-held"); count++;
      status.textContent = count > 2 ? "Lovely. That’s the idea: simple, and always optional." : "And slowly out…";
      label.textContent = "Out…";
    };
    orb.addEventListener("pointerdown", function (e) { try { orb.setPointerCapture(e.pointerId); } catch (x) {} hold(); });
    orb.addEventListener("pointerup", release);
    orb.addEventListener("pointercancel", release);
    orb.addEventListener("lostpointercapture", release);
    orb.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    orb.addEventListener("keydown", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); hold(); } });
    orb.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); release(); } });
    orb.addEventListener("blur", release);
  }

  /* ---- spine: drawn by scroll (desktop only; the element is display:none below 1180px) ---- */
  var spine = document.querySelector("[data-spine]");
  if (spine && !reduced()) {
    var bead = spine.querySelector("[data-spine-bead]");
    var ticking = false;
    var upd = function () {
      ticking = false;
      if (getComputedStyle(spine).display === "none") return;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (root.getAttribute("data-pace") === "out") p = p; /* still follows scroll: that is user-driven, not autonomous motion */
      spine.style.setProperty("--sp", (1 - p).toFixed(4));
      spine.style.setProperty("--by", (p * 100).toFixed(2) + "%");
      spine.style.setProperty("--bx", ((30 + 20 * Math.sin(p * 2 * Math.PI * 7)) / 60 * 100).toFixed(2) + "%");
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener("resize", upd); upd();
  }

  /* ---- slow-breath sample (3 cycles, 4s in / 6s out) ---- */
  var pacer = document.querySelector("[data-pacer]");
  if (pacer) {
    var btn = pacer.querySelector("[data-pacer-btn]");
    var porb = pacer.querySelector("[data-pacer-orb]");
    var pst = pacer.querySelector("[data-pacer-status]");
    var timers = [], running = false;
    var stop = function (msg) { timers.forEach(clearTimeout); timers = []; running = false; porb.classList.remove("is-in"); btn.textContent = "Start a slow breath"; btn.setAttribute("aria-pressed", "false"); pst.textContent = msg || "Ready when you are."; };
    var cycle = function (n) {
      porb.style.transitionDuration = reduced() ? "0s" : "4s"; porb.classList.add("is-in"); pst.textContent = "Breathe in… (about 4 seconds)";
      timers.push(setTimeout(function () { porb.style.transitionDuration = reduced() ? "0s" : "6s"; porb.classList.remove("is-in"); pst.textContent = "And slowly out… (about 6 seconds)"; }, 4000));
      timers.push(setTimeout(function () { if (n > 1) cycle(n - 1); else stop("Nicely done. That’s the idea: simple, and always optional."); }, 10000));
    };
    btn.addEventListener("click", function () {
      if (running) { stop("Stopped. Pick it up any time."); return; }
      running = true; btn.textContent = "Stop"; btn.setAttribute("aria-pressed", "true"); cycle(3);
    });
  }
})();
