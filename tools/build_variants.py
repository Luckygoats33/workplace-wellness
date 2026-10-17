"""Builds a/index.html and b/index.html from shared content + per-direction chrome.
Run: python3 tools/build_variants.py   (no network, writes only inside a/ and b/)."""
import re, math, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
orig = open(os.path.join(ROOT, 'index.html')).read()

def grab(start, end):
    i = orig.index(start); j = orig.index(end, i)
    return orig[i:j]

# ---- reuse verbatim content blocks from the baseline (content/structure only) ----
FAQ = grab('<div class="tabs" data-tabs>', '<div class="faq__aside')
FAQ = FAQ.rsplit('</div>', 1)[0] if False else FAQ
FORM = grab('<form class="form" id="inquiry-form"', '<div class="form-done"')
FORM = FORM.replace('<button class="btn btn--accent btn--lg" type="submit">', '<button class="btn btn--accent btn--lg" type="submit">')
# the FAQ block above ends right before the aside; keep its closing div balanced
assert FAQ.count('<div') == FAQ.count('</div>'), (FAQ.count('<div'), FAQ.count('</div>'))

def W(v, cls='mark', title=True):
    t = '<title>Workplace Wellness by SWG flowing W mark (placeholder)</title>' if title else ''
    if v == 'a':
        return f'''<svg class="{cls}" viewBox="0 0 64 44" role="img" aria-label="Flowing W mark (placeholder)">{t}<path d="M5 9C9 9 11 35 19.5 35S26 13 32 13s4.500 22 12.500 22S55 9 59 9" fill="none" stroke="currentColor" stroke-width="6.500" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 9C9 9 11 35 19.500 35S26 13 32 13s4.500 22 12.500 22S55 9 59 9" fill="none" stroke="var(--lime)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 7)" opacity=".9"/><circle cx="32" cy="13" r="3" fill="var(--coral)"/></svg>'''
    return f'''<svg class="{cls}" viewBox="0 0 64 44" role="img" aria-label="Flowing W mark (placeholder)">{t}<path d="M7 8C9 24 13 36 21 36S31 22 33 13" fill="none" stroke="var(--cobalt)" stroke-width="8" stroke-linecap="round"/><path d="M33 13C35 22 39 36 47 36S57 24 59 8" fill="none" stroke="var(--ink)" stroke-width="8" stroke-linecap="round"/><circle cx="33" cy="12" r="5" fill="var(--sun)" stroke="var(--ink)" stroke-width="2"/></svg>'''

def brand(v, foot=False):
    c = 'brand brand--footer' if foot else 'brand'
    return f'''<a class="{c}" href="#top" aria-label="Workplace Wellness by SWG, back to top">{W(v,'brand__mark', title=False)}<span class="brand__text"><span class="brand__name">Workplace Wellness</span><span class="brand__by">by SWG</span></span></a>'''

def header(v):
    return f'''<header class="site-header" data-header>
    <div class="wrap site-header__inner">
      {brand(v)}
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-nav-toggle><span class="nav-toggle__bars" aria-hidden="true"><span></span><span></span></span><span class="nav-toggle__label">Menu</span></button>
      <nav class="site-nav" id="site-nav" aria-label="Primary" data-nav>
        <ul>
          <li><a href="#experience">Experience</a></li>
          <li><a href="#program">Program</a></li>
          <li><a href="#facilitators">Facilitators</a></li>
          <li><a href="#how-it-works">How it works</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <a class="btn btn--accent btn--sm" href="#plan">Plan Your Team Experience</a>
      </nav>
    </div>
  </header>'''

PREVIEW = '''<aside class="preview-bar" aria-label="Preview notice"><span class="preview-bar__dot" aria-hidden="true"></span>Design preview. Content, names and details are pending approval. Nothing on this page is live.</aside>'''

def kin_verbs():
    return '<ul class="hero__verbs" aria-label="What the experience includes"><li>Move</li><li>Breathe</li><li>Learn</li><li>Connect</li></ul>'

