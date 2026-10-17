"""QA for direction d/ (flagship). Expects `python3 -m http.server 8769 --bind 127.0.0.1 --directory d`. Needs playwright, system chrome, /tmp/axe/axe.min.js.
Writes screenshots/d-*.png and screenshots/qa-d.json. Full-page captures set html[data-calm] (flattens the pinned sample-day stage, which would otherwise be 3x viewport tall)
and reveal everything; the pinned stage itself is captured separately at several scroll positions (d-pinned-*.png)."""
import json, time
from playwright.sync_api import sync_playwright
URL = "http://127.0.0.1:8769/"; OUT = "/workspace/workplace-wellness-site/screenshots"
AXE = open("/tmp/axe/axe.min.js").read(); report = {}
SIZES = [(320, 700), (390, 844), (768, 1024), (1024, 768), (1280, 800), (1440, 900), (1920, 1080)]
SHOT_FULL = (390, 768, 1280, 1920)
TAP = """() => {const sel='a[href],button,input:not([type=hidden]),select,textarea,summary,[role=tab]';const bad=[];
 for (const el of document.querySelectorAll(sel)) {const r=el.getBoundingClientRect();const cs=getComputedStyle(el);
  if (r.width===0||r.height===0||cs.visibility==='hidden') continue;
  if (el.classList.contains('skip-link')) continue;
  if (el.type==='radio'){ const p=el.parentElement.getBoundingClientRect(); if(p.width>=44&&p.height>=44) continue; }
  if (r.width<44||r.height<44) bad.push({tag:el.tagName,text:(el.innerText||el.id||el.name||'').trim().slice(0,40),w:Math.round(r.width),h:Math.round(r.height)});}
 return bad;}"""
OVER = """() => {const vw=document.documentElement.clientWidth;const out=[];
 for (const el of document.querySelectorAll('body *')) {const r=el.getBoundingClientRect();
  if (r.width && (r.right>vw+1||r.left<-1) && getComputedStyle(el).position!=='fixed' && !el.closest('svg,.art__stage,.format,.plan__panel,.art__rings')) out.push(el.tagName+'.'+String(el.className).slice(0,30)+' right='+Math.round(r.right));}
 return {scrollWidth:document.documentElement.scrollWidth,clientWidth:vw,bodyScrollWidth:document.body.scrollWidth,over:out.slice(0,10)};}"""
AXEJS = """async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']});return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,nodes:v.nodes.slice(0,4).map(n=>n.target.join(' ')+' :: '+(n.failureSummary||'').slice(0,200))})),incomplete:r.incomplete.map(v=>v.id+' x'+v.nodes.length)}}"""
FOCUS = """()=>{const e=document.activeElement;if(!e||e===document.body)return null;const vis=(x)=>{const c=getComputedStyle(x);return c.outlineStyle!=='none'&&parseFloat(c.outlineWidth)>=2};
 let o=vis(e); if(!o&&e.type==='radio'){const f=e.nextElementSibling;o=!!f&&vis(f);}
 const r=e.getBoundingClientRect(); return {ok:o,id:(e.id||e.name||e.className||e.tagName)+'',t:(e.innerText||'').trim().slice(0,28),onscreen:r.bottom>0&&r.top<innerHeight}}"""

def settle(pg):
    pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(500)
    H = pg.evaluate("document.documentElement.scrollHeight")
    for yy in range(0, H, 400): pg.evaluate(f"window.scrollTo({{top:{yy},behavior:'instant'}})"); pg.wait_for_timeout(40)
    pg.evaluate("window.scrollTo({top:0,behavior:'instant'})"); pg.wait_for_timeout(400)

