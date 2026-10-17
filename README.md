# Workplace Wellness by SWG: static site (preview only)

Static HTML/CSS/JS design directions for a Workplace Wellness site by SWG.
**Preview only. Not published, not hosted, and marked `noindex`** (each page carries a noindex meta tag, and `robots.txt` disallows all).

## Directions

| Path | Direction |
| --- | --- |
| `d/` | **FLAGSHIP.** "Quiet Room" elevated. This is the direction to review and build on. |
| `a/` | Breath Field |
| `b/` | Pace Dial |
| `c/` | Quiet Room (base version that `d/` elevates) |
| `/` (`index.html`, `assets/`) | Root baseline |

Other files: `NOTES.md` (design and build notes, measured QA results), `screenshots/` (QA screenshots and JSON reports, including Lighthouse output), `tools/` (QA and build scripts).

## Run

```
cd d && python3 -m http.server 8769
# open http://127.0.0.1:8769/
```

The other directions work the same way. Serve the repo root for the baseline, or serve `a/`, `b/` or `c/`.

## Rebuild `d/`

```
python3 d/tools/build_d.py       # d/tools/template.html + styles.src.css + d.src.js -> d/index.html + minified d/assets/
python3 d/tools/build_photos.py  # builds d/assets/img/* from d/photos/*
```

`build_photos.py` needs Pillow and numpy. It optionally uses opencv-contrib with `EDSR_x2.pb` for super-resolution and falls back to Lanczos without them. Read the scripts for details. `build_d.py` also shells out (it imports `subprocess`), so check it for minifier requirements.

## QA

Start the server on `127.0.0.1:8769` serving `d/` first. For example: `python3 -m http.server 8769 --bind 127.0.0.1 --directory d`.

```
python3 tools/qa_d.py        # also: python3 tools/qa_variants.py d
python3 tools/contrast_d.py
```

- `qa_d.py` needs Python `playwright`, a system Chrome, and axe-core at `/tmp/axe/axe.min.js` (not in the repo). It writes `screenshots/d-*.png` and `screenshots/qa-d.json`. It has a hard-coded output path of `/workspace/workplace-wellness-site/screenshots`, so edit `OUT` if your checkout lives elsewhere.
- `contrast_d.py` uses Playwright to measure WCAG contrast over many UI states. It writes `screenshots/contrast-d.json`. It also has a hard-coded `/workspace/...` output path.
- Lighthouse reports in `screenshots/` were generated with the external `lighthouse` CLI. It is not part of the scripts.
- `tools/build_variants.py`, `qa_variants.py`, `qa_site.py` and `contrast_c.py` cover the a/b/c variants and the baseline.

## Photos are placeholders

The facilitator photos in `d/` are **PLACEHOLDERS pending consent and licences.** They come from third-party sources and must not be used in anything published.

- `photo-candidates/` (the third-party source images) is **intentionally excluded from this repo** via `.gitignore`.
- **Swap point:** replace `d/photos/facilitator-sean.jpg` and `d/photos/facilitator-brandon.jpg`, then run `python3 d/tools/build_photos.py`. This regenerates `d/assets/img/{sean,brandon}-*.{avif,webp}`.
- Note: the current files in `d/photos/` and the derived images in `d/assets/img/` are still placeholder third-party material. Replace them before any publication.

## Content guardrails

- No outcome claims.
- No named employers.
- No testimonials.
- First names only.
