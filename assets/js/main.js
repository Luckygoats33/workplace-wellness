/* Workplace Wellness by SWG: preview interactions. No dependencies. */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = function () { return reduceMQ.matches; };

  /* Year */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = String(new Date().getFullYear());

  /* Header state */
  var header = document.querySelector("[data-header]");
  var onScroll = function () { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* Mobile nav */
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    var label = toggle.querySelector(".nav-toggle__label");
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      if (label) label.textContent = open ? "Close" : "Menu";
    };
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
    });
  }

  /* Reveal on scroll */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced()) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Hero motion pause (WCAG 2.2.2) */
  var mt = document.querySelector("[data-motion-toggle]");
  if (mt) {
    var frame = mt.closest(".room__frame");
    var ml = mt.querySelector("[data-motion-label]");
    mt.addEventListener("click", function () {
      var paused = mt.getAttribute("aria-pressed") !== "true";
      mt.setAttribute("aria-pressed", String(paused));
      frame.classList.toggle("is-paused", paused);
      ml.textContent = paused ? "Play motion" : "Pause motion";
    });
  }

  /* Breath pacer: one or more slow cycles, 4s in, 6s out */
  var pacer = document.querySelector("[data-pacer]");
  if (pacer) {
    var btn = pacer.querySelector("[data-pacer-btn]");
    var orb = pacer.querySelector("[data-pacer-orb]");
    var status = pacer.querySelector("[data-pacer-status]");
    var timers = [];
    var running = false;
    var clear = function () { timers.forEach(clearTimeout); timers = []; };
    var stop = function (msg) {
      clear(); running = false; orb.classList.remove("is-in");
      btn.textContent = "Start a slow breath"; btn.setAttribute("aria-pressed", "false");
      status.textContent = msg || "Ready when you are.";
    };
    var cycle = function (n) {
      orb.style.transitionDuration = reduced() ? "0s" : "4s";
      orb.classList.add("is-in");
      status.textContent = "Breathe in… (about 4 seconds)";
      timers.push(setTimeout(function () {
        orb.style.transitionDuration = reduced() ? "0s" : "6s";
        orb.classList.remove("is-in");
        status.textContent = "And slowly out… (about 6 seconds)";
      }, 4000));
      timers.push(setTimeout(function () {
        if (n > 1) cycle(n - 1); else stop("Nicely done. That’s the idea: simple, and always optional.");
      }, 10000));
    };
    btn.addEventListener("click", function () {
      if (running) { stop("Stopped. Pick it up any time."); return; }
      running = true; btn.textContent = "Stop"; btn.setAttribute("aria-pressed", "true");
      cycle(3);
    });
  }

  /* FAQ tabs (progressive enhancement; without JS both groups show) */
  var tabs = document.querySelector("[data-tabs]");
  if (tabs) {
    var list = tabs.querySelector("[data-tablist]");
    var tabBtns = Array.prototype.slice.call(tabs.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(tabs.querySelectorAll("[data-panel]"));
    list.hidden = false; tabs.classList.add("is-enhanced");
    var select = function (i, focus) {
      tabBtns.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
      });
      if (focus) tabBtns[i].focus();
    };
    tabBtns.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i, false); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, n = tabBtns.length, next = null;
        if (k === "ArrowRight") next = (i + 1) % n;
        else if (k === "ArrowLeft") next = (i - 1 + n) % n;
        else if (k === "Home") next = 0;
        else if (k === "End") next = n - 1;
        if (next !== null) { e.preventDefault(); select(next, true); }
      });
    });
    select(0, false);
  }

  /* Inquiry form: client-side validation only. Sends nothing. */
  var form = document.querySelector("[data-form]");
  if (form) {
    form.setAttribute("novalidate", "");
    var summary = document.querySelector("[data-error-summary]");
    var sumList = document.querySelector("[data-error-list]");
    var done = document.querySelector("[data-done]");
    var count = form.querySelector("[data-count]");
    var goals = form.querySelector("#f-goals");
    var attempted = false;
    var healthWords = /\b(diagnos\w*|medication\w*|prescri\w*|disorder|illness|injur\w*|surgery|pregnan\w*|anxiety|depression|diabet\w*|blood pressure)\b/i;

    var rules = {
      name: function (v) { return v.trim() ? "" : "Enter your name."; },
      company: function (v) { return v.trim() ? "" : "Enter your company name."; },
      email: function (v) {
        v = v.trim();
        if (!v) return "Enter your work email.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter an email address like name@company.com.";
        return "";
      },
      event_type: function (v) { return v ? "" : "Choose an event type."; },
      audience_size: function (v) { return v ? "" : "Choose an approximate audience size."; },
      approx_date: function (v) { return v.length > 120 ? "Keep this under 120 characters." : ""; },
      location: function (v) { return v.length > 120 ? "Keep this under 120 characters." : ""; },
      goals: function (v) {
        if (v.length > 1000) return "Keep this under 1000 characters.";
        if (healthWords.test(v)) return "This looks like it may include health information. Please describe your event goals only.";
        return "";
      }
    };
    var labels = { name: "Your name", company: "Company", email: "Work email", event_type: "Event type", audience_size: "Audience size", approx_date: "Approximate date", location: "Location", goals: "Goals" };

    var check = function (el) {
      var fn = rules[el.name]; if (!fn) return "";
      var msg = fn(el.value);
      var err = document.getElementById(el.id + "-err");
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg;
      return msg;
    };
    var fields = Array.prototype.slice.call(form.querySelectorAll("input, select, textarea"));
    fields.forEach(function (el) {
      el.addEventListener("blur", function () { if (attempted || el.value) check(el); });
      el.addEventListener("input", function () { if (attempted || el.getAttribute("aria-invalid") === "true") check(el); });
    });
    if (goals && count) goals.addEventListener("input", function () { count.textContent = String(goals.value.length); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      attempted = true;
      var errors = [];
      fields.forEach(function (el) { var m = check(el); if (m) errors.push({ el: el, msg: m }); });
      sumList.innerHTML = "";
      if (errors.length) {
        errors.forEach(function (er) {
          var li = document.createElement("li");
          var a = document.createElement("a");
          a.href = "#" + er.el.id;
          a.textContent = labels[er.el.name] + ": " + er.msg;
          a.addEventListener("click", function (ev) { ev.preventDefault(); er.el.focus(); });
          li.appendChild(a); sumList.appendChild(li);
        });
        summary.hidden = false;
        summary.focus();
        return;
      }
      summary.hidden = true;
      form.hidden = true;
      done.hidden = false;
      done.focus();
      /* PREVIEW: no network request is made. Wire to the confirmed inquiry destination before launch. */
    });

    var reset = document.querySelector("[data-reset]");
    if (reset) reset.addEventListener("click", function () {
      form.reset(); attempted = false;
      fields.forEach(function (el) { el.removeAttribute("aria-invalid"); var er = document.getElementById(el.id + "-err"); if (er) er.textContent = ""; });
      if (count) count.textContent = "0";
      done.hidden = true; form.hidden = false;
      form.querySelector("input").focus();
    });
  }
})();
