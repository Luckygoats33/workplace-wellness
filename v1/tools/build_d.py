"""Builds d/index.html from tools/template.html and minifies CSS/JS into assets/. Usage: python3 d/tools/build_d.py"""
import re, os, subprocess
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
t=open(R+'/tools/template.html').read()
def mark(cls):
    return ('<svg class="mark mark--%s" viewBox="0 0 56 40" aria-hidden="true" focusable="false">'
     '<path class="mark__echo" d="M4 10C8 10 9 36 15 36S22 16 28 16S35 36 41 36S48 10 52 10" pathLength="1" fill="none" stroke-width="1.5" stroke-linecap="round"/>'
     '<path class="mark__main" d="M4 5C8 5 9 32 15 32S22 11 28 11S35 32 41 32S48 5 52 5" pathLength="1" fill="none" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>')%cls
ARROW='<svg class="arr" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M3.5 10h12M11 5.5 15.5 10 11 14.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
PICO={'join':'<circle cx="14" cy="14" r="9" fill="currentColor"/>',
 'adapt':'<circle cx="14" cy="14" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 5.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/>',
 'observe':'<circle cx="14" cy="14" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/>',
 'out':'<circle cx="14" cy="14" r="8.5" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3.6"/>'}
t=re.sub(r'\{\{MARK:(\w+)\}\}',lambda m:mark(m.group(1)),t)
t=t.replace('{{ARROW}}',ARROW)
t=re.sub(r'\{\{PICO:(\w+)\}\}',lambda m:'<svg class="pico" viewBox="0 0 28 28" aria-hidden="true" focusable="false">%s</svg>'%PICO[m.group(1)],t)
open(R+'/index.html','w').write(t)
def mincss(s):
    s=re.sub(r'/\*.*?\*/','',s,flags=re.S); s=re.sub(r'\s+',' ',s); s=re.sub(r'\s*([{};,>])\s*',r'\1',s); s=re.sub(r':\s+',':',s); s=s.replace(';}','}')
    return s.strip()
src=open(R+'/tools/styles.src.css').read()
open(R+'/assets/css/styles.css','w').write(mincss(src))
try:
    subprocess.run(['npx','--yes','terser',R+'/tools/d.src.js','-c','-m','-o',R+'/assets/js/d.js'],check=True,capture_output=True)
except Exception as e:
    print('terser unavailable, copying unminified',e); open(R+'/assets/js/d.js','w').write(open(R+'/tools/d.src.js').read())
for f in ('index.html','assets/css/styles.css','assets/js/d.js'): print(f,os.path.getsize(R+'/'+f))
