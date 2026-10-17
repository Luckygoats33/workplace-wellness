"""Measured WCAG contrast for direction d/ (adapted from contrast_c.py).
Walks every visible text node, resolves the effective opaque background by compositing ancestor backgrounds (solid colours, and the solid
linear-gradient(c,c) 'sweep' fill used for button hover), computes the ratio programmatically, over many states at 390 and 1280:
default, scrolled/compact header + active nav item, mobile menu open, FAQ both tabs open, form errors, form done, each pace, pinned sample-day steps 1-5,
flat sample-day, and hover states of buttons / nav / tabs / cards / radios. Also non-text pairs (focus ring, input borders, radio dots, ring strokes).
Text over SVG fills (the decorative sample-day stage label) is resolved to the known ring fill. Anything over a real image is reported in 'skipped' (there is none: no text is placed over photos).
Usage: python3 tools/contrast_d.py (needs http.server on 8769). Writes screenshots/contrast-d.json"""
import json
from playwright.sync_api import sync_playwright
URL="http://127.0.0.1:8769/"; OUT="/workspace/workplace-wellness-site/screenshots/contrast-d.json"
JS = r"""(rootSel) => {
 const root=rootSel?document.querySelector(rootSel):document.body; if(!root) return {rows:[],bad:['no root '+rootSel]};
 const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};
 const over=(f,b)=>({r:f.r*f.a+b.r*(1-f.a),g:f.g*f.a+b.g*(1-f.a),b:f.b*f.a+b.b*(1-f.a),a:1});
 const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
 const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
 const hex=c=>'#'+[c.r,c.g,c.b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('').toUpperCase();
 const bgOf=el=>{
   if(el.closest('.day__big')) return {r:0xEB,g:0xDC,b:0xE6,a:1};   // sits on the lit centre ring fill #EBDCE6 (svg fill, not a CSS background)
   let layers=[];
   for(let e=el;e;e=e.parentElement){const cs=getComputedStyle(e);const bg=parse(cs.backgroundColor);const bi=cs.backgroundImage;
     if(bi!=='none'&&e!==document.body&&!e.matches('.ring__core')){
        const g=bi.match(/^linear-gradient\((rgba?\([^)]*\)),\s*(rgba?\([^)]*\))\)$/);
        if(g&&g[1]===g[2]){const w=cs.backgroundSize.split(' ')[0];if(parseFloat(w)>=99){layers.push(parse(g[1]));break;} }
        else if(bi.indexOf('url(')>-1||bi.indexOf('gradient')>-1){ if(!/linear-gradient\((rgba?\([^)]*\)),\s*\1\)/.test(bi)) layers.push('IMG'); }
     }
     if(bg&&bg.a>0){layers.push(bg);if(bg.a===1)break;}}
   let base={r:255,g:255,b:255,a:1};
   for(let i=layers.length-1;i>=0;i--){if(layers[i]==='IMG')return null;base=over(layers[i],base);}return base;};
 const rows={};const bad=[];
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let n;while(n=walker.nextNode()){if(!n.nodeValue.trim())continue;const el=n.parentElement;if(el.closest('script,style,noscript,.sr-only,[hidden]'))continue;
  const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none')continue;const r=el.getBoundingClientRect();if(!r.width||!r.height)continue;
  const bg=bgOf(el);if(!bg){bad.push('image bg: '+el.className);continue}
  let fg=parse(cs.color);fg=over(fg,bg);const cr=ratio(fg,bg);const px=parseFloat(cs.fontSize),w=parseInt(cs.fontWeight);const large=px>=24||(px>=18.66&&w>=700);
  const key=hex(fg)+' on '+hex(bg)+(large?' (large)':'');
  if(!rows[key])rows[key]={fg:hex(fg),bg:hex(bg),ratio:+cr.toFixed(2),large,need:large?3:4.5,count:0,example:(n.nodeValue.trim().slice(0,30)+' <'+el.tagName.toLowerCase()+'.'+String(el.className).split(' ')[0]+'>')};rows[key].count++;}
 return {rows:Object.values(rows),bad};}"""
