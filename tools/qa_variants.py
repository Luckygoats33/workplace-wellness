"""QA for directions a/ b/ c/ (this file) and d/ (delegates to tools/qa_d.py, port 8769, 7 widths, pinned stage, pace, reduced motion). Usage: python3 tools/qa_variants.py a|b|c|d   (serves nothing: expects http.server on 8766 (a) / 8767 (b)).
Needs playwright + system chrome + axe at /tmp/axe/axe.min.js. Writes screenshots/ and screenshots/qa-<dir>.json"""
import json, sys
from playwright.sync_api import sync_playwright
D = sys.argv[1]
if D == 'd':
    import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import qa_d; qa_d.run(); sys.exit(0)
PORT = {'a': 8766, 'b': 8767, 'c': 8768}[D]
URL = f"http://127.0.0.1:{PORT}/"; OUT = "/workspace/workplace-wellness-site/screenshots"
AXE = open("/tmp/axe/axe.min.js").read(); report = {}
TAP = """() => {const sel='a[href],button,input:not([type=hidden]),select,textarea,summary,[role=tab]';const bad=[];
 for (const el of document.querySelectorAll(sel)) {const r=el.getBoundingClientRect();const cs=getComputedStyle(el);
  if (r.width===0||r.height===0||cs.visibility==='hidden') continue;
  if (el.classList.contains('skip-link')) continue;
  if (el.type==='radio'){ const p=el.parentElement.getBoundingClientRect(); if(p.width>=44&&p.height>=44) continue; }
  if (r.width<44||r.height<44) bad.push({tag:el.tagName,text:(el.innerText||el.id||el.name||'').trim().slice(0,40),w:Math.round(r.width),h:Math.round(r.height)});}
 return bad;}"""
