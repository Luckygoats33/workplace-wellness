# Workplace Wellness by SWG: landing page preview

**Status:** local design preview only. Nothing has been published, deployed, pushed or sent. The inquiry form makes **no network request** (verified in QA).
**Preview:** `cd /workspace/workplace-wellness-site && python3 -m http.server 8765`, then open http://127.0.0.1:8765/ (or open `index.html` directly).

## Files
- `index.html`: single page, semantic HTML, inline SVG art, meta/OG tags, JSON-LD (Organization + Service)
- `assets/css/styles.css`: mobile-first styles, no framework
- `assets/js/main.js`: nav, reveal-on-scroll, hero motion pause, breath pacer, FAQ tabs, form validation (about 9 KB, no dependencies)
- `assets/fonts/`: self-hosted woff2, Latin subset (Bricolage Grotesque, Hanken Grotesk, Instrument Serif Italic; all SIL OFL from Google Fonts)
- `assets/img/logo-mark.svg`, `favicon.svg`: **placeholder** flowing-W mark
- `assets/img/og-image.png`: 1200×630 social card rendered from the page art
- `tools/qa_site.py`: Playwright + axe QA script that produces the screenshots and `screenshots/qa-report.json`
- Page weight: about 41 KB HTML + 34 KB CSS + 9 KB JS + 134 KB fonts. Apart from inline SVG, the only images are two facilitator portraits (about 6–7 KB each, webp).

## Design rationale
- **Concept: "Everyone takes part their way."** The hero art is an original SVG showing a room from above. Rows of people curve around a facilitator. Filled dots join in, light dots adapt, outlined dots observe and two dashed dots have stepped out. A slow wave moves out through the rows, like a shared breath. The image carries the brief's main ideas (participation, choice, the group) without using photos, so it can't suggest a named employer or show unapproved people. The same four states come back as the legend in the "Your pace. Your call." block.
- **Typography:** Bricolage Grotesque, tight-tracked and heavy, gives a confident editorial voice and energy. Instrument Serif Italic is used only for emphasised phrases ("*together*", "*More taking part.*") to add warmth and a premium feel. Hanken Grotesk is the body face for readability. This avoids the generic Inter/Montserrat look.
- **Palette** (a refinement of the suggestion): deep navy-teal `#0B2530` and teal night `#0F3A40` carry the corporate trust. Warm ember `#F08A4B` is the only accent on dark backgrounds and the primary button colour (dark text on ember, 6.4:1). On light backgrounds the warm accent darkens to `#9A4114` (5.9:1 on paper) so it passes AA. Paper `#F5F0E7` and sand are used for light sections, and mint is used as a secondary signal.
- **Layout:** numbered editorial sections (01–07) with big display headlines. Light and dark sections alternate to pace the scroll. Desktop uses split and staggered layouts (two-column activity rows, offset facilitator cards, staggered booking steps). Mobile is a single column built first.
- **Purposeful motion only:** a ribbon draws in, the dots "breathe", sections reveal gently, and there is an optional 3-breath pacer (4 s in, 6 s out) that lets a buyer feel the style. The hero motion has a visible **Pause motion** button (WCAG 2.2.2). `prefers-reduced-motion` turns off all animation and reveals and hides the pause control. QA confirmed this.
- **Compliance in copy:** general wellness education only. There are no outcome, treatment, productivity or burnout claims, no certifications, no stats, testimonials or client logos, and no named employer. Technical terms are explained in plain words ("nervous system: the body's network of brain, nerves and signals…", "breathing practices: paying attention to how you breathe and trying different paces and patterns"). The footer has a disclaimer that this is not medical advice and no outcomes are promised. "Coming later" says plainly that there is no employee login and no vendor commitments.
- **Form:** fields are name, company, work email, event type, audience size (ranges), approximate date, location and goals, with no health fields. The goals hint asks people not to include health information, and a light keyword check flags likely health details. A visible **Preview / Not connected** banner sits above the form. On error, an error summary takes focus, each item links to its field, and inline errors use `aria-invalid` and `aria-describedby`. On success the form is replaced by "Looks good. Nothing was sent." The page also says "Who receives inquiries: to be confirmed".

