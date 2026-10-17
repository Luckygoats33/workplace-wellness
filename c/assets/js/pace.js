/* Workplace Wellness by SWG: pace choice + breath ring (4 s in, 6 s out). No dependencies, no network.
   Pace sets html[data-pace]; CSS scales every moving thing (ring, reveals, hover lift). "out" = fully still. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var DESC = {
    join: "Join in: follow along with the group. The ring breathes in for 4 seconds and out for 6.",
    adapt: "Adapt: a smaller version. The ring moves less and the page moves gently.",
    observe: "Observe: just watch. The ring only glows softly and the page barely moves.",
    out: "Step out: everything on the page is still. Nothing is asked of you."
  };
  var CUE = {
    join: ["Breathe in", "Breathe out"],
    adapt: ["Breathe in, gently", "Breathe out, gently"],
    observe: ["Watch the ring. Breathe as you like.", "Watch the ring. Breathe as you like."],
    out: ["Paused. Take your time.", "Paused. Take your time."]
  };
  var STATIC_CUE = "Breathe in for 4, out for 6";
  var cues = document.querySelectorAll("[data-cue],[data-cue-mini]");
  var desc = document.querySelector("[data-pace-desc]");
  var radios = Array.prototype.slice.call(document.querySelectorAll("[data-pace-radio]"));
  var btns = Array.prototype.slice.call(document.querySelectorAll("[data-pace-set]"));
  var timer = null;

  function say(t) { cues.forEach(function (c) { c.textContent = t; }); }
  function stop() { clearTimeout(timer); timer = null; doc.setAttribute("data-phase", "rest"); }
  function cycle(i) {
    var p = doc.getAttribute("data-pace");
    if (mq.matches || p === "out") { stop(); say(mq.matches && p !== "out" ? STATIC_CUE : CUE[p][0]); return; }
    var inhale = i === 0;
    doc.setAttribute("data-phase", inhale ? "in" : "out");
    say(CUE[p][inhale ? 0 : 1]);
    timer = setTimeout(function () { cycle(inhale ? 1 : 0); }, inhale ? 4000 : 6000);
  }
  function restart() { clearTimeout(timer); stop(); requestAnimationFrame(function () { requestAnimationFrame(function () { cycle(0); }); }); }

  function setPace(v) {
    doc.setAttribute("data-pace", v);
    radios.forEach(function (r) { r.checked = r.value === v; });
    btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-pace-set") === v)); });
    if (desc) desc.textContent = DESC[v];
    document.querySelectorAll("[data-pcard]").forEach(function (c) { c.classList.toggle("is-current", c.getAttribute("data-pcard") === v); });
    restart();
  }
  radios.forEach(function (r) { r.addEventListener("change", function () { if (r.checked) setPace(r.value); }); });
  btns.forEach(function (b) { b.addEventListener("click", function () { setPace(b.getAttribute("data-pace-set")); }); });
  if (mq.addEventListener) mq.addEventListener("change", restart);
  setPace("join");
})();
