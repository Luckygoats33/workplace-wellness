#!/usr/bin/env python3
"""Assemble the GitHub Pages tree (noindex preview) into an output dir.
Root = d/ (flagship, no photos/ or tools/), baseline -> /baseline/, a,b,c -> /a /b /c.
Excludes screenshots/, tools/, photo originals. Usage: build_pages.py OUTDIR"""
import shutil, sys, pathlib, re
src = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
ign = shutil.ignore_patterns('photos', 'tools', '__pycache__')
shutil.copytree(src/'d', out, ignore=ign, dirs_exist_ok=True)
for name in ('a', 'b', 'c'):
    shutil.copytree(src/name, out/name, ignore=ign)
base = out/'baseline'; base.mkdir()
for f in ('index.html', 'favicon.svg', 'robots.txt'):
    shutil.copy(src/f, base/f)
shutil.copytree(src/'assets', base/'assets')
p = out/'index.html'; h = p.read_text()
h = re.sub(r'(<aside class="preview-bar"[^>]*>).*?(</aside>)',
  r'\1Preview, form not connected. Design preview only; nothing on this page is live.\2', h, count=1, flags=re.S)
p.write_text(h)
(out/'.nojekyll').write_text('')