## What is placeholder / pending
- **Logo:** the flowing-W mark is an original placeholder (labelled in the footer and in the SVG title). The rejected stick-figure-in-circle-and-square is **not** used anywhere.
- **Facilitator photos:** Sean and Brandon now use portraits cropped from the Moderne AER mockup screenshot (`assets/img/facilitator-sean.webp`, `facilitator-brandon.webp`, ~395×316 px). These are **screenshot crops, not originals**: they are soft at 2x display size. **Original high-res photos plus consent for web use are needed before launch.** First names only; logos, "Dr." and surnames were cropped out. The team-stretching image from the 'Wellness in the Workplace' mockup is a concept (not real people) and is not used. Mike has no slot on the page.
- **Names, titles, bios and credentials:** first names only. "Bio: pending approval" and "Credentials & title: pending approval" are shown on the page. The mockups use surnames and "Dr."; I left these out until they are approved.
- **Sample day:** marked "Sample only. Final sequence and timing agreed with facilitators." No durations are stated.
- **Privacy policy:** a footer link placeholder, with "(placeholder, to be added)".
- **Inquiry destination:** not wired up. The form `action` is inert, and JS stops submission and makes no request.
- **SEO and launch items:** `<meta name="robots" content="noindex">` is set on purpose for the preview. `canonical` and `og:url` are missing until the domain is known. `og:image` is a relative path and should become an absolute URL at launch.
- **Preview bar** at the very top: remove at launch.

## Open questions for Will / Dean / Sanni
1. **Assets:** approved photos of Sean, Brandon and Mike (orientation, crop, consent for web use). Full names and titles as they should appear. Approved bios and credential wording. Whether to name their own businesses (the Moderne Athlete and AERFORM mockups) or keep the page SWG-only.
2. **Brand:** final flowing-W logo (SVG), wordmark lock-up, and whether the ember/teal palette fits the wider SWG identity.
3. **Individual bookings:** decide whether employees can book sessions individually. The FAQ currently says "still being decided"; update it once you've chosen.
4. **Inquiry destination:** who receives inquiries (a person or a shared inbox), the tool to use (form service, CRM, email), the reply SLA, and the privacy policy and consent wording to show before launch.
5. **Program details:** whether to publish durations for the half-day and full-day, audience size limits, travel area, and whether pricing should be mentioned at all.
6. **Optional enhancements:** confirm that Mike's wording ("roaming support or an optional booth with practical posture tips") is approved, and whether any other practitioners should be listed by name.
7. **Coming later:** confirm you're comfortable showing the benefits-directory and multi-day ideas publicly at all, even labelled "in exploration".
8. **Venue/FAQ answers:** confirm the typical room and audio-visual needs, and the "wear everyday work clothes" line, with the facilitators.

## QA (run 2026-10-17, local Chrome headless via Playwright)
| Check | 390 px | 768 px | 1280 px |
|---|---|---|---|
| Horizontal scroll (scrollWidth = viewport, no element past the right edge) | pass | pass | pass |
| Tap targets ≥ 44×44 px (all links, buttons, inputs, summaries, tabs; mobile menu open too) | pass | pass | pass |
| axe-core 4.10 (WCAG 2 A/AA, 2.1 AA, best-practice, including color-contrast) | 0 violations | 0 | 0 |
| Empty submit shows 5 required errors, focus moves to the error summary, `aria-invalid` is set | pass | pass | pass |
| Bad email + health keyword in goals are both flagged | pass | pass | pass |
| Valid submit shows the "Nothing was sent" state, **0 network requests**, URL unchanged | pass | pass | pass |
| JS console errors | none | none | none |
| `prefers-reduced-motion: reduce`: no dot animation, reveals visible, pause button hidden | pass (390) | | |

Limits: the contrast check is automated (axe). Text over gradients and SVG art was checked by eye. There has been no manual screen-reader pass (VoiceOver or NVDA) and no testing on a real device or in Safari/Firefox.