def hero(v):
    if v == 'a':
        return '''<section class="hero" id="top" aria-labelledby="hero-title">
      <div class="wrap hero__inner">
        <p class="eyebrow">Workplace Wellness by SWG</p>
        <h1 class="hero__title" id="hero-title">Bring your team <span class="kin" data-kin>together</span> <span class="hero__rest">through an interactive wellness experience.</span></h1>
        <div class="hero__row">
          <p class="hero__lede">Create space for your people to move, breathe, learn, and connect. Our facilitated experiences bring practical wellness education and audience participation to employee events, retreats, and company gatherings.</p>
          <div class="hero__actions">
            <a class="btn btn--accent btn--lg" href="#plan" data-magnet>Plan Your Team Experience <span class="btn__arrow" aria-hidden="true">→</span></a>
            <a class="btn btn--ghost" href="#experience" data-magnet>See what people do</a>
          </div>
        </div>
        ''' + kin_verbs() + '''
        <p class="hero__hint" aria-hidden="true"><span class="hero__hint-dot"></span>The field behind this page breathes: in for 4, out for 6.</p>
      </div>
      <div class="hero__strip"><p><span>Made for</span> employee events <i aria-hidden="true">/</i> team retreats <i aria-hidden="true">/</i> company gatherings <i aria-hidden="true">/</i> annual meetings</p></div>
    </section>'''
    return '''<section class="hero" id="top" aria-labelledby="hero-title">
      <div class="wrap hero__grid">
        <div class="hero__copy">
          <p class="eyebrow"><span class="eyebrow__dot" aria-hidden="true"></span>Workplace Wellness by SWG</p>
          <h1 class="hero__title" id="hero-title">Bring your team <span class="hl">together</span> through an interactive wellness experience.</h1>
          <p class="hero__lede">Create space for your people to move, breathe, learn, and connect. Our facilitated experiences bring practical wellness education and audience participation to employee events, retreats, and company gatherings.</p>
          <div class="hero__actions">
            <a class="btn btn--accent btn--lg" href="#plan">Plan Your Team Experience <span class="btn__arrow" aria-hidden="true">→</span></a>
            <a class="btn btn--ghost" href="#experience">See what people do</a>
          </div>
          ''' + kin_verbs() + '''
        </div>
        <div class="hero__orbwrap" data-orbwrap>
          <button class="orb" type="button" data-orb aria-describedby="orb-help"><span class="orb__core" aria-hidden="true"></span><span class="orb__label" aria-hidden="true" data-orb-label>Hold</span><span class="sr-only">Breath orb. Press and hold to breathe in, release to breathe out.</span></button>
          <p class="orb__help" id="orb-help">Press and hold the orb to breathe in. Let go to breathe out. Optional, and always at your own pace.</p>
          <p class="orb__status" role="status" aria-live="polite" data-orb-status>Ready when you are.</p>
        </div>
      </div>
      <div class="hero__strip"><p><span>Made for</span> employee events <i aria-hidden="true">/</i> team retreats <i aria-hidden="true">/</i> company gatherings <i aria-hidden="true">/</i> annual meetings</p></div>
    </section>'''

def head(num, label, h2, em, lede='', idn='', dark=False):
    l = f'<p class="section-lede">{lede}</p>' if lede else ''
    return f'''<div class="section-head reveal"><p class="section-no"><b>{num}</b> <span>{label}</span></p><h2 class="display" id="{idn}">{h2} <em>{em}</em></h2>{l}</div>'''

ACTS = [("Guided participation","Facilitators lead the room step by step, so nobody has to guess what to do next or perform for colleagues."),
("Movement","Simple, accessible movement that works in event clothing and ordinary meeting spaces. Most of it can be done standing or seated."),
("Breathing","Easy-to-follow breathing practices, which simply means paying attention to how you breathe and trying different paces and patterns."),
("Questions","Time for people to ask what they’re genuinely curious about, answered in plain language."),
("Discussion","Moments to compare notes with colleagues and leave with ideas people can use in an ordinary workday.")]
PACES = [("join","Join in","Follow along with the group."),("adapt","Adapt","Do a smaller, seated or modified version."),("observe","Observe","Watch and listen. That still counts."),("out","Step out","Take a break whenever you like.")]

def acts():
    out = '<ol class="acts">'
    for i,(t,p) in enumerate(ACTS,1):
        out += f'<li class="act reveal" tabindex="-1"><span class="act__no" aria-hidden="true">0{i}</span><div><h3 class="act__t">{t}</h3><p>{p}</p></div></li>'
    return out + '</ol>'

