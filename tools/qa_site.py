import json, sys
from playwright.sync_api import sync_playwright
URL="http://127.0.0.1:8765/"
OUT="/workspace/workplace-wellness-site/screenshots"
AXE=open("/tmp/axe/axe.min.js").read()
report={}
TAP_JS="""() => {
 const sel='a[href],button,input,select,textarea,summary,[role=tab]';
 const bad=[];
 for (const el of document.querySelectorAll(sel)) {
   const r=el.getBoundingClientRect(); const cs=getComputedStyle(el);
   if (r.width===0||r.height===0||cs.visibility==='hidden') continue;
   if (el.closest('.skip-link')||el.classList.contains('skip-link')) continue;
   if (r.width<44||r.height<44) bad.push({tag:el.tagName,text:(el.innerText||el.id||el.name||'').trim().slice(0,40),w:Math.round(r.width),h:Math.round(r.height)});
 }
 return bad;}"""
OVER_JS="""() => {
 const vw=document.documentElement.clientWidth; const out=[];
 for (const el of document.querySelectorAll('body *')) { const r=el.getBoundingClientRect();
   if (r.width && r.right>vw+1 && getComputedStyle(el).position!=='fixed') { if(!el.closest('svg')||el.tagName==='svg') out.push(el.tagName+'.'+el.className.toString().slice(0,30)+' right='+Math.round(r.right)); } }
 return {sw:document.documentElement.scrollWidth, cw:vw, bodySW: document.body.scrollWidth, over:out.slice(0,15)};}"""
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    for w,h in [(390,844),(768,1024),(1280,800)]:
        ctx=b.new_context(viewport={"width":w,"height":h}, device_scale_factor=1)
        pg=ctx.new_page()
        reqs=[]
        pg.on("request", lambda r: reqs.append((r.method, r.url)))
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: m.type=="error" and errs.append(m.text))
        pg.goto(URL, wait_until="networkidle")
        pg.evaluate("document.fonts.ready")
        # scroll through to trigger reveals
        H=pg.evaluate("document.body.scrollHeight")
        for yy in range(0,H,500): pg.evaluate(f"window.scrollTo(0,{yy})"); pg.wait_for_timeout(60)
        pg.evaluate("document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-in'));window.scrollTo(0,0)")
        pg.wait_for_timeout(1200)
        pg.screenshot(path=f"{OUT}/full-{w}.png", full_page=True)
        pg.screenshot(path=f"{OUT}/fold-{w}.png")
        r={}
        r["overflow"]=pg.evaluate(OVER_JS)
        r["tap_small"]=pg.evaluate(TAP_JS)
        pg.add_script_tag(content=AXE)
        ax=pg.evaluate("""async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21aa','best-practice']});return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,nodes:v.nodes.slice(0,4).map(n=>n.target.join(' ')+' :: '+(n.failureSummary||'').slice(0,160))}))}""")
        r["axe"]=ax
        if w==390:
            pg.click("[data-nav-toggle]"); pg.wait_for_timeout(500)
            pg.screenshot(path=f"{OUT}/menu-open-390.png")
            r["menu_expanded"]=pg.get_attribute("[data-nav-toggle]","aria-expanded")
            r["tap_small_menu"]=pg.evaluate(TAP_JS)
            pg.keyboard.press("Escape")
        # form tests
        n0=len(reqs)
        pg.click("#inquiry-form button[type=submit]"); pg.wait_for_timeout(300)
        r["empty_submit_errors"]=pg.evaluate("[...document.querySelectorAll('[data-error-list] li')].map(l=>l.innerText)")
        r["summary_focused"]=pg.evaluate("document.activeElement.matches('[data-error-summary]')")
        r["invalid_fields"]=pg.evaluate("[...document.querySelectorAll('[aria-invalid=true]')].map(e=>e.id)")
        if w==390:
            pg.locator("[data-error-summary]").scroll_into_view_if_needed()
            pg.screenshot(path=f"{OUT}/form-errors-390.png", full_page=False)
        pg.fill("#f-name","Alex Test"); pg.fill("#f-company","Example Co"); pg.fill("#f-email","not-an-email")
        pg.select_option("#f-type", index=1); pg.select_option("#f-size", index=3)
        pg.fill("#f-goals","Something everyone can join. One attendee has a diagnosis of X.")
        pg.click("#inquiry-form button[type=submit]"); pg.wait_for_timeout(300)
        r["bad_email_and_health_errors"]=pg.evaluate("[...document.querySelectorAll('[data-error-list] li')].map(l=>l.innerText)")
        pg.fill("#f-email","alex@example.com"); pg.fill("#f-goals","A break from presentations and time to connect.")
        pg.click("#inquiry-form button[type=submit]"); pg.wait_for_timeout(400)
        r["done_visible"]=pg.is_visible("[data-done]")
        r["form_hidden"]=not pg.is_visible("[data-form]")
        r["requests_after_submit"]=[x for x in reqs[n0:]]
        r["url_after"]=pg.url
        if w in (390,1280):
            pg.locator("[data-done]").scroll_into_view_if_needed(); pg.wait_for_timeout(200)
            pg.screenshot(path=f"{OUT}/form-success-{w}.png")
        r["errors"]=errs
        report[w]=r
        ctx.close()
    # reduced motion check
    ctx=b.new_context(viewport={"width":390,"height":844}, reduced_motion="reduce"); pg=ctx.new_page(); pg.goto(URL, wait_until="networkidle")
    report["reduced_motion"]={"dot_anim":pg.evaluate("getComputedStyle(document.querySelector('.p')).animationName"),
      "reveal_opacity":pg.evaluate("getComputedStyle(document.querySelector('.reveal')).opacity"),
      "motion_toggle_display":pg.evaluate("getComputedStyle(document.querySelector('[data-motion-toggle]')).display")}
    ctx.close(); b.close()
json.dump(report, open(f"{OUT}/qa-report.json","w"), indent=1)
print(json.dumps(report, indent=1))