## Screenshots
- `screenshots/full-390.png`, `screenshots/full-768.png`, `screenshots/full-1280.png` (full page)
- `screenshots/fold-390.png`, `screenshots/fold-768.png`, `screenshots/fold-1280.png` (first viewport)
- `screenshots/menu-open-390.png` (mobile navigation)
- `screenshots/form-errors-390.png` (validation error state)
- `screenshots/form-success-390.png`, `screenshots/form-success-1280.png` (preview "nothing was sent" state)
- `screenshots/qa-report.json` (raw QA output)

---

# Redesign round 2: two new directions (a/ and b/)

The root build (navy/ember editorial, `index.html`) is untouched and is the baseline. `a/` and `b/` re-use its **content and section structure only** (same 7 sections plus "Ideas for later", same copy, same real Sean/Brandon portraits, same form fields and validation). Each folder is self-contained (own `index.html`, `assets/css/styles.css`, `assets/js/core.js` + `fx.js`, `assets/fonts`, `assets/img`, `assets/favicon.svg`, `robots.txt`). Both are `noindex,nofollow`, robots `Disallow: /`, preview only, local only, nothing deployed or sent.

**Preview:** `python3 -m http.server 8766 --bind 127.0.0.1 --directory a` and `... 8767 ... --directory b` (box-local: http://127.0.0.1:8766/ and http://127.0.0.1:8767/). `python3 tools/build_variants.py` regenerates both `index.html` files from shared content; `python3 tools/qa_variants.py a|b` runs QA.

## Direction A: "Breath Field" (dark, kinetic)
- **Concept:** the whole page breathes. One shared 4 s in / 6 s out breath drives (1) a fixed canvas field of ~70 (mobile) / 150 (desktop) dots that drift, swell toward and away from the viewport centre, and shy away from the pointer; (2) the headline word "together", which widens and thickens with each breath (variable font width + weight axes); (3) the control ring and the "slow breath" sample, which sync to the same phase.
- **Scroll-driven participation:** in "Your pace. Your call." the four choices (Join in / Adapt / Observe / Step out) are buttons. As you scroll each one past mid-screen, the field changes to match: lively filled dots, slower smaller dots, still outlined rings, then dashed rings at rest. Tapping or tabbing to a choice does the same (and wins over scroll for 1.5 s). The experience rows widen their type as they pass mid-screen.
- **Tactile bits:** magnetic hero buttons (fine pointer only), pressed-down chunky buttons, spring-loaded choice cards.
- **Layout rhythm:** oversized uppercase type, outlined section numerals, hard dividers, staircase "sample day" on desktop, staggered facilitators and add-ons.
- **Palette:** blackberry ink `#0F0A0E`, surface `#1C1319`, cream text `#FBF3EE`, muted `#CDBFC4`, acid lime `#D4FF3F`, coral `#FF6B57`. **Fonts (self-hosted woff2, Latin subset, SIL OFL):** Anybody (variable width + weight) for display, Geist for body.
- **Mark:** original flowing W: one continuous wave stroke with a lime echo line and a coral pulse dot (inline SVG, placeholder).
- **Motion safety:** visible "Pause field" button (WCAG 2.2.2); `prefers-reduced-motion` stops the loop and draws one static frame (no field toggle shown, all CSS animation/transitions off, reveals visible); loop also pauses when the tab is hidden.
- **Weight (measured, uncompressed):** HTML 30 KB, CSS 23 KB, JS 17 KB (core 7 + fx 10), fonts 49 KB, portraits 13 KB.

## Direction B: "Pace Dial" (light, soft-tactile)
- **Concept:** the visitor sets the pace of the page. A pill dock fixed at the bottom ("Pace: Join in / Adapt / Observe / Step out", real radio inputs) turns the page's own motion up or down: Join in = drifting light and spring reveals, Adapt = the same at less than half speed, Observe = background and idle motion stop, Step out = everything fully still.
- **Hero interaction:** a big breath orb you **press and hold to breathe in** and release to breathe out (pointer, touch, or Space/Enter held), with a live status line. It is optional and has a plain-text description for screen readers.
- **Scroll-driven bit:** a flowing wave "spine" on the left (desktop, 1180 px and up) is drawn as you scroll, with a yellow bead riding it. Its movement follows the scroll position only, so it is user-driven, not autonomous motion.
- **Layout rhythm:** soft rounded "slabs" in alternating colours (white, lilac, ink, sun, white, lilac, cobalt), pebble-style cards with hard offset shadows that press down, slightly tilted add-ons, zig-zag sample day, pill tabs, a floating pill header.
- **Palette:** periwinkle mist `#E9ECFF`, lilac `#D3D9FF`, ink-indigo `#0F1240`, cobalt `#3342F5`, sun yellow `#FFE45E`, white. **Fonts (self-hosted woff2, Latin subset, SIL OFL):** Unbounded (wide, soft) for display, Onest for body.
- **Mark:** original flowing W as two overlapping soft lobes (cobalt and ink) with a sun-yellow centre bead (inline SVG, placeholder).
- **Motion safety:** with `prefers-reduced-motion`, the dial starts on "Step out", every animation and transition is off, and reveals are visible. The page also stays calm for anyone who picks Step out.
- **Weight (measured, uncompressed):** HTML 36 KB, CSS 28 KB, JS 12 KB (core 7 + fx 5), fonts 45 KB, portraits 13 KB.

## Still placeholder / pending (both directions)
- **Flowing-W marks** (A and B) are original placeholders pending brand approval; no existing logos, no Moderne Athlete / AERFORM marks, no "Dr.".
- **Facilitator portraits** are still the soft screenshot crops from the root build (395×316). Original photos and web-use consent are needed. First names only; bios and credentials say "pending approval". Team-stretching concept image not used.
- **Copy** is unchanged from the baseline and still pending approval (sample day, FAQ, add-ons, "Posture Guy Mike", "ideas for later").
- **Form** validates only; no destination, no network request; privacy policy is a placeholder link; inquiry recipient to be confirmed.
- **Preview bar**, `noindex,nofollow`, robots Disallow: remove/change at launch. No canonical/og tags in a/ or b/.
- **Not done:** no manual screen-reader pass (VoiceOver/NVDA), no real-device, Safari or Firefox testing. Contrast was checked by axe plus eye; text sitting over the A canvas dots is not machine-checkable, so dots are kept dim and sections have translucent dark backing.

## QA for a/ and b/ (Playwright + system Chrome + axe-core)
See `screenshots/qa-a.json` and `screenshots/qa-b.json` (raw) and the summary printed at the end of the round-2 report. Screenshots: `screenshots/a-390.png`, `a-1280.png` (full-page), `a-390-fold.png`, `a-1280-fold.png`, same for `b-`, plus 768 variants, form states, `a-pace-1280.png`, `*-reduced-390.png`, `*-menu-open-390.png`.

### Round-2 QA result (run 2026-10-17, 390 / 768 / 1280; extra width sweep 320 to 1440 for overflow)
Both directions: no horizontal scroll (also at 320/360/600/820/1000/1100/1440), 0 tap targets under 44 px (mobile menu open too), axe-core WCAG 2 A/AA + 2.2 AA + best-practice **0 violations** and 0 non-contrast "incomplete" items, 0 console errors, 0 external requests on load, form: empty submit shows 5 errors and focuses the summary, bad email and health keyword flagged, valid submit shows "Nothing was sent" with **0 network requests**, every one of the first 45 Tab stops shows a visible focus ring. A: pace changes by click and by scroll, pause toggle works. B: dock sets pace, orb works by mouse hold and Space hold. Reduced motion (390): 0 running animations, reveals visible, A canvas and kinetic word static, B starts on "Step out".
Note: axe reports color-contrast as "incomplete" for text over A's canvas (cannot be computed); A uses dim dots and translucent dark backing instead.

---

# Round 3: direction C "Quiet Room" (`c/`): lighter and more professional

Client feedback: lighter, more professional look and fonts. `c/` is self-contained (own `index.html`, `assets/{css,js,fonts,img}`, `robots.txt` Disallow, `noindex,nofollow`). Root, `a/`, `b/` untouched. Preview only; nothing deployed or sent.
**Preview (box-local):** `python3 -m http.server 8768 --bind 127.0.0.1 --directory c` then http://127.0.0.1:8768/ (a/b/baseline stay on 8766/8767/8765).
Rebuild HTML: `python3 c/tools/build_c.py` (template at `c/tools/template.html`; FAQ and form markup are pulled from b/ so copy and validation are identical).

## Concept
Kept: the pace-choice participation idea (Join in / Adapt / Observe / Step out), a redrawn flowing-W mark (inline SVG: one confident stroke plus a thin "echo" stroke, like a breath) and the real Sean/Brandon photos. Changed: white/warm-off-white base, one restrained aubergine accent, tinted bands, lots of whitespace, hairline rules, sans headlines with a single serif-italic word per headline.
- **Breath panel (hero):** a calm 3-ring pulse (4 s in, 6 s out) lives in its own white card. No text sits on or over it; the cue ("Breathe in") is below it.
- **Pace control:** a visible labelled radio group (segmented control) in the hero panel plus plain "Use this pace" buttons in the "Your pace. Your call." section (with its own mini ring). No dock, no hold-only interaction, no orb. Arrow keys work on the radios.
- **What the pace changes:** `html[data-pace]` drives CSS variables. Join in: ring scale .80-1.0, scroll-reveals travel 14 px, cards lift 2 px. Adapt: ring .90-.96, reveals 5 px, 1 px lift. Observe: ring size fixed, only a soft halo fades, reveals fade only. Step out: nothing moves (ring static, reveals instant, no lift). Honest limit: the page has little other motion, so "page motion" means ring, reveal-on-scroll and hover lift.
- `prefers-reduced-motion: reduce`: no cycle, no transitions, reveals visible; the pace choice still works and updates the text.
- Headlines kept short (hero: "A wellness session everyone can join."; two lines at 390).

## Palette (measured; `tools/contrast_c.py`, output `screenshots/contrast-c.json`)
Tokens: bg #FBFAF8, surface #FFFFFF, stone #F3F0EB, tint #F5EEF3, ink #1B2030, muted #505766, plum accent #5A2D52 (hover #3F1D39), edge #7D7885, error #A31D3A on #FDF0F2.
Method: every visible text node, resolved against its effective opaque background, across default, FAQ-open (both tabs), form-error and form-success states at 390 and 1280. 27 unique text pairs; **lowest text ratio 6.36:1** (#505766 on #F5EEF3); 0 failures (AA needs 4.5, or 3 for large). Non-text/other pairs: focus ring plum on bg/white/stone/tint 9.5-10.9:1; input and radio borders 4.29:1 (white) and 3.76:1 (tint); placeholder #6A6F7C on white 5.03:1; error text on white 7.52:1; logo main stroke 10.42:1. Lowest non-text: 3.34:1, the decorative thin "echo" stroke of the logo (#A87C9C on bg; 3:1 is the threshold, it is not information).
| Pair | Ratio |
|---|---|
| muted on tint / stone / bg / white | 6.36 / 6.38 / 6.95 / 7.25 |
| error on error-bg / white | 6.77 / 7.52 |
| plum on tint / stone / bg / white | 9.53 / 9.56 / 10.42 / 10.87 |
| white on plum (buttons, selected segment, tabs) | 10.87 |
| ink on bg / white / stone / tint | 15.53 / 16.21 / 14.26 / 14.20 |
| white on ink button | 16.21 |
Not measured: hover and pressed states other than the ones listed, and the photos (they carry no text).

## Fonts (self-hosted woff2, Latin subset, no runtime requests)
- **Instrument Sans** (variable, wght 400-700, 30 KB): headlines, UI and body. SIL OFL 1.1, from the fontsource npm package.
- **Source Serif 4 Italic** (instanced at one weight 420, ASCII + quotes subset, 11.5 KB): used only for one accent word per heading. SIL OFL 1.1.
- No Anybody/Unbounded. Page weight: index.html 30 KB, CSS 22 KB, JS 10 KB (core.js reused unchanged from b/ + pace.js 3 KB), fonts 42 KB, photos 13 KB; whole `c/` about 140 KB.

## QA (tools/qa_variants.py c, tools/contrast_c.py; 2026-10-17, headless Chrome)
390 / 768 / 1280: no horizontal scroll; 0 tap targets under 44 px; axe-core (wcag2a/aa, 2.1, 2.2 AA, best-practice) 0 violations (1 "incomplete": an empty decorative element); 0 console errors; 0 external requests; every one of the first 45 Tab stops has a visible focus ring; empty submit lists 5 errors and focuses the summary; bad email and health keyword flagged; valid submit shows "Nothing was sent" with 0 requests. Overflow sweep 320 to 1440 step 40: max excess 0 px (an earlier run found the FAQ tabs overflowing at 320; fixed). Pace: ring measured moving for Join in/Adapt and static for Observe/Step out; section buttons and radios stay in sync. Reduced motion: no running animations, ring static, cue static, reveals visible.
Limits: no real device, Safari/Firefox or screen-reader testing; the QA script does not check hover states.
Screenshots: `screenshots/c-390.png`, `c-1280.png` (full), `c-390-fold.png`, `c-1280-fold.png`, `c-768.png`, `c-768-fold.png`, `c-form-errors-{390,1280}.png`, `c-form-success-{390,1280}.png`, `c-menu-open-390.png`, `c-pace-adapt-1280.png`, `c-pace-out-1280.png`, `c-reduced-390.png`, `qa-c.json`, `contrast-c.json`.

## Still placeholder
Flowing-W mark; Sean/Brandon photos are the same low-res crops as a/b (displayed at about native size, still soft on high-density screens; originals and consent needed); bios, credentials, titles, surnames pending approval; sample day; privacy policy; inquiry destination; preview bar; no canonical/og tags.

---

# Direction D: "Quiet Room, flagship" (`d/`)

Preview only, local only, `noindex,nofollow` + robots `Disallow: /`. Root, a/, b/, c/ untouched. Nothing deployed or sent.
**Preview:** `python3 -m http.server 8769 --bind 127.0.0.1 --directory d` → http://127.0.0.1:8769/ . Rebuild: `python3 d/tools/build_d.py` (template.html + styles.src.css + d.src.js → index.html + minified assets). QA: `python3 tools/qa_variants.py d` (delegates to `tools/qa_d.py`), contrast: `python3 tools/contrast_d.py`, Lighthouse: `lighthouse http://127.0.0.1:8769/ --preset=perf`-style mobile defaults.

## Concept
c ("Quiet Room", approved base) elevated: same light palette, type pair, copy and pace concept. New: arched-window photo composition with layered offset frames and breathing hairline rings, a "pace dock" card (visible radios + ring) under the hero copy, sticky/staged sections, a pinned sample-day stage, scroll progress, compact sticky header with active-section state.

## Grid / type
- Fluid gutter `clamp(1.25rem,4.2vw,3rem)`; wrap 1240 (1500 ≥1600, 1560 ≥1800). Hero 3fr/2fr, experience 5/6 sticky split, pace 6/5, formats 12-col bento (7+5), people 2-up (stacked card ≤1439, side-by-side card ≥1440), plan 5/7.
- Display `clamp(2.7rem,1.2rem+4.6vw,5rem)` (5.75rem ≥1600, 6.5rem ≥1800), h2 `clamp(2.05rem,…,4rem)`, lede `clamp(1.0625rem,…,1.3125rem)`; Instrument Sans 600 tight-tracked, Source Serif 4 Italic accent words only. Bespoke layouts at 320/390 (stacked, art side-by-side), 768 (copy over wide art row, horizontal dock, 2-col pace, sticky day head), 1024, 1280, 1440 (horizontal facilitator cards), 1920 (larger wrap + type).

## Photos: SINGLE SWAP POINT (placeholders, pending approval)
- **Sean:** `photo-candidates/sean-1-moderneathlete-about-2500x3750.jpg` (client-approved placeholder). **Brandon:** `photo-candidates/brandon-1-aerform-333x400.jpg` (only size available). Chose the real headshot over the old mockup crop: cleaner, no mockup artefacts; faithful EDSR x2 upscale (opencv dnn_superres, non-generative) then downsample to 541x722 so it reads as a small, masked, duotone portrait. Sizes shipped per person: `*-duo` 541x722, `*-duo-sm` 360x480, `*-color` 541x722 (hover reveal), avif + webp each (about 8–19 KB avif).
- **To swap:** replace `d/photos/facilitator-sean.jpg` / `d/photos/facilitator-brandon.jpg` (portrait preferred, any size) → adjust `CROP` in `d/tools/build_photos.py` if the face sits elsewhere → `python3 d/tools/build_photos.py` (needs pillow with avif; opencv-contrib + `EDSR_x2.pb` optional for small sources, env `EDSR_X2`). HTML references only the generated fixed names, so no HTML edits. Remove `d/photos/` from any deploy bundle (full-res originals).
- Treatment: duotone (Sean plum, Brandon ink), gentle backdrop burn (vignette only, faces only resampled), fine grain, arch masks, offset outline frames. No logos or mockup background text appear. Headroom padding replicates the backdrop only.
- **Placeholder note** appears in this file and in the preview bar only ("Photos are placeholders, pending approval."), not in page copy. Original high-res Brandon photo, consent from both, and photographer licences are still needed (SOURCES.md: no licence stated on any source).

## Scroll choreography
Single rAF-throttled passive scroll handler (header compact, progress bar scaleX, hero parallax via one `--py` custom property, sample-day stage) + IntersectionObserver (staggered reveals via `--i`, scroll-spy `aria-current`, experience acts counter, step connectors). Experience: sticky left column with 01/05 counter + bar, active act draws a plum rule. Sample day (≥1024, height ≥640, motion on): `position:sticky` pinned stage ~2.9 viewports tall, five steps expand one at a time while five concentric rings light up; below that or calm it falls back to a vertical timeline with scroll-filled line (<1024) or a horizontal five-column timeline (≥1024 calm). No text sits over moving layers (parallax layers are photos/rings only; captions are static).
Pace scales motion via `--m` (join 1, adapt .5, observe .2, out 0): parallax distance, reveal travel, card lift, button arrow. Observe also flattens the pinned stage; **Step out** and `prefers-reduced-motion` turn off transitions, animations, parallax, reveals, pin and the ring (static cue text).

## Measured results (2026-10-17)
- **Lighthouse (mobile, simulated throttling, lighthouse 13.4.1, http://127.0.0.1:8769/):** Performance **99**, Accessibility **100**, Best Practices **100**, SEO **66** (only failing audit `is-crawlable`, intentional noindex). LCP 2.0 s, CLS 0, TBT 10 ms, FCP 1.2 s, 151 KiB total. Reports: `screenshots/lighthouse-d.json` / `.html`.
- **Contrast** (`screenshots/contrast-d.json`): 54 state×viewport scans at 390 and 1280 (default, compact header, active nav, menu, flat + pinned day steps 1–5, paces, FAQ tabs, form errors/flag/done, 12 hover targets), 31 unique text pairs, **lowest 6.36:1** (#505766 on #F5EEF3), 0 failures; non-text lowest 3.76:1 (radio border on tint), 0 failures. Decorative ring hairlines (1.91:1) are not information. Text over the SVG stage fill is resolved to the known fill colour; no text over photos. One hover probe on the hidden mobile nav timed out (nav is covered in the menu-open state).
- **QA** (`screenshots/qa-d.json`, 320/390/768/1024/1280/1440/1920): 0 horizontal scroll, 0 tap targets <44 px (menu open too), axe 0 violations, 0 console errors, 0 external requests (9–13 same-origin requests), keyboard focus ring on every stop, empty submit → 5 errors + focus on summary, bad email + health keyword flagged, valid → "Nothing was sent" with 0 requests after submit, scroll-spy correct on all six sections, header compacts, progress reaches 1. Pinned stage steps 1→5 verified; parallax moves in Join in, 0 in Step out; reduced motion verified at 390 and 1280.
- Screenshots in `screenshots/`: `d-{390,768,1280,1920}.png` (full page; captured with `data-calm` so the pinned stage is flattened) and `-fold` for all seven widths, `d-form-*`, `d-menu-open-390`, `d-pinned-step1..5-1280`, `d-pace-{adapt,out}-1280`, `d-reduced-{390,1280,day-1280}`, `d-hover-*`.

## Known gaps
Photo resolution (Brandon 333x400 source); no real-device/Safari/screen-reader pass; `.art__img` wipe uses clip-path (main-thread, ~1.3 s on load); parallax kept subtle to avoid jank; the pinned stage is desktop-only; "Posture Guy Mike" etc. copy unchanged from c.