def choice(v):
    if v == 'a':
        items = ''.join(f'<li><button class="pace" type="button" data-pace-set="{k}" aria-pressed="{"true" if k=="join" else "false"}"><span class="key key--{k}" aria-hidden="true"></span><strong>{n}</strong><span class="pace__d">{d}</span></button></li>' for k,n,d in PACES)
        return f'''<div class="choice" role="group" aria-labelledby="choice-title" data-choice>
          <div class="choice__intro reveal"><h3 class="choice__title" id="choice-title">Your pace. <em>Your call.</em></h3><p>Participation is always an invitation. At any point, anyone can choose how involved they want to be, and no one is asked to explain why.</p><p class="choice__tip">Scroll through these four, or tap one. Watch the field behind the page follow: lively, gentle, still, then at rest.</p><p class="sr-only" role="status" aria-live="polite" data-pace-status>Pace: Join in.</p></div>
          <ul class="choice__options">{items}</ul></div>'''
    items = ''.join(f'<li class="pcard" data-pcard="{k}"><span class="key key--{k}" aria-hidden="true"></span><strong>{n}</strong><span>{d}</span></li>' for k,n,d in PACES)
    return f'''<div class="choice reveal" role="group" aria-labelledby="choice-title">
          <div class="choice__intro"><h3 class="choice__title" id="choice-title">Your pace. <em>Your call.</em></h3><p>Participation is always an invitation. At any point, anyone can choose how involved they want to be, and no one is asked to explain why.</p><p class="choice__tip">Try it on this page: the pace dock at the bottom of your screen turns the page’s own motion up or down, all the way to still.</p></div>
          <ul class="choice__options">{items}</ul></div>'''

def pacer(v):
    return '''<div class="pacer reveal" data-pacer>
          <div class="pacer__copy">
            <p class="eyebrow">Try a taste</p>
            <h3 class="pacer__title">One slow breath, right where you are.</h3>
            <p>Press start and follow the circle: breathe in as it grows, out as it settles. Breathe comfortably and stop whenever you like. This is a small sample of the style, not a program.</p>
            <button class="btn btn--dark" type="button" data-pacer-btn aria-pressed="false">Start a slow breath</button>
          </div>
          <div class="pacer__stage" aria-hidden="true"><div class="pacer__ring"></div><div class="pacer__orb" data-pacer-orb></div></div>
          <p class="pacer__status" role="status" aria-live="polite" data-pacer-status>Ready when you are.</p>
        </div>'''

def experience(v):
    return f'''<section class="section s-experience" id="experience" aria-labelledby="exp-title"><div class="wrap">
        {head("01","The experience","Less sitting through it.","More taking part.","Your people aren’t an audience to be talked at. Facilitators guide the room through short, practical segments, and everyone gets to try things for themselves.","exp-title")}
        {acts()}
        {choice(v)}
        {pacer(v)}
      </div></section>'''

def program(v):
    steps = [("Welcome","Set the tone, explain how participation works and that every option is welcome."),("Session with Sean","The nervous system in plain terms, with guided movement and practical education."),("Reflect &amp; reset","A short pause to stretch, refill a coffee and talk over what stood out."),("Session with Brandon","Accessible breathing and related practices the room tries together."),("Closing conversation","Open questions, shared takeaways and ideas people can carry into an ordinary week.")]
    st = ''.join(f'<li class="reveal"><span class="day__step">{i}</span><h4>{t}</h4><p>{p}</p></li>' for i,(t,p) in enumerate(steps,1))
    return f'''<section class="section s-program" id="program" aria-labelledby="prog-title"><div class="wrap">
        {head("02","The program","A half-day that brings","the whole room in.","The core experience pairs two facilitators with complementary focuses: nervous system, movement and practical education, then breathing and related practices. A full-day version gives more room to go deeper.","prog-title")}
        <div class="formats">
          <article class="format format--core reveal"><p class="format__tag">Core program</p><h3 class="format__name">Half-day</h3><p>Two facilitated sessions, a reset in between and a closing conversation. Fits neatly into a morning or afternoon of an event or offsite.</p></article>
          <article class="format reveal"><p class="format__tag">Extended</p><h3 class="format__name">Full-day</h3><p>The same foundation with more time for practice, questions and group discussion. Exact format is shaped with you and the facilitators.</p></article>
          <div class="suits reveal"><h3 class="suits__title">Who it suits</h3><ul><li>HR, people and culture teams planning an employee event</li><li>Event planners building a retreat or offsite agenda</li><li>Leadership looking for a shared, hands-on session</li><li>Company gatherings and annual meetings that want a break from back-to-back presentations</li></ul></div>
        </div>
        <div class="day reveal" role="group" aria-labelledby="day-title"><div class="day__head"><h3 class="day__title" id="day-title">A sample half-day</h3><p class="stamp">Sample only. Final sequence and timing agreed with facilitators.</p></div><ol class="day__track">{st}</ol></div>
      </div></section>'''

