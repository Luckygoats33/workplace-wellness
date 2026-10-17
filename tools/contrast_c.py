"""Measured WCAG contrast for direction c/. Walks every visible text element in several states, resolves effective opaque background
by walking ancestors, computes ratio programmatically. Also non-text pairs (input borders, focus ring, active segment).
Usage: python3 tools/contrast_c.py  (needs http.server on 8768). Writes screenshots/contrast-c.json"""
import json
from playwright.sync_api import sync_playwright
URL="http://127.0.0.1:8768/"; OUT="/workspace/workplace-wellness-site/screenshots/contrast-c.json"
JS = r"""() => {
 const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};
 const over=(f,b)=>({r:f.r*f.a+b.r*(1-f.a),g:f.g*f.a+b.g*(1-f.a),b:f.b*f.a+b.b*(1-f.a),a:1});
 const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
 const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
 const hex=c=>'#'+[c.r,c.g,c.b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('').toUpperCase();
 const bgOf=el=>{let layers=[];for(let e=el;e;e=e.parentElement){const cs=getComputedStyle(e);const bg=parse(cs.backgroundColor);if(cs.backgroundImage!=='none'&&e!==document.body&&!e.matches('.ring__core'))layers.push('IMG');if(bg&&bg.a>0){layers.push(bg);if(bg.a===1)break;}}
   let base={r:255,g:255,b:255,a:1};if(layers.length&&layers[layers.length-1].a<1&&!layers.includes('IMG')){}
   for(let i=layers.length-1;i>=0;i--){if(layers[i]==='IMG')return null;base=over(layers[i],base);}return base;};
 const rows={};const bad=[];
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 let n;while(n=walker.nextNode()){if(!n.nodeValue.trim())continue;const el=n.parentElement;if(el.closest('script,style,noscript,.sr-only,[hidden]'))continue;
  const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none')continue;const r=el.getBoundingClientRect();if(!r.width||!r.height)continue;
  if(el.closest('[hidden]'))continue;
  let fg=parse(cs.color);const bg=bgOf(el);if(!bg){bad.push('image bg: '+el.className);continue}
  fg=over(fg,bg);const cr=ratio(fg,bg);const px=parseFloat(cs.fontSize),w=parseInt(cs.fontWeight);const large=px>=24||(px>=18.66&&w>=700);
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
 add('segmented option border (--edge) on white','--edge','--surface',3);
 add('segmented option border (--edge) on tint panel','--edge','--tint',3);
 add('error border/text (--err) on white','--err','--surface',3);
 add('mark main stroke on bg','--plum','--bg',3);
 const ph=getComputedStyle(document.querySelector('#f-date'),'::placeholder').color;pairs.push({pair:'placeholder on white',a:ph,b:'#FFFFFF',ratio:ratio(parse(ph),{r:255,g:255,b:255}),need:4.5});
 pairs.push({pair:'logo echo stroke #A87C9C on bg #FBFAF8 (decorative secondary stroke)',a:'#A87C9C',b:'#FBFAF8',ratio:ratio(hx('#A87C9C'),hx('#FBFAF8')),need:3});
 return pairs;}"""
res={}
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    for w in (390,1280):
        pg=b.new_page(viewport={"width":w,"height":900}); pg.goto(URL,wait_until="networkidle")
        pg.evaluate("document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-in'))"); pg.wait_for_timeout(900)
        states={}
        states["default"]=pg.evaluate(JS)
        pg.evaluate("document.querySelectorAll('details.qa').forEach(d=>d.open=true)"); pg.click("#tab-attendees"); pg.evaluate("document.querySelectorAll('details.qa').forEach(d=>d.open=true)")
        states["faq_attendees_open"]=pg.evaluate(JS); pg.click("#tab-buyers")
        pg.click("#inquiry-form button[type=submit]"); pg.wait_for_timeout(200)
        states["form_errors"]=pg.evaluate(JS)
        pg.fill("#f-name","A");pg.fill("#f-company","B");pg.fill("#f-email","a@b.co");pg.select_option("#f-type",index=1);pg.select_option("#f-size",index=1)
        pg.click("#inquiry-form button[type=submit]"); pg.wait_for_timeout(200)
        states["form_done"]=pg.evaluate(JS)
        if w==1280: res["nontext"]=pg.evaluate(NONTEXT)
        res[w]=states; pg.close()
    b.close()
allrows={}
for w in (390,1280):
    for st,v in res[w].items():
        for r in v["rows"]: allrows[(r["fg"],r["bg"],r["large"])]=r
        if v["bad"]: res.setdefault("skipped",[]).extend(v["bad"])
table=sorted(allrows.values(),key=lambda r:r["ratio"])
low=table[0]; fails=[r for r in table if r["ratio"]<r["need"]]
nt=res["nontext"]; ntfail=[x for x in nt if x["ratio"]<x["need"]]
out={"lowest_text_ratio":low,"text_pairs_unique":len(table),"text_failures":fails,"text_table":table,"nontext":nt,"nontext_failures":ntfail,"skipped":res.get("skipped",[])}
json.dump(out,open(OUT,"w"),indent=1)
print("unique text pairs",len(table),"lowest",low["ratio"],low["fg"],"on",low["bg"],low["example"],"| failures",len(fails),"| nontext lowest",min(x["ratio"] for x in nt),"nontext failures",len(ntfail))
for r in table[:12]: print(r["ratio"],r["fg"],r["bg"],r["large"],r["count"],r["example"])