OVER = """() => {const vw=document.documentElement.clientWidth;const out=[];
 for (const el of document.querySelectorAll('body *')) {const r=el.getBoundingClientRect();
  if (r.width && r.right>vw+1 && getComputedStyle(el).position!=='fixed' && !el.closest('svg')) out.push(el.tagName+'.'+String(el.className).slice(0,30)+' right='+Math.round(r.right));}
 return {scrollWidth:document.documentElement.scrollWidth,clientWidth:vw,bodyScrollWidth:document.body.scrollWidth,over:out.slice(0,10)};}"""
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    for w, h in [(390, 844), (768, 1024), (1280, 800)]:
        ctx = b.new_context(viewport={"width": w, "height": h}); pg = ctx.new_page()
        reqs = []; pg.on("request", lambda r: reqs.append((r.method, r.url)))
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: m.type == "error" and errs.append(m.text))
        pg.goto(URL, wait_until="networkidle"); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(600)
        pg.screenshot(path=f"{OUT}/{D}-{w}-fold.png")
        H = pg.evaluate("document.body.scrollHeight")
        for yy in range(0, H, 500): pg.evaluate(f"window.scrollTo(0,{yy})"); pg.wait_for_timeout(50)
        pg.evaluate("document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-in'));window.scrollTo(0,0)"); pg.wait_for_timeout(1000)
        pg.screenshot(path=f"{OUT}/{D}-{w}.png", full_page=True)
        r = {"external_requests": [u for _, u in reqs if not u.startswith(URL)]}
        # overflow measured at several breath/scroll moments
        ov = []
        for t in range(5): ov.append(pg.evaluate(OVER)); pg.wait_for_timeout(2300)
        r["overflow"] = max(ov, key=lambda o: o["scrollWidth"]); r["overflow_samples"] = [o["scrollWidth"] for o in ov]
        r["tap_small"] = pg.evaluate(TAP)
        pg.add_script_tag(content=AXE)
        r["axe"] = pg.evaluate("""async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']});return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,nodes:v.nodes.slice(0,4).map(n=>n.target.join(' ')+' :: '+(n.failureSummary||'').slice(0,200))})),incomplete:r.incomplete.map(v=>v.id+' x'+v.nodes.length)}}""")
        if w == 390:
            pg.click("[data-nav-toggle]"); pg.wait_for_timeout(400)
            pg.screenshot(path=f"{OUT}/{D}-menu-open-390.png")
            r["menu_expanded"] = pg.get_attribute("[data-nav-toggle]", "aria-expanded"); r["tap_small_menu"] = pg.evaluate(TAP)
            pg.keyboard.press("Escape")
        # keyboard: tab through first 40 stops, require a visible focus indicator on each
        pg.evaluate("window.scrollTo(0,0)"); pg.evaluate("document.activeElement&&document.activeElement.blur()")
        noring = []
        for i in range(45):
            pg.keyboard.press("Tab"); pg.wait_for_timeout(30)
            info = pg.evaluate("""()=>{const e=document.activeElement;if(!e||e===document.body)return null;const cs=getComputedStyle(e);let o=cs.outlineStyle!=='none'&&parseFloat(cs.outlineWidth)>=2;
              if(!o&&e.type==='radio'){const f=e.nextElementSibling;const c2=f&&getComputedStyle(f);o=c2&&c2.outlineStyle!=='none'&&parseFloat(c2.outlineWidth)>=2;}
              return {ok:o,tag:e.tagName,t:(e.innerText||e.id||e.name||'').trim().slice(0,30)}}""")
            if info and not info["ok"]: noring.append(info)
        r["focus_without_ring"] = noring
        n0 = len(reqs)
        pg.evaluate("window.scrollTo(0,document.body.scrollHeight)")
        pg.click("#inquiry-form button[type=submit]"); pg.wait_for_timeout(300)
        r["empty_submit_errors"] = pg.evaluate("[...document.querySelectorAll('[data-error-list] li')].map(l=>l.innerText)")
        r["summary_focused"] = pg.evaluate("document.activeElement.matches('[data-error-summary]')")
        r["invalid_fields"] = pg.evaluate("[...document.querySelectorAll('[aria-invalid=true]')].map(e=>e.id)")
        if w in (390, 1280): pg.locator("[data-error-summary]").scroll_into_view_if_needed(); pg.screenshot(path=f"{OUT}/{D}-form-errors-{w}.png")
        pg.fill("#f-name", "Alex Test"); pg.fill("#f-company", "Example Co"); pg.fill("#f-email", "not-an-email")
        pg.select_option("#f-type", index=1); pg.select_option("#f-size", index=3); pg.fill("#f-goals", "Something everyone can join. One attendee has a diagnosis of X.")
        pg.click("#inquiry-form button[type=submit]"); pg.wait_for_timeout(300)
        r["bad_email_and_health_errors"] = pg.evaluate("[...document.querySelectorAll('[data-error-list] li')].map(l=>l.innerText)")
        pg.fill("#f-email", "alex@example.com"); pg.fill("#f-goals", "A break from presentations and time to connect.")
        pg.click("#inquiry-form button[type=submit]"); pg.wait_for_timeout(400)
        r["done_visible"] = pg.is_visible("[data-done]"); r["form_hidden"] = not pg.is_visible("[data-form]")
        r["requests_after_submit"] = reqs[n0:]; r["url_after"] = pg.url
        if w in (390, 1280): pg.locator("[data-done]").scroll_into_view_if_needed(); pg.wait_for_timeout(200); pg.screenshot(path=f"{OUT}/{D}-form-success-{w}.png")
        r["errors"] = errs; report[w] = r; ctx.close()
    # interaction checks
    ctx = b.new_context(viewport={"width": 1280, "height": 800}); pg = ctx.new_page(); pg.goto(URL, wait_until="networkidle")
    if D == 'c':
        tf = "getComputedStyle(document.querySelector('.breath .ring__core')).transform"
        pace = {}
        for v in ('join', 'adapt', 'observe', 'out'):
            pg.evaluate("document.querySelector('.breath').scrollIntoView()")
            pg.click(f"label.seg__opt:has(input[value={v}])"); pg.wait_for_timeout(200)
            if v == 'observe': pg.wait_for_timeout(5000)
            t1 = pg.evaluate(tf); pg.wait_for_timeout(2500); t2 = pg.evaluate(tf); pg.wait_for_timeout(2500); t3 = pg.evaluate(tf)
            pace[v] = {"html_pace": pg.get_attribute("html", "data-pace"), "phase": pg.get_attribute("html", "data-phase"), "ring_transform_samples": [t1, t2, t3], "ring_moves": len({t1, t2, t3}) > 1,
                       "reveal_y": pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--rev-y')"), "status": pg.inner_text("[data-pace-desc]")}
            if v == 'out': pg.screenshot(path=f"{OUT}/c-pace-out-1280.png")
            if v == 'adapt': pg.screenshot(path=f"{OUT}/c-pace-adapt-1280.png")
        report["pace"] = pace
        # arrow-key navigation on the radios + section buttons
        pg.click("label.seg__opt:has(input[value=join])"); pg.keyboard.press("ArrowRight"); report["arrow_right_pace"] = pg.get_attribute("html", "data-pace")
        pg.evaluate("document.querySelector('[data-pace-set=observe]').scrollIntoView({block:'center'})"); pg.click("[data-pace-set=observe]")
        report["section_button_pace"] = pg.get_attribute("html", "data-pace"); report["radio_synced"] = pg.evaluate("document.querySelector('[data-pace-radio]:checked').value")
    elif D == 'a':
        pg.evaluate("document.querySelector('#choice-title').scrollIntoView()"); pg.wait_for_timeout(300)
        pg.click("[data-pace-set=observe]"); report["pace_after_click"] = pg.get_attribute("html", "data-pace")
        pg.evaluate("document.querySelector('[data-pace-set=out]').scrollIntoView({block:'center'})"); pg.wait_for_timeout(1800)
        report["pace_after_scroll_to_out"] = pg.get_attribute("html", "data-pace")
        pg.screenshot(path=f"{OUT}/a-pace-1280.png")
        pg.click("[data-field-toggle]"); report["field_toggle_pressed"] = pg.get_attribute("[data-field-toggle]", "aria-pressed")
    else:
        pg.click("label.dock__opt:nth-of-type(3)"); report["pace_after_dock_observe"] = pg.get_attribute("html", "data-pace")
        pg.click("label.dock__opt:nth-of-type(4)"); report["pace_after_dock_out"] = pg.get_attribute("html", "data-pace")
        report["blob_anim_in_out"] = pg.evaluate("getComputedStyle(document.querySelector('.blobs i')).animationName")
        pg.click("label.dock__opt:nth-of-type(1)")
        box = pg.locator("[data-orb]").bounding_box(); pg.mouse.move(box["x"]+box["width"]/2, box["y"]+box["height"]/2); pg.mouse.down(); pg.wait_for_timeout(300)
        report["orb_held_class"] = pg.evaluate("document.querySelector('[data-orb]').classList.contains('is-held')"); pg.mouse.up()
        report["orb_released"] = pg.evaluate("!document.querySelector('[data-orb]').classList.contains('is-held')")
        pg.focus("[data-orb]"); pg.keyboard.down("Space"); pg.wait_for_timeout(100); report["orb_key_held"] = pg.evaluate("document.querySelector('[data-orb]').classList.contains('is-held')"); pg.keyboard.up("Space")
    ctx.close()
    if D == 'c':
        sweep = {}
        for w in range(320, 1441, 40):
            ctx = b.new_context(viewport={"width": w, "height": 800}); pg = ctx.new_page(); pg.goto(URL, wait_until="load"); pg.wait_for_timeout(250)
            o = pg.evaluate(OVER); sweep[w] = {"scrollWidth": o["scrollWidth"], "clientWidth": o["clientWidth"], "over": o["over"][:3]}; ctx.close()
        report["overflow_sweep_320_1440"] = sweep
        report["overflow_sweep_max_excess"] = max(v["scrollWidth"] - v["clientWidth"] for v in sweep.values())
    # reduced motion
    ctx = b.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce"); pg = ctx.new_page(); pg.goto(URL, wait_until="networkidle"); pg.wait_for_timeout(500)
    rm = {"reveal_opacity": pg.evaluate("getComputedStyle(document.querySelector('.reveal')).opacity"), "reveal_transform": pg.evaluate("getComputedStyle(document.querySelector('.reveal')).transform")}
    rm["any_running_animation"] = pg.evaluate("document.getAnimations().filter(a=>a.playState==='running').length")
    rm["data_pace"] = pg.get_attribute("html", "data-pace")
    if D == 'c':
        tf = "getComputedStyle(document.querySelector('.breath .ring__core')).transform"
        t1 = pg.evaluate(tf); pg.wait_for_timeout(4500); t2 = pg.evaluate(tf)
        rm["ring_static"] = (t1 == t2); rm["data_phase"] = pg.get_attribute("html", "data-phase"); rm["cue_text"] = pg.inner_text("[data-cue]")
        rm["ring_transition"] = pg.evaluate("getComputedStyle(document.querySelector('.ring__core')).transitionDuration")
        pg.click("label.seg__opt:has(input[value=adapt])"); rm["pace_choice_still_works"] = pg.get_attribute("html", "data-pace"); rm["phase_after_choice"] = pg.get_attribute("html", "data-phase")
    elif D == 'a':
        v1 = pg.evaluate("getComputedStyle(document.querySelector('[data-kin]')).getPropertyValue('--kw')"); pg.wait_for_timeout(2500)
        v2 = pg.evaluate("getComputedStyle(document.querySelector('[data-kin]')).getPropertyValue('--kw')")
        rm["kinetic_word_static"] = (v1 == v2); rm["field_toggle_display"] = pg.evaluate("getComputedStyle(document.querySelector('[data-field-toggle]')).display")
        c1 = pg.evaluate("document.querySelector('[data-field]').toDataURL().length"); pg.wait_for_timeout(1500); c2 = pg.evaluate("document.querySelector('[data-field]').toDataURL().length")
        rm["canvas_static"] = (c1 == c2)
    else:
        rm["orb_core_transition"] = pg.evaluate("getComputedStyle(document.querySelector('.orb__core')).transitionDuration"); rm["orb_core_animation"] = pg.evaluate("getComputedStyle(document.querySelector('.orb__core')).animationName")
    pg.screenshot(path=f"{OUT}/{D}-reduced-390.png"); report["reduced_motion"] = rm; ctx.close(); b.close()
json.dump(report, open(f"{OUT}/qa-{D}.json", "w"), indent=1)
S = {}
for w in (390, 768, 1280):
    r = report[w]; S[w] = dict(hscroll=r["overflow"]["scrollWidth"] - r["overflow"]["clientWidth"], tap_small=len(r["tap_small"]), axe_violations=len(r["axe"]["violations"]), console_errors=len(r["errors"]), external=len(r["external_requests"]), submit_requests=len(r["requests_after_submit"]), done=r["done_visible"], focus_no_ring=len(r["focus_without_ring"]))
print(json.dumps(S, indent=1)); print(json.dumps({k: v for k, v in report.items() if not isinstance(k, int)}, indent=1))