def person(n, sess, focus, body, img, alt):
    return f'''<article class="person reveal" aria-labelledby="{n.lower()}-name"><div class="person__photo"><img src="assets/img/{img}" width="395" height="316" alt="{alt}" decoding="async"></div><div class="person__body"><p class="person__session">{sess}</p><h3 class="person__name" id="{n.lower()}-name">{n}</h3><p class="person__focus">{focus}</p><p>{body}</p><div class="pending"><p><strong>Bio:</strong> pending approval</p><p><strong>Credentials &amp; title:</strong> pending approval</p></div></div></article>'''

def facilitators(v):
    return f'''<section class="section s-fac" id="facilitators" aria-labelledby="fac-title"><div class="wrap">
        {head("03","Meet the facilitators","Two specialists.","One shared room.","Each facilitator leads a session in their own area. Full names, bios and credentials will be added once confirmed.","fac-title")}
        <div class="people">
        {person("Sean","Session 1","Nervous system, movement &amp; practical wellness education","Sean helps people understand the nervous system, the body’s network of brain, nerves and signals that shapes how we react to busy days and how we settle afterwards. His session mixes plain-language explanation with movement the whole room can try.","facilitator-sean.webp","Portrait of Sean, facilitator, in a blue collared shirt against a dark background.")}
        {person("Brandon","Session 2","Breathing &amp; related practices","Brandon guides accessible breathing practices: noticing your breath, then trying different paces and patterns together. Each practice is explained before the room tries it, with easy ways to adapt or simply watch.","facilitator-brandon.webp","Portrait of Brandon, facilitator, smiling, in a black crew-neck shirt against a dark background.")}
        </div></div></section>'''

def enhancements(v):
    return f'''<section class="section s-enh" id="enhancements" aria-labelledby="enh-title"><div class="wrap">
        {head("04","Optional enhancements","The core stands alone.","Extras are optional.","Nothing below is required to book the program. If your event has the space, time and budget, you can add more to explore.","enh-title")}
        <div class="enh__grid">
          <article class="addon reveal"><p class="addon__kind">Roaming or booth</p><h3>Posture Guy Mike</h3><p>Practical posture tips for desk days and long event days, offered as roaming support during the event or at an optional booth people can visit if they choose.</p><p class="addon__note">Photo and bio pending approval</p></article>
          <article class="addon reveal"><p class="addon__kind">By request</p><h3>Other practitioners</h3><p>Additional practitioners or activities can be explored, matched to your audience, venue and budget. Availability is confirmed case by case.</p><p class="addon__note">No additional practitioners confirmed yet</p></article>
          <article class="addon reveal"><p class="addon__kind">Always</p><h3>Opt-in for employees</h3><p>Every addition stays voluntary. Employees choose what they want to explore, just like in the core sessions.</p></article>
        </div></div></section>'''

def how(v):
    st = [("Tell us about the event","Share the basics: who’s coming, roughly when and where, and what you hope people get from it."),("Explore a format","We talk through half-day or full-day options and whether any optional additions make sense."),("Confirm program &amp; logistics","Agree the sequence, timing, room setup, accessibility, audio-visual needs and who does what."),("Bring it to your team","The facilitators arrive, set up and lead the experience. You get to take part too.")]
    s = ''.join(f'<li class="step reveal"><span class="step__no" aria-hidden="true">{i}</span><h3>{t}</h3><p>{p}</p></li>' for i,(t,p) in enumerate(st,1))
    return f'''<section class="section s-how" id="how-it-works" aria-labelledby="how-title"><div class="wrap">
        {head("05","How booking works","From first note","to a full room.","","how-title")}
        <ol class="steps">{s}</ol>
        <p class="steps__cta reveal"><a class="btn btn--dark" href="#plan">Start with step one <span class="btn__arrow" aria-hidden="true">→</span></a></p></div></section>'''