NONTEXT = r"""() => {
 const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/);const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};
 const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
 const ratio=(a,b)=>{const x=lum(a),y=lum(b);return +((Math.max(x,y)+.05)/(Math.min(x,y)+.05)).toFixed(2)};
 const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
 const hx=h=>({r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16),a:1});
 const c=n=>hx(css(n));const pairs=[];const add=(name,a,b,need)=>pairs.push({pair:name,a:css(a),b:css(b),ratio:ratio(c(a),c(b)),need});
 for(const bg of ['--surface','--bg','--stone','--tint']) add('focus ring (--plum) on '+bg,'--plum',bg,3);
 add('input border (--edge) on white field','--edge','--surface',3);
 add('radio dot / option border (--edge) on white','--edge','--surface',3);
 add('radio dot border (--edge) on checked tint face','--edge','--tint',3);
 add('error border/text (--err) on white','--err','--surface',3);
 add('error text (--err) on error bg','--err','--err-bg',4.5);
 add('mark main stroke on bg','--plum','--bg',3);
 add('FAQ plus/minus icon (--plum) on bg','--plum','--bg',3);
 add('FAQ icon ring border (--edge) on bg','--edge','--bg',3);
 const ph=getComputedStyle(document.querySelector('#f-date'),'::placeholder').color;pairs.push({pair:'placeholder on white',a:ph,b:'#FFFFFF',ratio:ratio(parse(ph),{r:255,g:255,b:255}),need:4.5});
 pairs.push({pair:'decorative: logo echo stroke #A87C9C on bg #FBFAF8 (secondary stroke, not information)',a:'#A87C9C',b:'#FBFAF8',ratio:ratio(hx('#A87C9C'),hx('#FBFAF8')),need:3,decorative:true});
 pairs.push({pair:'decorative: ring hairlines #CDAFC4 on bg (art only, not information)',a:'#CDAFC4',b:'#FBFAF8',ratio:ratio(hx('#CDAFC4'),hx('#FBFAF8')),need:3,decorative:true});
 return pairs;}"""
