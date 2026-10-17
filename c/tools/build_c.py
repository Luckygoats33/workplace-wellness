import re
b=open('/workspace/workplace-wellness-site/b/index.html').read()
faq=b[b.index('<div class="tabs" data-tabs>'):b.index('<div class="faq__aside')].rstrip()
form=b[b.index('<form class="form"'):b.index('</form>')+7].replace('autocomplete="work email"','autocomplete="email"')
form=re.sub(r' <span class="btn__arrow" aria-hidden="true">→</span>','',form).replace('Plan Your Team Experience','Plan your team experience')
def mark(cls='mark',label=None):
    a=f'role="img" aria-label="{label}"' if label else 'aria-hidden="true" focusable="false"'
    return f'<svg class="{cls}" viewBox="0 0 56 40" {a}><path class="mark__echo" d="M4 10C8 10 9 36 15 36S22 16 28 16S35 36 41 36S48 10 52 10" fill="none" stroke-width="1.6" stroke-linecap="round"/><path class="mark__main" d="M4 5C8 5 9 32 15 32S22 11 28 11S35 32 41 32S48 5 52 5" fill="none" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
def ring(extra=''):
    return f'<div class="ring {extra}" aria-hidden="true"><i class="ring__o3"></i><i class="ring__o2"></i><i class="ring__core"></i></div>'
def ico(k):
    return {'join':'<circle cx="14" cy="14" r="9" fill="currentColor"/>',
     'adapt':'<circle cx="14" cy="14" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 5.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/>',
     'observe':'<circle cx="14" cy="14" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/>',
     'out':'<circle cx="14" cy="14" r="8.5" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3.6"/>'}[k]
def svgi(k): return f'<svg class="pico" viewBox="0 0 28 28" aria-hidden="true" focusable="false">{ico(k)}</svg>'
PACES=[('join','Join in','Follow along with the group.'),('adapt','Adapt','Do a smaller, seated or modified version.'),('observe','Observe','Watch and listen. That still counts.'),('out','Step out','Take a break whenever you like.')]
radios=''.join(f'<label class="seg__opt"><input type="radio" name="pace" value="{k}" data-pace-radio{" checked" if k=="join" else ""}><span class="seg__face">{svgi(k)}<span>{n}</span></span></label>' for k,n,_ in PACES)
cards=''.join(f'<li class="pcard" data-pcard="{k}">{svgi(k)}<h3>{n}</h3><p>{d}</p><button class="btn btn--ghost btn--sm" type="button" data-pace-set="{k}" aria-pressed="{"true" if k=="join" else "false"}">Use this pace<span class="sr-only"> on this page: {n}</span></button></li>' for k,n,d in PACES)
html=open('/workspace/workplace-wellness-site/c/tools/template.html').read()
for k,v in {'{{MARK_HEAD}}':mark('mark'),'{{MARK_FOOT}}':mark('mark'),'{{MARK_DONE}}':mark('mark mark--lg','Flowing W mark (placeholder)'),'{{RING_HERO}}':ring(),'{{RING_MINI}}':ring('ring--sm'),'{{RADIOS}}':radios,'{{CARDS}}':cards,'{{FAQ}}':faq,'{{FORM}}':form}.items(): html=html.replace(k,v)
open('/workspace/workplace-wellness-site/c/index.html','w').write(html)
print(len(html))