def faq(v):
    return f'''<section class="section s-faq" id="faq" aria-labelledby="faq-title"><div class="wrap faq">
        {head("06","Questions","Answers for whoever’s","asking.","","faq-title")}
        <div class="faq__grid">
        {FAQ}
        <div class="faq__aside reveal"><h3 id="short-title">The short version</h3><ul><li><strong>General wellness education.</strong> Not medical care, therapy or treatment.</li><li><strong>Always optional.</strong> Join in, adapt, observe or step out.</li><li><strong>No health data.</strong> Nobody needs to share health information to take part.</li><li><strong>No promised outcomes.</strong> Just practical ideas people can try.</li></ul></div>
        </div></div></section>'''

LATER = '''<section class="later" aria-labelledby="later-title"><div class="wrap later__inner reveal"><p class="later__pill">In exploration</p><div><h2 class="later__title" id="later-title">Ideas we’re exploring for later</h2><p class="later__text">We’re looking at <strong>repeat and multi-day event formats</strong> and an <strong>employee benefits directory</strong>. Both are early concepts: nothing is available yet, there is no employee account or login, and no vendors or partners have committed.</p></div></div></section>'''

def plan(v):
    return f'''<section class="section s-plan plan" id="plan" aria-labelledby="plan-title"><div class="wrap plan__grid">
        <div class="plan__intro reveal"><p class="section-no"><b>07</b> <span>Plan your team experience</span></p><h2 class="display" id="plan-title">Tell us about <em>your people.</em></h2><p class="section-lede">A few details are enough to start a conversation about format, timing and fit. Rough answers are fine.</p><ul class="plan__points"><li>No commitment, just a conversation</li><li>Please don’t include personal health information</li><li>Who receives inquiries: <strong>to be confirmed</strong></li></ul></div>
        <div class="form-card reveal">
          <div class="preview-note" role="note"><span class="preview-note__badge">Preview</span><p><strong>Not connected.</strong> This form checks your entries but doesn’t send or store anything.</p></div>
          <div class="error-summary" tabindex="-1" hidden data-error-summary><h3>Please check a few things</h3><ul data-error-list></ul></div>
          {FORM}
          <div class="form-done" tabindex="-1" hidden data-done>{W(v,'done__mark',title=False)}<h3>Looks good. <em>Nothing was sent.</em></h3><p>Every required field passed validation. Because this is a preview, your details were not sent or stored anywhere. Once the inquiry destination is confirmed, this is where a real confirmation will appear.</p><button class="btn btn--dark" type="button" data-reset>Reset the preview form</button></div>
          <noscript><p class="form__fine">JavaScript is off, so the preview form can’t check your entries. Nothing is sent either way.</p></noscript>
        </div></div></section>'''

def footer(v):
    return f'''<footer class="site-footer"><div class="wrap footer__grid">
      <div class="footer__brand">{brand(v, True)}<p>Brought to you by <a class="inline-link" href="https://supportwellnessglobal.com" rel="noopener">Support Wellness Global</a>.</p><p class="footer__small">Flowing-W mark shown is a placeholder pending brand approval.</p></div>
      <nav class="footer__nav" aria-label="Footer"><ul><li><a href="#experience">Experience</a></li><li><a href="#program">Program</a></li><li><a href="#facilitators">Facilitators</a></li><li><a href="#how-it-works">How it works</a></li><li><a href="#faq">FAQ</a></li><li><a href="#plan">Plan your team experience</a></li></ul></nav>
      <div class="footer__legal" id="privacy"><p>Workplace Wellness by SWG offers general wellness education and guided participation. It is not medical advice, diagnosis or treatment, and no specific outcomes are promised.</p><ul><li><a href="#privacy" aria-describedby="privacy-note">Privacy policy</a> <span class="footer__small" id="privacy-note">(placeholder, to be added)</span></li></ul><p class="footer__small">© <span data-year>2026</span> Support Wellness Global. Design preview.</p></div>
    </div></footer>'''

