/*  Shared version bar + color-scheme picker
    Include once per page:  <script src="../version-bar.js"></script>
    Handles: version dropdown, color-scheme dropdown, body offset, localStorage persistence.
    To add a new version, edit the VERSIONS array below — every page updates automatically. */

(function () {
  'use strict';

  /* ── Configuration ────────────────────────────── */

  var VERSIONS = [
    { dir: 'v1', label: 'v1 — Original' },
    { dir: 'v2', label: 'v2 — Design' },
    { dir: 'v3', label: 'v3 — Redesign' },
    { dir: 'v4', label: 'v4 — Immersive' },
    { dir: 'v5', label: 'v5 — Cinematic' },
    { dir: 'v6', label: 'v6 — Human Experience' },
    { dir: 'v7', label: 'v7 — Platform' },
    { dir: 'v8', label: 'v8 — Editorial Premium' }
  ];

  var SCHEMES = {
    'navy-gold':       { bg:'#F5F3EF',surface:'#FFFFFF',stone:'#EDE8DF',tint:'#E8EDF5',ink:'#0F1B2D',muted:'#3D4A5C',plum:'#1B3A5C',plumd:'#102640',edge:'#6B7A8E',hair:'#D4CFC5',ringa:'#9BB3CC',ringb:'#7095B8',mark:'#1B3A5C',echo:'#7095B8' },
    'forest-cream':    { bg:'#F9F7F2',surface:'#FFFFFF',stone:'#F0EDE4',tint:'#EFF5EE',ink:'#1A2418',muted:'#3C4A38',plum:'#2D5E3A',plumd:'#1C3E25',edge:'#7A8577',hair:'#DDD8CD',ringa:'#A8C8AC',ringb:'#82AC87',mark:'#2D5E3A',echo:'#82AC87' },
    'slate-coral':     { bg:'#F6F5F3',surface:'#FFFFFF',stone:'#EDECEA',tint:'#F8F0EE',ink:'#1E2228',muted:'#454B56',plum:'#C85A4A',plumd:'#A44438',edge:'#7C8088',hair:'#DDDCD8',ringa:'#E0B0A8',ringb:'#D49488',mark:'#C85A4A',echo:'#D49488' },
    'charcoal-teal':   { bg:'#F4F6F6',surface:'#FFFFFF',stone:'#E8EDEC',tint:'#E6F2F0',ink:'#1A2224',muted:'#384548',plum:'#1A7A6E',plumd:'#105A50',edge:'#6E8084',hair:'#D0D8D6',ringa:'#96C8C0',ringb:'#6AADA2',mark:'#1A7A6E',echo:'#6AADA2' },
    'burgundy-blush':  { bg:'#FAF7F7',surface:'#FFFFFF',stone:'#F2ECEC',tint:'#F8F0F2',ink:'#22181A',muted:'#4D3A3E',plum:'#7A2840',plumd:'#581C2E',edge:'#8A7478',hair:'#E0D6D8',ringa:'#D4A8B4',ringb:'#C08898',mark:'#7A2840',echo:'#C08898' },
    'ocean-sand':      { bg:'#FAF8F4',surface:'#FFFFFF',stone:'#F0EDE5',tint:'#EDF4F8',ink:'#14202A',muted:'#3A4E5A',plum:'#1868A0',plumd:'#104A74',edge:'#6A8090',hair:'#D6D0C6',ringa:'#90C0DC',ringb:'#60A0C8',mark:'#1868A0',echo:'#60A0C8' },
    'espresso-sage':   { bg:'#F8F6F2',surface:'#FFFFFF',stone:'#EFEBE3',tint:'#F2F4EE',ink:'#201C16',muted:'#4A4238',plum:'#5C4830',plumd:'#3E3020',edge:'#847868',hair:'#DCD4C8',ringa:'#C0B8A0',ringb:'#A09478',mark:'#5C4830',echo:'#A09478' },
    'indigo-amber':    { bg:'#F5F4F8',surface:'#FFFFFF',stone:'#ECEAF2',tint:'#F8F4EC',ink:'#181624',muted:'#3E3C52',plum:'#4840A0',plumd:'#302870',edge:'#706C84',hair:'#D6D4DE',ringa:'#B0A8D4',ringb:'#8880B8',mark:'#4840A0',echo:'#8880B8' },
    'graphite-rose':   { bg:'#F6F5F4',surface:'#FFFFFF',stone:'#ECEAE8',tint:'#F6F0F2',ink:'#1C1E20',muted:'#424648',plum:'#B0506A',plumd:'#8A3850',edge:'#787C80',hair:'#D8D6D4',ringa:'#D4A0B0',ringb:'#C08098',mark:'#B0506A',echo:'#C08098' }
  };

  var BAR_HEIGHT = 38;

  /* ── Detect current version from URL path ────── */

  var path = window.location.pathname;
  var currentDir = '';
  for (var i = 0; i < VERSIONS.length; i++) {
    if (path.indexOf('/' + VERSIONS[i].dir + '/') !== -1) {
      currentDir = VERSIONS[i].dir;
      break;
    }
  }

  /* ── Inject styles ────────────────────────────── */

  var style = document.createElement('style');
  style.textContent =
    '.vbar{position:fixed;top:0;left:0;right:0;z-index:9999;background:#1B2030;color:#fff;' +
    'display:flex;align-items:center;justify-content:center;gap:8px;' +
    'font:600 12px/1 system-ui,sans-serif;padding:8px 16px;' +
    'box-shadow:0 2px 12px rgba(0,0,0,.25);flex-wrap:wrap}' +
    '.vbar__label{opacity:.5;font-weight:400;font-size:11px}' +
    '.vbar__sep{width:1px;height:18px;background:rgba(255,255,255,.2);margin:0 4px}' +
    '.vbar__sel{background:#2a2f40;color:#fff;border:1px solid rgba(255,255,255,.25);' +
    'border-radius:8px;padding:4px 8px;font:600 12px/1.4 system-ui,sans-serif;' +
    'cursor:pointer;outline:none;min-width:140px}' +
    '.vbar__sel:hover{border-color:rgba(255,255,255,.5)}' +
    '.vbar__sel:focus{border-color:#B87333;box-shadow:0 0 0 2px rgba(184,115,51,.3)}' +
    '.vbar__hub{color:rgba(255,255,255,.55);text-decoration:none;font-size:11px;' +
    'padding:3px 10px;border:1px solid rgba(255,255,255,.18);border-radius:999px;transition:all .2s}' +
    '.vbar__hub:hover{color:#fff;border-color:rgba(255,255,255,.5);background:rgba(255,255,255,.08)}';
  document.head.appendChild(style);

  /* ── Build bar HTML ───────────────────────────── */

  var bar = document.createElement('div');
  bar.className = 'vbar';
  bar.setAttribute('role', 'navigation');
  bar.setAttribute('aria-label', 'Version and color controls');

  var vOpts = '';
  for (var j = 0; j < VERSIONS.length; j++) {
    var v = VERSIONS[j];
    var sel = v.dir === currentDir ? ' selected' : '';
    vOpts += '<option value="../' + v.dir + '/"' + sel + '>' + v.label + '</option>';
  }

  var sOpts =
    '<option value="">Default palette</option>' +
    '<option value="navy-gold">Navy &amp; Gold</option>' +
    '<option value="forest-cream">Forest &amp; Cream</option>' +
    '<option value="slate-coral">Slate &amp; Coral</option>' +
    '<option value="charcoal-teal">Charcoal &amp; Teal</option>' +
    '<option value="burgundy-blush">Burgundy &amp; Blush</option>' +
    '<option value="ocean-sand">Ocean &amp; Sand</option>' +
    '<option value="espresso-sage">Espresso &amp; Sage</option>' +
    '<option value="indigo-amber">Indigo &amp; Amber</option>' +
    '<option value="graphite-rose">Graphite &amp; Rose</option>';

  bar.innerHTML =
    '<span class="vbar__label">Version</span>' +
    '<select class="vbar__sel" id="version-picker">' + vOpts + '</select>' +
    '<span class="vbar__sep"></span>' +
    '<span class="vbar__label">Colors</span>' +
    '<select class="vbar__sel" id="scheme-picker">' + sOpts + '</select>' +
    '<span class="vbar__sep"></span>' +
    '<a class="vbar__hub" href="../compare.html">Compare all ↗</a>';

  document.body.insertBefore(bar, document.body.firstChild);

  /* ── Body offset for fixed bar ────────────────── */

  var existingPadding = parseInt(window.getComputedStyle(document.body).paddingTop, 10) || 0;
  document.body.style.paddingTop = (existingPadding + BAR_HEIGHT) + 'px';
  var header = document.querySelector('.site-header, [data-header]');
  if (header) {
    var curr = parseInt(window.getComputedStyle(header).top, 10) || 0;
    header.style.top = (curr + BAR_HEIGHT) + 'px';
  }
  document.documentElement.style.scrollPaddingTop =
    'calc(' + BAR_HEIGHT + 'px + var(--header-h, 60px))';

  /* ── Version navigation ───────────────────────── */

  document.getElementById('version-picker').addEventListener('change', function () {
    if (this.value) window.location.href = this.value;
  });

  /* ── Color-scheme picker ──────────────────────── */

  var pick = document.getElementById('scheme-picker');

  function applyScheme(v) {
    var r = document.documentElement.style;
    if (!v) {
      ['bg','surface','stone','tint','ink','muted','plum','plum-d','edge','hair','ring-a','ring-b']
        .forEach(function (p) { r.removeProperty('--' + p); });
      document.querySelectorAll('.mark__main').forEach(function (el) { el.style.stroke = ''; });
      document.querySelectorAll('.mark__echo').forEach(function (el) { el.style.stroke = ''; });
      return;
    }
    var s = SCHEMES[v];
    if (!s) return;
    r.setProperty('--bg', s.bg);
    r.setProperty('--surface', s.surface);
    r.setProperty('--stone', s.stone);
    r.setProperty('--tint', s.tint);
    r.setProperty('--ink', s.ink);
    r.setProperty('--muted', s.muted);
    r.setProperty('--plum', s.plum);
    r.setProperty('--plum-d', s.plumd);
    r.setProperty('--edge', s.edge);
    r.setProperty('--hair', s.hair);
    r.setProperty('--ring-a', s.ringa);
    r.setProperty('--ring-b', s.ringb);
    document.querySelectorAll('.mark__main').forEach(function (el) { el.style.stroke = s.mark; });
    document.querySelectorAll('.mark__echo').forEach(function (el) { el.style.stroke = s.echo; });
  }

  try {
    var saved = localStorage.getItem('ww-scheme');
    if (saved && SCHEMES[saved]) { pick.value = saved; applyScheme(saved); }
  } catch (e) {}

  pick.addEventListener('change', function () {
    var v = pick.value;
    try { localStorage.setItem('ww-scheme', v); } catch (e) {}
    applyScheme(v);
  });
})();