def run():
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        for w, h in SIZES:
            ctx = b.new_context(viewport={"width": w, "height": h}); pg = ctx.new_page()
            reqs = []; pg.on("request", lambda r: reqs.append((r.method, r.url)))
            errs = []; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: m.type == "error" and errs.append(m.text))
            pg.goto(URL, wait_until="networkidle"); pg.wait_for_timeout(1800)
            pg.screenshot(path=f"{OUT}/d-{w}-fold.png")
            r = {"viewport": [w, h]}
            settle(pg)
            ov = [pg.evaluate(OVER)]
            for y in (0, 900, 2500, 4800, 7000, 9000): pg.evaluate(f"window.scrollTo({{top:{y},behavior:'instant'}})"); pg.wait_for_timeout(120); ov.append(pg.evaluate(OVER))
            pg.evaluate("window.scrollTo({top:0,behavior:'instant'})")
            r["overflow"] = max(ov, key=lambda o: o["scrollWidth"]); r["overflow_samples"] = [o["scrollWidth"] for o in ov]
            r["hscroll_px"] = max(o["scrollWidth"] - o["clientWidth"] for o in ov)
            r["tap_small"] = pg.evaluate(TAP)
            pg.wait_for_timeout(900); pg.add_script_tag(content=AXE); r["axe"] = pg.evaluate(AXEJS)
            r["header_compact_on_scroll"] = None
            pg.evaluate("window.scrollTo({top:600,behavior:'instant'})"); pg.wait_for_timeout(600)
            r["header_compact_on_scroll"] = pg.evaluate("document.querySelector('[data-header]').classList.contains('is-compact')")
            r["header_height_compact"] = pg.evaluate("Math.round(document.querySelector('[data-header]').getBoundingClientRect().height)")
            r["progress_scaleX_at_600"] = pg.evaluate("document.querySelector('[data-progress]').style.transform")
            pg.evaluate("window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})"); pg.wait_for_timeout(400)
            r["progress_scaleX_at_bottom"] = pg.evaluate("document.querySelector('[data-progress]').style.transform")
            pg.evaluate("window.scrollTo({top:0,behavior:'instant'})"); pg.wait_for_timeout(300)
            # scroll-spy: jump to each section, check aria-current
            spy = {}
            for sec in ("experience", "program", "facilitators", "how-it-works", "faq", "plan"):
                pg.evaluate(f"(()=>{{const e=document.getElementById('{sec}');const r=e.getBoundingClientRect();window.scrollTo({{top:r.top+scrollY-innerHeight*0.3,behavior:'instant'}})}})()"); pg.wait_for_timeout(450)
                spy[sec] = pg.evaluate("(document.querySelector('[data-spy][aria-current=true]')||{}).textContent||null")
            r["scrollspy"] = spy
            pg.evaluate("window.scrollTo({top:0,behavior:'instant'})"); pg.wait_for_timeout(300)
            if w in SHOT_FULL:
                pg.evaluate("document.documentElement.setAttribute('data-calm','');document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-in'));document.querySelector('[data-steps]').classList.add('is-drawn')"); pg.wait_for_timeout(700)
                pg.screenshot(path=f"{OUT}/d-{w}.png", full_page=True)
                pg.evaluate("document.documentElement.removeAttribute('data-calm')")
            if w == 390 or w == 320:
                pg.evaluate("window.scrollTo(0,0)"); pg.click("[data-nav-toggle]"); pg.wait_for_timeout(400)
                if w == 390: pg.screenshot(path=f"{OUT}/d-menu-open-390.png")
                r["menu_expanded"] = pg.get_attribute("[data-nav-toggle]", "aria-expanded"); r["tap_small_menu"] = pg.evaluate(TAP)
                r["menu_hscroll"] = pg.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")
                pg.keyboard.press("Escape"); pg.wait_for_timeout(200)
            # keyboard walk: Tab through every stop, each must show a visible focus indicator and be scrolled into view
            pg.evaluate("window.scrollTo({top:0,behavior:'instant'})"); pg.evaluate("document.activeElement&&document.activeElement.blur()")
            noring = []; stops = 0; seen = set()
            for i in range(140):
                pg.keyboard.press("Tab"); pg.wait_for_timeout(15)
                info = pg.evaluate(FOCUS)
                if not info: continue
                key = info["id"] + info["t"]
                if key in seen and i > 20: break
                seen.add(key); stops += 1
                if not info["ok"]: noring.append(info)
            r["focus_stops"] = stops; r["focus_without_ring"] = noring
            n0 = len(reqs)
            pg.evaluate("document.getElementById('plan').scrollIntoView({behavior:'instant'})"); pg.wait_for_timeout(300)
            pg.click("#inquiry-form button[type=submit]"); pg.wait_for_timeout(350)
            r["empty_submit_errors"] = pg.evaluate("[...document.querySelectorAll('[data-error-list] li')].map(l=>l.innerText)")
            r["summary_focused"] = pg.evaluate("document.activeElement.matches('[data-error-summary]')")
            r["invalid_fields"] = pg.evaluate("[...document.querySelectorAll('[aria-invalid=true]')].map(e=>e.id)")
            if w in (390, 1280): pg.locator("[data-error-summary]").scroll_into_view_if_needed(); pg.wait_for_timeout(200); pg.screenshot(path=f"{OUT}/d-form-errors-{w}.png")
            pg.fill("#f-name", "Alex Test"); pg.fill("#f-company", "Example Co"); pg.fill("#f-email", "not-an-email")
            pg.select_option("#f-type", index=1); pg.select_option("#f-size", index=3); pg.fill("#f-goals", "Something everyone can join. One attendee has a diagnosis of X.")
            pg.click("#inquiry-form button[type=submit]"); pg.wait_for_timeout(300)
            r["bad_email_and_health_errors"] = pg.evaluate("[...document.querySelectorAll('[data-error-list] li')].map(l=>l.innerText)")
            r["meter_before_valid"] = pg.evaluate("document.querySelector('[data-req-count]').textContent")
            if w in (390, 1280): pg.locator("[data-error-summary]").scroll_into_view_if_needed(); pg.wait_for_timeout(200); pg.screenshot(path=f"{OUT}/d-form-bad-email-health-{w}.png")
            pg.fill("#f-email", "alex@example.com"); pg.fill("#f-goals", "A break from presentations and time to connect.")
            r["meter_valid"] = pg.evaluate("document.querySelector('[data-req-count]').textContent")
            pg.click("#inquiry-form button[type=submit]"); pg.wait_for_timeout(500)
            r["done_visible"] = pg.is_visible("[data-done]"); r["form_hidden"] = not pg.is_visible("[data-form]")
            r["done_text"] = pg.inner_text("[data-done] h3"); r["done_focused"] = pg.evaluate("document.activeElement.matches('[data-done]')")
            r["requests_after_submit"] = reqs[n0:]; r["url_after"] = pg.url
            if w in (390, 1280): pg.locator("[data-done]").scroll_into_view_if_needed(); pg.wait_for_timeout(1500); pg.screenshot(path=f"{OUT}/d-form-success-{w}.png")
            r["external_requests"] = [u for _, u in reqs if not u.startswith(URL)]
            r["total_requests"] = len(reqs); r["errors"] = errs; report[w] = r; ctx.close()

        # ---- pinned stage + parallax + pace + reduced motion (1280x800) ----
        ctx = b.new_context(viewport={"width": 1280, "height": 800}); pg = ctx.new_page(); pg.goto(URL, wait_until="networkidle"); pg.wait_for_timeout(1500)
        ch = {}
        PIN = """(fr)=>{const d=document.querySelector('[data-day]');const r=d.getBoundingClientRect();const top=r.top+scrollY;const total=r.height-d.firstElementChild.offsetHeight;scrollTo({top:top-68+total*fr+2,behavior:'instant'});return {pos:getComputedStyle(d.firstElementChild).position,total:Math.round(total)}}"""
        steps = []
        for i, fr in enumerate((0.02, 0.25, 0.45, 0.65, 0.9)):
            info = pg.evaluate(PIN, fr); pg.wait_for_timeout(1100)
            act = pg.evaluate("[...document.querySelectorAll('[data-step]')].findIndex(s=>s.classList.contains('is-active'))+1")
            lab = pg.evaluate("document.querySelector('[data-day-label]').textContent")
            steps.append({"fraction": fr, "active_step": act, "stage_label": lab, "stick_position": info["pos"]})
            pg.screenshot(path=f"{OUT}/d-pinned-step{i+1}-1280.png")
        ch["pinned_stage"] = steps
        ch["pinned_steps_distinct_and_ordered"] = [s["active_step"] for s in steps] == [1, 2, 3, 4, 5]
        # parallax
        pg.evaluate("scrollTo({top:0,behavior:'instant'})"); pg.wait_for_timeout(300)
        tfA = "getComputedStyle(document.querySelector('.art__a')).transform"; tfB = "getComputedStyle(document.querySelector('.art__b')).transform"
        t0 = (pg.evaluate(tfA), pg.evaluate(tfB)); pg.evaluate("scrollTo({top:320,behavior:'instant'})"); pg.wait_for_timeout(200)
        ch["parallax_join"] = {"at0": t0, "at320": (pg.evaluate(tfA), pg.evaluate(tfB)), "moves": t0 != (pg.evaluate(tfA), pg.evaluate(tfB))}
        # pace modes
        pace = {}
        for v in ("join", "adapt", "observe", "out"):
            pg.evaluate("scrollTo({top:0,behavior:'instant'})"); pg.wait_for_timeout(150)
            pg.click(f"label.seg__opt:has(input[value={v}])"); pg.wait_for_timeout(300)
            pg.evaluate("scrollTo({top:340,behavior:'instant'})"); pg.wait_for_timeout(250)
            tf = "getComputedStyle(document.querySelector('.dock .ring__core')).transform"
            e = {"m": pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--m').trim()"), "calm": pg.evaluate("document.documentElement.hasAttribute('data-calm')"),
                 "parallax_A_transform": pg.evaluate(tfA), "day_stick_position": pg.evaluate("getComputedStyle(document.querySelector('.day__stick')).position"),
                 "status": pg.inner_text("[data-pace-desc]")}
            pg.evaluate("scrollTo({top:0,behavior:'instant'})"); pg.wait_for_timeout(200)
            if v == "observe": pg.wait_for_timeout(5000)
            t1 = pg.evaluate(tf); pg.wait_for_timeout(2500); t2 = pg.evaluate(tf); pg.wait_for_timeout(2500); t3 = pg.evaluate(tf)
            e["ring_transforms"] = [t1, t2, t3]; e["ring_static"] = (t1 == t2 == t3)
            e["running_animations"] = pg.evaluate("document.getAnimations().filter(a=>a.playState==='running').length")
            e["data_phase"] = pg.get_attribute("html", "data-phase")
            e["transition_core"] = pg.evaluate("getComputedStyle(document.querySelector('.dock .ring__core')).transitionDuration")
            e["hover_lift_card"] = None
            pace[v] = e
            if v in ("adapt", "out"): pg.screenshot(path=f"{OUT}/d-pace-{v}-1280.png")
        ch["pace"] = pace
        # out: scroll through whole page, parallax stays 0 and nothing animates
        pg.evaluate("scrollTo({top:1200,behavior:'instant'})"); pg.wait_for_timeout(300)
        ch["out_after_scroll"] = {"parallax_A": pg.evaluate(tfA), "reveals_hidden": pg.evaluate("[...document.querySelectorAll('.reveal')].filter(e=>getComputedStyle(e).opacity!=='1').length"), "running_animations": pg.evaluate("document.getAnimations().filter(a=>a.playState==='running').length")}
        # radios are native, keyboard operable
        pg.evaluate("scrollTo({top:0,behavior:'instant'})"); pg.focus("input[value=join]"); pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(200)
        ch["radio_arrow_key"] = pg.get_attribute("html", "data-pace")
        ctx.close()
        # reduced motion
        rm = {}
        for w, h in ((390, 844), (1280, 800)):
            ctx = b.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce"); pg = ctx.new_page(); pg.goto(URL, wait_until="networkidle"); pg.wait_for_timeout(1200)
            e = {}
            tf = "getComputedStyle(document.querySelector('.dock .ring__core')).transform"
            t1 = pg.evaluate(tf); pg.wait_for_timeout(2500); t2 = pg.evaluate(tf); e["ring_static"] = t1 == t2; e["data_phase"] = pg.get_attribute("html", "data-phase"); e["cue"] = pg.inner_text("[data-cue]")
            e["ring_transition"] = pg.evaluate("getComputedStyle(document.querySelector('.ring__core')).transitionDuration")
            e["running_animations"] = pg.evaluate("document.getAnimations().filter(a=>a.playState==='running').length")
            pg.evaluate("scrollTo({top:340,behavior:'instant'})"); pg.wait_for_timeout(250)
            e["parallax_A_transform_scrolled"] = pg.evaluate("getComputedStyle(document.querySelector('.art__a')).transform")
            e["day_stick_position"] = pg.evaluate("getComputedStyle(document.querySelector('.day__stick')).position")
            pg.evaluate("document.querySelector('[data-day]').scrollIntoView({behavior:'instant'})"); pg.wait_for_timeout(300)
            e["reveals_hidden"] = pg.evaluate("[...document.querySelectorAll('.reveal')].filter(e=>getComputedStyle(e).opacity!=='1').length")
            e["day_all_text_visible"] = pg.evaluate("[...document.querySelectorAll('.day__more p')].every(p=>p.getBoundingClientRect().height>0)")
            e["hover_transition_btn"] = pg.evaluate("getComputedStyle(document.querySelector('.btn')).transitionDuration")
            pg.click("label.seg__opt:has(input[value=adapt])"); pg.wait_for_timeout(300); e["pace_choice_still_works"] = pg.get_attribute("html", "data-pace"); e["phase_after_choice"] = pg.get_attribute("html", "data-phase")
            pg.evaluate("scrollTo({top:0,behavior:'instant'})"); pg.wait_for_timeout(300)
            pg.screenshot(path=f"{OUT}/d-reduced-{w}.png")
            if w == 1280:
                pg.evaluate("document.querySelector('[data-day]').scrollIntoView({behavior:'instant'})"); pg.wait_for_timeout(300); pg.screenshot(path=f"{OUT}/d-reduced-day-1280.png")
            rm[w] = e; ctx.close()
        ch["reduced_motion"] = rm
        # hover states (fine pointer)
        ctx = b.new_context(viewport={"width": 1280, "height": 800}); pg = ctx.new_page(); pg.goto(URL, wait_until="networkidle"); pg.wait_for_timeout(1200)
        pg.hover(".hero__actions .btn--accent"); pg.wait_for_timeout(700); pg.screenshot(path=f"{OUT}/d-hover-button-1280.png", clip={"x": 0, "y": 380, "width": 700, "height": 160})
        pg.evaluate("document.getElementById('facilitators').scrollIntoView({behavior:'instant'})"); pg.wait_for_timeout(1200)
        pg.evaluate("window.scrollBy(0,320)"); pg.wait_for_timeout(1000)
        pg.hover(".person--a"); pg.wait_for_timeout(1000); pg.screenshot(path=f"{OUT}/d-hover-card-1280.png")
        ctx.close(); report["checks"] = ch; b.close()
    json.dump(report, open(f"{OUT}/qa-d.json", "w"), indent=1)
    S = {}
    for w, _ in SIZES:
        r = report[w]; S[w] = dict(hscroll=r["hscroll_px"], tap_small=len(r["tap_small"]), axe_violations=len(r["axe"]["violations"]), console_errors=len(r["errors"]), external=len(r["external_requests"]), submit_requests=len(r["requests_after_submit"]), done=r["done_visible"], focus_no_ring=len(r["focus_without_ring"]), focus_stops=r["focus_stops"], summary_focused=r["summary_focused"], empty_errors=len(r["empty_submit_errors"]))
    print(json.dumps(S, indent=1)); print(json.dumps(report["checks"], indent=1)[:6000])