DOCK = '''<aside class="dock-wrap" aria-label="Page pace"><div class="dock" role="radiogroup" aria-label="Page pace: how much this page moves">
    <span class="dock__label" aria-hidden="true">Pace</span>
''' + ''.join(f'''    <label class="dock__opt"><input type="radio" name="pace" value="{k}"{" checked" if k=="join" else ""} data-pace-radio><span class="dock__face"><span class="key key--{k}" aria-hidden="true"></span><span class="dock__txt">{n}</span></span></label>
''' for k,n,d in PACES) + '''  </div></aside>'''

A_CONTROLS = '''<button class="field-toggle" type="button" aria-pressed="false" data-field-toggle><svg class="field-toggle__ring" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="2.5"/><circle class="field-toggle__dot" data-ring cx="18" cy="18" r="9" fill="currentColor"/></svg><span data-field-label>Pause field</span></button>'''

META = {'a': ('#0F0A0E','Workplace Wellness by SWG: Breath Field preview (direction A)'), 'b': ('#E9ECFF','Workplace Wellness by SWG: Pace Dial preview (direction B)')}

def page(v):
    tc, title = META[v]
    desc = 'Design preview: facilitated, interactive wellness experiences for employee events, retreats and company gatherings. Not live.'
    extra_bg = '<canvas class="field" data-field aria-hidden="true"></canvas>' if v=='a' else '<div class="blobs" aria-hidden="true"><i></i><i></i><i></i></div>'
    spine = '' if v=='a' else '<div class="spine" aria-hidden="true" data-spine><svg viewBox="0 0 60 1000" preserveAspectRatio="none" focusable="false"><path class="spine__base" d="%s" pathLength="1"/><path class="spine__draw" data-spine-draw d="%s" pathLength="1"/></svg><span class="spine__bead" data-spine-bead></span></div>' % (SPINE, SPINE)
    ctl = A_CONTROLS if v=='a' else DOCK
    fonts = {'a':('anybody','geist'),'b':('unbounded','onest')}[v]
    return f'''<!doctype html>
<html lang="en" data-dir="{v}" data-pace="join">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="{tc}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/{fonts[0]}.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/styles.css">
</head>
<body class="dir-{v}">
  <a class="skip-link" href="#main">Skip to main content</a>
  {PREVIEW}
  {extra_bg}
  {header(v)}
  <main id="main">
    {spine}
    {hero(v)}
    {experience(v)}
    {program(v)}
    {facilitators(v)}
    {enhancements(v)}
    {how(v)}
    {faq(v)}
    {LATER}
    {plan(v)}
  </main>
  {footer(v)}
  {ctl}
  <script src="assets/js/core.js" defer></script>
  <script src="assets/js/fx.js" defer></script>
</body>
</html>
'''

def spine_path():
    pts = []
    n = 200
    for i in range(n+1):
        y = 1000*i/n
        x = 30 + 20*math.sin(i/n*2*math.pi*7)
        pts.append(f'{x:.1f} {y:.1f}')
    return 'M' + ' L'.join(pts)
SPINE = spine_path()

fav = {'a': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 44"><rect width="64" height="44" rx="10" fill="#0F0A0E"/><path d="M8 11C11 11 13 33 20 33S26 15 32 15s5 18 12 18S53 11 56 11" fill="none" stroke="#D4FF3F" stroke-width="5.500" stroke-linecap="round"/><circle cx="32" cy="15" r="3" fill="#FF6B57"/></svg>',
       'b': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 44"><rect width="64" height="44" rx="22" fill="#E9ECFF"/><path d="M12 10C14 24 17 34 23 34S31 22 33 15" fill="none" stroke="#3342F5" stroke-width="7" stroke-linecap="round"/><path d="M33 15C35 22 39 34 45 34S52 24 54 10" fill="none" stroke="#0F1240" stroke-width="7" stroke-linecap="round"/></svg>'}
for v in 'ab':
    open(os.path.join(ROOT, v, 'index.html'), 'w').write(page(v))
    open(os.path.join(ROOT, v, 'assets', 'favicon.svg'), 'w').write(fav[v])
print('built')
