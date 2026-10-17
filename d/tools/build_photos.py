"""Photo build for d/. SINGLE SWAP POINT per person: d/photos/facilitator-sean.jpg and d/photos/facilitator-brandon.jpg.
Replace a source file (any size/ratio, portrait preferred), adjust CROP below if the face sits elsewhere, then run:
    python3 d/tools/build_photos.py
It writes (all referenced from index.html by these fixed names) in d/assets/img/:
    sean-duo.{avif,webp}, sean-duo-sm.{avif,webp}, sean-color.{avif,webp}   (and the same for brandon)
Treatment: 3:4 face-centred crop (headroom padded by edge replication of the backdrop only), small sources get faithful EDSR x2 super-resolution if
opencv-contrib + EDSR_x2.pb are available (else Lanczos), mild unsharp, then duotone (plum for Sean, ink for Brandon) + fine grain. Faces are only resampled, never edited.
CROP = (centre_x, centre_y_of_head_box_unused, crop_height_fraction, top_offset_fraction) in fractions of the source image."""
import os, sys, numpy as np
from PIL import Image, ImageOps, ImageFilter
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = R + '/photos/'; OUT = R + '/assets/img/'
MODEL = os.environ.get('EDSR_X2', '/workspace/d_work/EDSR_x2.pb')
CROP = {  # cx: face centre x (fraction of width); h: crop height (fraction of image height); top: crop top (fraction of height); pad: headroom added on top (fraction of crop h)
    'sean':    dict(cx=.475, h=.54, top=.02, pad=.08),
    'brandon': dict(cx=.465, h=.80, top=.00, pad=.12),
}
PAL = {
    'sean':    ([(0, '#1E1020'), (.38, '#5A2D52'), (.72, '#C9A5BE'), (1, '#FBF3F7')], 0.72, 1),
    'brandon': ([(0, '#161A2A'), (.40, '#47527C'), (.75, '#B8BFD4'), (1, '#F6F5F2')], 1.0, 0),
}
def hexc(h): return np.array([int(h[i:i+2], 16) for i in (1, 3, 5)], float)
def duotone(img, stops, gam, cut):
    g = np.asarray(ImageOps.autocontrast(img.convert('L'), cutoff=cut), float) / 255
    g = np.clip(g, 0, 1) ** gam
    pos = [p for p, _ in stops]; cols = [hexc(c) for _, c in stops]; out = np.zeros(g.shape + (3,))
    for ch in range(3): out[..., ch] = np.interp(g, pos, [c[ch] for c in cols])
    return Image.fromarray(out.clip(0, 255).astype('uint8'))
def vignette(im, strength):
    w, h = im.size; y, x = np.ogrid[:h, :w]
    d = np.sqrt(((x - w / 2) / (w * .42)) ** 2 + ((y - h * .40) / (h * .5)) ** 2)
    f = 1 - strength * np.clip(d - .6, 0, 1) ** 1.3
    return Image.fromarray((np.asarray(im, float) * f[..., None]).clip(0, 255).astype('uint8'))
def sr2(im):
    try:
        import cv2
        s = cv2.dnn_superres.DnnSuperResImpl_create(); s.readModel(MODEL); s.setModel('edsr', 2)
        a = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2BGR); return Image.fromarray(cv2.cvtColor(s.upsample(a), cv2.COLOR_BGR2RGB)), 'EDSR x2'
    except Exception as e:
        return im.resize((im.width * 2, im.height * 2), Image.LANCZOS), 'Lanczos x2 (EDSR unavailable: %s)' % type(e).__name__
def prep(name):
    c = CROP[name]; im = Image.open(SRC + f'facilitator-{name}.jpg').convert('RGB'); W, H = im.size
    ch = int(H * c['h']); cw = int(ch * 3 / 4); x0 = int(np.clip(W * c['cx'] - cw / 2, 0, W - cw)); y0 = int(H * c['top'])
    im = im.crop((x0, y0, x0 + cw, min(H, y0 + ch))); how = 'downsampled'
    if im.width < 700: im, how = sr2(im)
    pad = int(im.height * c['pad'])
    if pad:
        top = np.repeat(np.asarray(im)[:1], pad, axis=0); top = np.asarray(Image.fromarray(top).filter(ImageFilter.GaussianBlur(8)))
        im = Image.fromarray(np.vstack([top, np.asarray(im)]))
    cw = int(im.height * 3 / 4); x0 = max(0, (im.width - cw) // 2); im = im.crop((x0, 0, x0 + min(cw, im.width), im.height))
    im = im.resize((541, 722), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.1, percent=40, threshold=3))
    return im, how
def grain(im, amt, seed):
    n = np.random.default_rng(seed).normal(0, amt, im.size[::-1])[..., None]; return Image.fromarray((np.asarray(im, float) + n).clip(0, 255).astype('uint8'))
def save(im, base, size=None):
    if size: im = im.resize(size, Image.LANCZOS)
    im.save(OUT + base + '.avif', quality=50, speed=4); im.save(OUT + base + '.webp', quality=70, method=6)
    print(base, im.size, os.path.getsize(OUT + base + '.avif'), 'B avif', os.path.getsize(OUT + base + '.webp'), 'B webp')
for name in CROP:
    p, how = prep(name); print(name, 'source', Image.open(SRC + f'facilitator-{name}.jpg').size, how)
    stops, gam, cut = PAL[name]
    d = grain(vignette(duotone(p, stops, gam, cut), .62 if name == 'sean' else .7), 4, 3)
    save(d, f'{name}-duo'); save(d, f'{name}-duo-sm', (360, 480)); save(grain(p, 3, 5), f'{name}-color')