HOVERS=[".hero__actions .btn--accent",".hero__actions .btn--ghost",".steps__cta .btn--dark",".pcard .btn",".site-nav li a",".site-nav .btn",".tabs__tab:not([aria-selected=true])",".qa summary",".seg__opt",".footer__nav a",".inline-link",".form__foot .btn"]
res={}; hover={}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    for w,h in ((390,844),(1280,800)):
        pg=b.new_page(viewport={"width":w,"height":h}); pg.goto(URL,wait_until="networkidle")
        def settle():
            pg.evaluate("document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-in'))"); pg.wait_for_timeout(1000)
        settle(); states={}
        states["default (join, top of page, header full)"]=pg.evaluate(JS,None)
        pg.evaluate("scrollTo({top:900,behavior:'instant'})"); pg.wait_for_timeout(700)
        states["scrolled: compact header + progress"]=pg.evaluate(JS,"[data-header]")
        pg.evaluate("(()=>{const e=document.getElementById('program');scrollTo({top:e.getBoundingClientRect().top+scrollY+300,behavior:'instant'})})()"); pg.wait_for_timeout(700)
        states["nav active section (Program current)"]=pg.evaluate(JS,"[data-header]")
        if w==390:
            pg.evaluate("scrollTo(0,0)"); pg.click("[data-nav-toggle]"); pg.wait_for_timeout(500)
            states["mobile menu open"]=pg.evaluate(JS,"[data-header]"); pg.keyboard.press("Escape")
        # calm / flat sample day shows all five steps
        pg.evaluate("document.documentElement.setAttribute('data-calm','')"); pg.wait_for_timeout(300)
        states["flat sample day (all 5 steps visible)"]=pg.evaluate(JS,"[data-day]")
        pg.evaluate("document.documentElement.removeAttribute('data-calm')"); pg.wait_for_timeout(300)
        if w==1280:
            PIN="""(fr)=>{const d=document.querySelector('[data-day]');const r=d.getBoundingClientRect();const top=r.top+scrollY;const total=r.height-d.firstElementChild.offsetHeight;scrollTo({top:top-68+total*fr+2,behavior:'instant'})}"""
            for i,fr in enumerate((0.02,0.25,0.45,0.65,0.9)):
                pg.evaluate(PIN,fr); pg.wait_for_timeout(1300); states[f"pinned stage step {i+1}"]=pg.evaluate(JS,"[data-day]")
        for v in ("adapt","observe","out"):
            pg.evaluate("scrollTo({top:0,behavior:'instant'})"); pg.click(f"label.seg__opt:has(input[value={v}])"); pg.wait_for_timeout(500)
            states[f"pace {v}"]=pg.evaluate(JS,".hero__grid")
        pg.click("label.seg__opt:has(input[value=join])"); pg.wait_for_timeout(300)
        pg.evaluate("document.querySelectorAll('details.qa').forEach(d=>d.open=true)")
        states["faq_buyers_open"]=pg.evaluate(JS,"#faq"); pg.click("#tab-attendees"); pg.evaluate("document.querySelectorAll('details.qa').forEach(d=>d.open=true)")
        states["faq_attendees_open"]=pg.evaluate(JS,"#faq"); pg.click("#tab-buyers")
        pg.click("#inquiry-form button[type=submit]"); pg.wait_for_timeout(300)
        states["form_errors"]=pg.evaluate(JS,"#plan")
        pg.fill("#f-name","A");pg.fill("#f-company","B");pg.fill("#f-email","a@b.co");pg.select_option("#f-type",index=1);pg.select_option("#f-size",index=1)
        pg.fill("#f-goals","One attendee has a diagnosis."); pg.click("#inquiry-form button[type=submit]"); pg.wait_for_timeout(300)
        states["form_health_flag"]=pg.evaluate(JS,"#plan")
        pg.fill("#f-goals","A break from presentations."); pg.click("#inquiry-form button[type=submit]"); pg.wait_for_timeout(500)
        states["form_done"]=pg.evaluate(JS,"#plan")
        if w==1280: res["nontext"]=pg.evaluate(NONTEXT)
        res[w]=states
        # hover states (real pointer hover, measured after transitions settle)
        hv={}
        pg.evaluate("document.querySelector('[data-reset]').click()")
        for sel in HOVERS:
            el=pg.query_selector(sel)
            if not el: continue
            try:
                el.scroll_into_view_if_needed(); pg.wait_for_timeout(250)
                if not el.is_visible(): continue
                el.hover(); pg.wait_for_timeout(800)
                tag="hover "+sel
                hv[tag]=pg.evaluate("""(sel)=>{const el=document.querySelector(sel);el.setAttribute('data-hvm','1');return 1}""",sel)
                hv[tag]=pg.evaluate(JS,"[data-hvm]")
                pg.evaluate("document.querySelector('[data-hvm]').removeAttribute('data-hvm')")
            except Exception as ex: hv["ERR "+sel]={"rows":[],"bad":[str(ex)[:80]]}
        for k,v in hv.items(): res[w]["__"+k]=v
        pg.close()
    b.close()
allrows={}; skipped=[]; byState={}
for w in (390,1280):
    for st,v in res[w].items():
        low=min([r["ratio"] for r in v["rows"]] or [99]); byState[f"{w}px | {st}"]={"pairs":len(v["rows"]),"lowest":low}
        for r in v["rows"]:
            k=(r["fg"],r["bg"],r["large"]); r2=dict(r); r2["viewports"]=sorted(set(allrows.get(k,{}).get("viewports",[])+[w])); r2["states"]=sorted(set(allrows.get(k,{}).get("states",[])+[st]))[:4]; allrows[k]=r2
        skipped+=v["bad"]
table=sorted(allrows.values(),key=lambda r:r["ratio"])
low=table[0]; fails=[r for r in table if r["ratio"]<r["need"]]
nt=res["nontext"]; ntfail=[x for x in nt if x["ratio"]<x["need"] and not x.get("decorative")]
out={"lowest_text_ratio":low,"text_pairs_unique":len(table),"states_measured":len(byState),"text_failures":fails,"text_table":table,"by_state":byState,"nontext":nt,"nontext_failures":ntfail,"skipped":sorted(set(skipped))}
json.dump(out,open(OUT,"w"),indent=1)
print("states",len(byState),"unique text pairs",len(table),"lowest",low["ratio"],low["fg"],"on",low["bg"],low["example"],"| failures",len(fails),"| nontext lowest(non-decorative)",min(x["ratio"] for x in nt if not x.get("decorative")),"nontext failures",len(ntfail),"| skipped",len(set(skipped)))
for r in table[:14]: print(r["ratio"],r["need"],r["fg"],r["bg"],r["large"],r["count"],r["example"])
