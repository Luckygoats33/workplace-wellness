/* Workplace Wellness by SWG, direction D (flagship preview). One file, no dependencies, no network.
   Scroll work is a single rAF-throttled passive listener; reveals / scroll-spy / acts use IntersectionObserver.
   Pace (html[data-pace]) scales motion through --m; "out" and prefers-reduced-motion switch every moving thing off. */
(function () {
  "use strict";
  var D = document, doc = D.documentElement;
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || D).querySelectorAll(s)); };
  var reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");
  var MULT = { join: 1, adapt: 0.5, observe: 0.2, out: 0 };
  var pace = "join", mult = 1, calm = false;

  var after = function (fn) { requestAnimationFrame(function () { setTimeout(fn, 0); }); };
  var yr = $("[data-year]"); if (yr) yr.textContent = String(new Date().getFullYear());

  /* ---------- mobile nav ---------- */
  var toggle = $("[data-nav-toggle]"), nav = $("[data-nav]");
  if (toggle && nav) {
    var lab = $(".nav-toggle__label", toggle);
    var setOpen = function (o) { toggle.setAttribute("aria-expanded", String(o)); nav.classList.toggle("is-open", o); if (lab) lab.textContent = o ? "Close" : "Menu"; };
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    D.addEventListener("keydown", function (e) { if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); } });
  }

  /* ---------- scroll: header, progress, parallax, sample day ---------- */
  var hdr = $("[data-header]"), bar = $("[data-progress]"), stage = $("[data-stage]");
  var day = $("[data-day]"), stick = day && $(".day__stick", day), dlist = day && $("[data-day-list]", day);
  var dsteps = day ? $$("[data-step]", day) : [], dno = $("[data-day-no]"), dlab = $("[data-day-label]"), dstage = $("[data-day-stage]");
  var heroEnd = 0, pinned = false, lastStep = -1, ticking = false, compact = false;
  var measure = function () {
    var h = $(".hero"); heroEnd = h ? h.offsetTop + h.offsetHeight : 0;
    pinned = !!stick && getComputedStyle(stick).position === "sticky";
    lastStep = -1; update();
  };
  var setStep = function (i) {
    if (i === lastStep) return; lastStep = i;
    dsteps.forEach(function (s, j) { s.classList.toggle("is-active", j === i); s.classList.toggle("is-done", j < i); });
    if (dstage) {
      $$(".r", dstage).forEach(function (c) { var n = +c.getAttribute("class").match(/r(\d)/)[1]; c.classList.toggle("on", n <= i + 1); });
      if (dno) dno.textContent = String(i + 1);
      if (dlab) dlab.textContent = $("h4", dsteps[i]).textContent;
    }
  };
  function update() {
    ticking = false;
    var y = window.scrollY || 0, max = doc.scrollHeight - innerHeight;
    var c = y > 40; if (c !== compact) { compact = c; hdr.classList.toggle("is-compact", c); }
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ")";
    if (stage && mult > 0 && y < heroEnd) stage.style.setProperty("--py", (y * mult).toFixed(1) + "px");
    if (day) {
      var r = day.getBoundingClientRect();
      if (pinned) {
        var total = r.height - stick.offsetHeight, p = total > 0 ? Math.min(1, Math.max(0, -(r.top - 68) / total)) : 0;
        setStep(Math.min(dsteps.length - 1, Math.floor(p * dsteps.length)));
      } else if (dlist) {
        if (lastStep !== -2) { lastStep = -2; dsteps.forEach(function (s) { s.classList.remove("is-active", "is-done"); }); }
        var lr = dlist.getBoundingClientRect(), pr = calm ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.62 - lr.top) / lr.height));
        dlist.style.setProperty("--dp", pr.toFixed(3));
      }
    }
  }
  var tick = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener("scroll", tick, { passive: true });
  var rt; addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(measure, 120); });

  /* ---------- reveals, scroll-spy, experience acts ---------- */
  var reveals = $$(".reveal");
  var flat = function () { reveals.forEach(function (el) { el.classList.add("is-in"); }); };
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
    var st = $("[data-steps]");
    if (st) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { st.classList.add("is-drawn"); o.disconnect(); } }, { threshold: 0.25 }).observe(st);
    var map = { experience: "experience", pace: "experience", program: "program", facilitators: "facilitators", enhancements: "facilitators", "how-it-works": "how-it-works", faq: "faq", plan: "plan" };
    var links = $$("[data-spy]");
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var k = map[e.target.id];
        links.forEach(function (a) { if (a.getAttribute("data-spy") === k) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main > section[id]").forEach(function (s) { if (map[s.id]) spy.observe(s); });
    var top = $(".hero"); if (top) new IntersectionObserver(function (es) { if (es[0].isIntersecting) links.forEach(function (a) { a.removeAttribute("aria-current"); }); }, { rootMargin: "-45% 0px -50% 0px" }).observe(top);
    var acts = $$("[data-act]"), cur = $("[data-exp-cur]"), eb = $("[data-exp-bar]");
    var ao = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = acts.indexOf(e.target);
        acts.forEach(function (a, j) { a.classList.toggle("is-active", j === i); });
        if (cur) cur.textContent = "0" + (i + 1);
        if (eb) eb.style.transform = "scaleY(" + ((i + 1) / acts.length) + ")";
      });
    }, { rootMargin: "-42% 0px -48% 0px" });
    acts.forEach(function (a) { ao.observe(a); });
  } else flat();

  /* ---------- FAQ tabs ---------- */
  var tabs = $("[data-tabs]");
  if (tabs) {
    var tl = $("[data-tablist]", tabs), tb = $$('[role="tab"]', tabs), pn = $$("[data-panel]", tabs);
    tl.hidden = false; tabs.classList.add("is-enhanced");
    var sel = function (i, f) { tb.forEach(function (t, j) { var on = i === j; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; pn[j].hidden = !on; }); if (f) tb[i].focus(); };
    tb.forEach(function (t, i) {
      t.addEventListener("click", function () { sel(i, false); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, n = tb.length, nx = null;
        if (k === "ArrowRight") nx = (i + 1) % n; else if (k === "ArrowLeft") nx = (i - 1 + n) % n; else if (k === "Home") nx = 0; else if (k === "End") nx = n - 1;
        if (nx !== null) { e.preventDefault(); sel(nx, true); }
      });
    });
    sel(0, false);
  }

  /* ---------- pace + breath ring (4 s in, 6 s out) ---------- */
  var DESC = {
    join: "Join in: follow along with the group. The ring breathes in for 4 seconds and out for 6.",
    adapt: "Adapt: a smaller version. The ring moves less and the page moves gently.",
    observe: "Observe: just watch. The ring only glows softly and the page barely moves.",
    out: "Step out: everything on the page is still. Nothing is asked of you."
  };
  var CUE = { join: ["Breathe in", "Breathe out"], adapt: ["Breathe in, gently", "Breathe out, gently"], observe: ["Watch the ring. Breathe as you like.", "Watch the ring. Breathe as you like."], out: ["Paused. Take your time.", "Paused. Take your time."] };
  var STATIC_CUE = "Breathe in for 4, out for 6";
  var cues = $$("[data-cue],[data-cue-mini]"), pdesc = $("[data-pace-desc]"), radios = $$("[data-pace-radio]"), pbtns = $$("[data-pace-set]"), timer = null;
  var say = function (t) { cues.forEach(function (c) { c.textContent = t; }); };
  var stopCycle = function () { clearTimeout(timer); timer = null; doc.setAttribute("data-phase", "rest"); };
  function cycle(i) {
    if (reduceMQ.matches || pace === "out") { stopCycle(); say(reduceMQ.matches && pace !== "out" ? STATIC_CUE : CUE[pace][0]); return; }
    var inh = i === 0;
    doc.setAttribute("data-phase", inh ? "in" : "out"); say(CUE[pace][inh ? 0 : 1]);
    timer = setTimeout(function () { cycle(inh ? 1 : 0); }, inh ? 4000 : 6000);
  }
  function restart() { clearTimeout(timer); stopCycle(); requestAnimationFrame(function () { requestAnimationFrame(function () { cycle(0); }); }); }
  function applyMotion() {
    mult = reduceMQ.matches ? 0 : MULT[pace];
    calm = reduceMQ.matches || pace === "out" || pace === "observe";
    doc.style.setProperty("--m", String(mult));
    if (calm) doc.setAttribute("data-calm", ""); else doc.removeAttribute("data-calm");
    if (stage && mult === 0) stage.style.setProperty("--py", "0px");
    flat2();
    after(measure);
  }
  function flat2() { if (mult === 0) reveals.forEach(function (el) { el.classList.add("is-in"); }); }
  function setPace(v) {
    pace = v; doc.setAttribute("data-pace", v);
    radios.forEach(function (r) { r.checked = r.value === v; });
    pbtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-pace-set") === v)); });
    if (pdesc) pdesc.textContent = DESC[v];
    $$("[data-pcard]").forEach(function (c) { c.classList.toggle("is-current", c.getAttribute("data-pcard") === v); });
    applyMotion(); restart();
  }
  radios.forEach(function (r) { r.addEventListener("change", function () { if (r.checked) setPace(r.value); }); });
  pbtns.forEach(function (b) { b.addEventListener("click", function () { setPace(b.getAttribute("data-pace-set")); }); });
  if (reduceMQ.addEventListener) reduceMQ.addEventListener("change", function () { applyMotion(); restart(); });
  setPace("join");
  if (D.fonts && D.fonts.ready) D.fonts.ready.then(measure);
  addEventListener("load", measure);

  /* ---------- inquiry form: client-side validation only. Sends nothing. ---------- */
  var form = $("[data-form]");
  if (form) {
    form.setAttribute("novalidate", "");
    var summary = $("[data-error-summary]"), sumList = $("[data-error-list]"), done = $("[data-done]"), count = $("[data-count]", form), goals = $("#f-goals");
    var rc = $("[data-req-count]"), rb = $("[data-req-bar]");
    var attempted = false;
    var healthWords = /\b(diagnos\w*|medication\w*|prescri\w*|disorder|illness|injur\w*|surgery|pregnan\w*|anxiety|depression|diabet\w*|blood pressure)\b/i;
    var rules = {
      name: function (v) { return v.trim() ? "" : "Enter your name."; },
      company: function (v) { return v.trim() ? "" : "Enter your company name."; },
      email: function (v) { v = v.trim(); if (!v) return "Enter your work email."; if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter an email address like name@company.com."; return ""; },
      event_type: function (v) { return v ? "" : "Choose an event type."; },
      audience_size: function (v) { return v ? "" : "Choose an approximate audience size."; },
      approx_date: function (v) { return v.length > 120 ? "Keep this under 120 characters." : ""; },
      location: function (v) { return v.length > 120 ? "Keep this under 120 characters." : ""; },
      goals: function (v) { if (v.length > 1000) return "Keep this under 1000 characters."; if (healthWords.test(v)) return "This looks like it may include health information. Please describe your event goals only."; return ""; }
    };
    var labels = { name: "Your name", company: "Company", email: "Work email", event_type: "Event type", audience_size: "Audience size", approx_date: "Approximate date", location: "Location", goals: "Goals" };
    var check = function (el) {
      var fn = rules[el.name]; if (!fn) return "";
      var msg = fn(el.value), err = D.getElementById(el.id + "-err");
      el.setAttribute("aria-invalid", msg ? "true" : "false"); if (err) err.textContent = msg; return msg;
    };
    var fields = $$("input, select, textarea", form);
    var meter = function () {
      var n = 0; ["name", "company", "email", "event_type", "audience_size"].forEach(function (k) { var el = form.elements[k]; if (el && el.value.trim() && (k !== "email" || !rules.email(el.value))) n++; });
      if (rc) rc.textContent = String(n); if (rb) rb.style.transform = "scaleX(" + n / 5 + ")";
    };
    fields.forEach(function (el) {
      el.addEventListener("blur", function () { if (attempted || el.value) check(el); });
      el.addEventListener("input", function () { if (attempted || el.getAttribute("aria-invalid") === "true") check(el); meter(); });
      el.addEventListener("change", meter);
    });
    if (goals && count) goals.addEventListener("input", function () { count.textContent = String(goals.value.length); });
    form.addEventListener("submit", function (e) {
      e.preventDefault(); attempted = true;
      var errors = [];
      fields.forEach(function (el) { var m = check(el); if (m) errors.push({ el: el, msg: m }); });
      sumList.innerHTML = "";
      if (errors.length) {
        errors.forEach(function (er) {
          var li = D.createElement("li"), a = D.createElement("a");
          a.href = "#" + er.el.id; a.textContent = labels[er.el.name] + ": " + er.msg;
          a.addEventListener("click", function (ev) { ev.preventDefault(); er.el.focus(); });
          li.appendChild(a); sumList.appendChild(li);
        });
        summary.hidden = false; summary.focus(); return;
      }
      summary.hidden = true; form.hidden = true; done.hidden = false; done.focus();
      /* PREVIEW: no network request is made. Wire to the confirmed inquiry destination before launch. */
    });
    var reset = $("[data-reset]");
    if (reset) reset.addEventListener("click", function () {
      form.reset(); attempted = false;
      fields.forEach(function (el) { el.removeAttribute("aria-invalid"); var er = D.getElementById(el.id + "-err"); if (er) er.textContent = ""; });
      if (count) count.textContent = "0"; meter();
      done.hidden = true; form.hidden = false; form.querySelector("input").focus();
    });
  }
  after(update);
})();
