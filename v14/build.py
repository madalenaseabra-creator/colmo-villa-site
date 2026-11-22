#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).parent
MAP = (ROOT / "images" / "map.svg").read_text()

NAV = [
    ("The House", "the-house.html"),
    ("Days at Colmo", "days-at-colmo.html"),
    ("Comporta", "comporta.html"),
    ("Contact", "contact.html"),
]

def acc(word):
    return '<span class="acc">' + word + '</span>'

def header(active):
    links = []
    for label, href in NAV:
        cur = ' aria-current="page"' if href == active else ""
        links.append("<li><a href=\"%s\"%s>%s</a></li>" % (href, cur, label))
    panel_bits = []
    for label, href in NAV:
        cur = ' aria-current="page"' if href == active else ""
        panel_bits.append("<a href=\"%s\"%s>%s</a>" % (href, cur, label))
    return """<header class="site-head">
  <a class="brand" href="index.html">
    <img class="wm-dark" src="images/logo-g2.png" alt="COLMO VILLA">
    <img class="wm-light" src="images/logo-g2-cream.png" alt="">
  </a>
  <nav aria-label="Primary">
    <ul class="nav-links">
      %s
    </ul>
  </nav>
  <div class="head-actions">
    <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false"><span></span></button>
    <div class="lang" aria-label="Language"><a href="#" lang="en" aria-current="true">EN</a><span class="lang-sep" aria-hidden="true">|</span><a href="#" lang="pt" aria-disabled="true" title="Portuguese version coming soon">PT</a></div>
    <a class="btn btn-book" href="availability.html">Book Now</a>
  </div>
</header>
<div class="nav-panel">
  %s
  <div class="lang" aria-label="Language"><a href="#" lang="en" aria-current="true">EN</a><span class="lang-sep" aria-hidden="true">|</span><a href="#" lang="pt" aria-disabled="true" title="Portuguese version coming soon">PT</a></div>
</div>""" % ("".join(links), "\n  ".join(panel_bits))

def footer(current=""):
    legal = [
        ("Privacy", "privacy.html", "Privacy Policy"),
        ("Terms", "terms.html", "Terms &amp; Conditions"),
        ("Cancellation", "cancellation.html", "Cancellation Policy"),
        ("Cookies", "cookies.html", "Cookies"),
    ]
    lis = []
    for label, href, full in legal:
        cur = ' aria-current="page"' if href == current else ""
        extra = ""
        if full != label:
            extra = ' title="%s" aria-label="%s"' % (full, full)
        lis.append('<li><a href="%s"%s%s>%s</a></li>' % (href, cur, extra, label))
    legal_items = "\n      ".join(lis)
    return """<footer class="site-foot">
  <div class="foot-inner">
    <a class="foot-mark" href="index.html">
      <img src="images/esquisso-cream.svg" alt="COLMO VILLA">
    </a>
    <ul class="foot-legal" aria-label="Policies">
      %s
    </ul>
    <p class="foot-statutory">
      <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener noreferrer">Complaints Book</a>
      <span class="foot-reg">Registration no. 99999</span>
    </p>
    <p class="legal"><a href="contact.html">COLMO VILLA · Comporta Retreat · Portugal</a></p>
  </div>
</footer>""" % legal_items


CHROME = """
<div class="lb" hidden role="dialog" aria-modal="true" aria-label="Photograph">
  <button class="lb-btn lb-close" type="button" aria-label="Close">x</button>
  <button class="lb-btn lb-prev" type="button" aria-label="Previous">&#8249;</button>
  <img alt="">
  <button class="lb-btn lb-next" type="button" aria-label="Next">&#8250;</button>
  <p class="lb-cap"></p>
</div>
<div class="modal modal-tour" hidden>
  <div class="modal-card">
    <p class="disp modal-title">Take the virtual tour</p>
    <p>The virtual tour is not online yet. For now, the photographs on these pages are the closest walk through.</p>
    <button class="btn" type="button" data-close>Close</button>
  </div>
</div>
<script src="js/site.js?v=1406"></script>
"""

FLY = """<a class="fly-logo" href="index.html" aria-label="COLMO VILLA · Comporta Retreat">
  <img class="logo-cream" src="images/logo-g2-cream.png" alt="">
  <img class="logo-dark" src="images/logo-g2.png" alt="">
</a>
"""

SITE = "https://madalenaseabra-creator.github.io/colmo-villa-site/v14/"

def page(title, desc, active, body, home=False, footer_current="", og_image="Final-51.jpg"):
    cls = ' class="is-home"' if home else ""
    fly = FLY if home else ""
    path = active or footer_current or "index.html"
    url = SITE + path
    image = SITE + "images/" + og_image
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%s</title>
<meta name="description" content="%s">
<link rel="canonical" href="%s">
<meta property="og:type" content="website">
<meta property="og:site_name" content="COLMO VILLA">
<meta property="og:title" content="%s">
<meta property="og:description" content="%s">
<meta property="og:url" content="%s">
<meta property="og:image" content="%s">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="%s">
<meta name="twitter:description" content="%s">
<meta name="twitter:image" content="%s">
<link rel="icon" href="images/esquisso.png" type="image/png">
<link rel="stylesheet" href="fonts/fonts.css?v=1406">
<link rel="stylesheet" href="css/site.css?v=1406">
<script>document.documentElement.classList.add("js");</script>
</head>
<body%s>
%s
%s
%s
%s
%s
</body>
</html>
""" % (title, desc, url, title, desc, url, image, title, desc, image, cls, header(active), fly, body, footer(footer_current), CHROME)

def media(src, alt, corner="rb", caption=None):
    cap = caption or alt
    return """<div class="media %s">
  <img src="images/%s" alt="%s" data-lightbox data-caption="%s">
</div>""" % (corner, src, alt, cap)

def split(kicker, title, lede, paras, src, alt, flip=False, band=False, intro=False, extra="", corner=None, anchor="", h1=None):
    if corner is None:
        corner = "ra" if flip else "rb"
    cls = "split"
    if flip: cls += " flip"
    if band: cls += " alt"
    if intro: cls += " intro"
    ps = "".join("<p>%s</p>" % p for p in paras)
    lede_h = '<p class="classic lede">%s</p>' % lede if lede else ""
    kick = '<p class="kicker">%s</p>' % kicker if kicker else ""
    id_attr = ' id="%s"' % anchor if anchor else ""
    if h1:
        head = ('<p class="poetic">%s</p>' % title if title else "") + '<h1 class="page-h1">%s</h1>' % h1
    else:
        head = '<h2 class="disp">%s</h2>' % title if title else ""
    return """<section class="%s"%s>
  <div class="copy">
    %s
    %s
    %s
    %s
    %s
  </div>
  %s
</section>""" % (cls, id_attr, kick, head, lede_h, ps, extra, media(src, alt, corner))

def tease(kicker, title, text, href, label, src, alt, flip=False, band=False, lede=""):
    corner = "ra" if flip else "rb"
    cls = "tease" + (" flip" if flip else "") + (" alt" if band else "")
    lede_h = '<p class="classic lede">%s</p>' % lede if lede else ""
    return """<section class="%s">
  <div class="copy">
    <p class="kicker">%s</p>
    <h2 class="disp">%s</h2>
    %s
    <p>%s</p>
    <a class="discover" href="%s">%s</a>
  </div>
  %s
</section>""" % (cls, kicker, title, lede_h, text, href, label, media(src, alt, corner))

def sketch():
    return '<div class="sketch-break"><img class="sketch" src="images/esquisso.png" alt=""></div>'

def fig(src, alt, cap, corner="", wide=False, tall=False, hour=None, heading=False):
    cls = " ".join(x for x in ["wide" if wide else "", "tall" if tall else ""] if x)
    cap_html = ('<span class="hour">%s</span>%s' % (hour, cap)) if hour else cap
    if heading:
        cap_html = '<h3 class="photo-title">%s</h3>' % cap_html
    inner = corner or ""
    return """<figure class="%s">
  <div class="%s">
  <img src="images/%s" alt="%s" data-lightbox data-caption="%s">
  </div>
  <figcaption>%s</figcaption>
</figure>""" % (cls, inner, src, alt, cap, cap_html)


def duo(items):
    bits = []
    for src, alt, cap, corner in items:
        cap_h = ('<figcaption>%s</figcaption>' % cap) if cap else ""
        bits.append("""<figure>
  <div class="media %s">
  <img src="images/%s" alt="%s" data-lightbox data-caption="%s">
  </div>
  %s
</figure>""" % (corner, src, alt, cap or alt, cap_h))
    return '<section class="duo">\n' + "\n".join(bits) + "\n</section>"

def wide(src, alt, cap="", corner="rb"):
    cap_h = ('<figcaption>%s</figcaption>' % cap) if cap else ""
    return """<section class="wide-pic">
  <div class="media %s">
    <img src="images/%s" alt="%s" data-lightbox data-caption="%s">
  </div>
  %s
</section>""" % (corner, src, alt, cap or alt, cap_h)

def home():
    body = """
<section class="entrance" id="top">
  <img class="bg" src="images/Final-51.jpg" alt="Pool at COLMO VILLA among the pines, Comporta, looking to the pavilion">
  <div class="veil"></div>
</section>
<section class="home-below" id="story">
  <h1 class="page-h1 entrance-h1"><span class="brand">Colmo Villa</span>, a private villa for 14<br> in a gated estate in Comporta</h1>
  <div class="home-story">
    <h2 class="disp">The refuge of """ + acc("simplicity") + """.</h2>
    <p>Nothing was bought online. Little by little, the house was furnished with pieces from all over the world — found on family travels and at fairs. A decoration that is unique, personal, and special.</p>
    <p>A house for friends, and for anyone who needs to stop.</p>
    <p class="home-facts">Comporta Retreat, gated estate<span> · </span>Architecture: Cristina Jorge de Carvalho<span> · </span>Interiors: Basalto Interiores</p>
  </div>
</section>
<section class="home-included-band">
  <p>The gym, the sauna &amp; Turkish bath, the cinema, bicycles and the 4x4 — all included. The pool, heated on request (extra). Daily housekeeping, 4 hours, included.</p>
</section>
""" + tease("The House", "A house with " + acc("roots") + ".",
       "Room for everyone. A place to slow down, and to gather.",
       "the-house.html", "Discover the house", "4.jpg", "The sitting and dining room at COLMO VILLA, Comporta",
       lede="Go on holiday. Stay right here. All yours.") + tease(
       "Days at Colmo", "A little time for " + acc("everything") + ".",
       "The gym, the sauna &amp; Turkish bath, the cinema — all included. The pool, heated on request (extra).",
       "days-at-colmo.html", "Discover Days at Colmo", "Final-60.jpg", "A sitting area by the pool at COLMO VILLA, Comporta", True, True) + duo([
        ("31.jpg", "The long sitting room at COLMO VILLA, opening to the pines, Comporta", "The long room", "rb"),
        ("Final-52.jpg", "The pool and pavilion at COLMO VILLA, Comporta", "The pool at COLMO VILLA, Comporta", "ra"),
    ]) + tease(
       "Gallery", "The house, in " + acc("pictures") + ".",
       "The rooms, the kitchen, the pool and the porch.",
       "gallery.html", "Discover the gallery", "Final-42.jpg", "The dining table at COLMO VILLA, set for a gathering, Comporta") + tease(
       "Comporta", "Between the pines and the " + acc("Atlantic") + ".",
       "About 5 min to the beach · about 1h15 from Lisbon.",
       "comporta.html", "Discover Comporta", "Final-58.jpg", "COLMO VILLA among the pines, Comporta, the Atlantic beyond", True, True) + wide(
        "21.jpg", "A bedroom at COLMO VILLA opening to the pines, Comporta", "A quieter room.", "rb") + """
<section class="band-dark">
  <div class="band-inner split" style="padding:0;max-width:none">
    <div class="copy">
      <p class="kicker">Availability</p>
      <h2 class="disp">Book the """ + acc("house") + """.</h2>
      <p>The house, for your people only. A request is not a booking — once we confirm, you will receive the terms.</p>
      <p><a class="btn" href="availability.html">Request dates</a></p>
    </div>
    """ + media("10.jpg", "The sitting room at COLMO VILLA, Comporta", "rb") + """
  </div>
</section>
"""
    return page("COLMO VILLA · Private Villa in Comporta, Portugal",
                "A private villa for 14 in a gated estate in Comporta, and +2. Go on holiday. Stay right here. All yours.",
                "index.html", body, home=True)


def house_map():
    raw = (ROOT / "images" / "esquisso.svg").read_text()
    paths = re.findall(r"<path[^>]*>", raw)
    outline = "\n    ".join(paths)
    # Owner-confirmed (aerial 1–3): the long wing is building 1; the mid wing
    # is the four bedrooms; the left volume is the annex. The small cottage
    # behind the long wing is the garage and is not a hover zone yet.
    zones = [
        {
            "tone": "olive",
            "href": "#studio",
            "label": "Annex",
            "note": "Two en-suite bedrooms, a kitchen and a living room.",
            "pts": [
                "147,333 149,318 157,308 168,303 182,305 192,318 193,336 193,351 168,354 147,352",
            ],
        },
        {
            "tone": "rose",
            "href": "#bedrooms",
            "label": "Rest",
            "note": "Four en-suite bedrooms and a TV room.",
            "pts": [
                "172,318 186,306 200,298 222,294 242,300 257,312 260,328 260,351 198,354 176,340 168,328",
            ],
        },
        {
            "tone": "azul",
            "href": "#kitchen",
            "label": "Living",
            "note": "Kitchen, living room, wine cellar, a library corner, an en-suite bedroom, pantry, utility room, gym and cinema room.",
            "pts": [
                "256,328 258,314 264,301 280,298 302,300 322,297 338,300 348,305 352,311 362,313 370,322 371,334 366,344 348,350 322,353 292,351 270,348 256,342 254,334",
            ],
        },
    ]
    # Paint order: long house first, then annex, then the bedroom wing
    # so the mid roof wins the overlap.
    order = [2, 0, 1]
    bits = []
    for i in order:
        z = zones[i]
        polys = "".join('<polygon points="%s"/>' % pts for pts in z["pts"])
        aria = "%s: %s" % (z["label"], z["note"])
        bits.append(
            '<a class="zone zone--%s" href="%s" data-label="%s" data-note="%s" aria-label="%s">%s</a>'
            % (z["tone"], z["href"], z["label"], z["note"], aria, polys)
        )
    return """<section class="house-map" id="volumes">
  <p class="kicker">The house</p>
  <h2 class="disp">The houses.<br><span class="acc">What is inside.</span></h2>
  <p class="muted house-map-hint-desk">Hover to preview a house. Click to go there.</p>
  <p class="muted house-map-hint-mob">Tap a house to go there.</p>
  <div class="house-map-frame">
    <svg class="house-map-svg" viewBox="143 295 239.5 64.5" role="img" aria-label="The houses of COLMO VILLA">
      <g class="zones">
        %s
      </g>
      <g class="outline" aria-hidden="true">
        %s
      </g>
      <text class="garage-label" x="370" y="316" text-anchor="middle">Garage</text>
    </svg>
    <p class="house-map-live" aria-live="polite"><span>Click or tap a house.</span></p>
    <ul class="house-map-picks">
      <li><button type="button" class="house-map-pick" data-href="#kitchen" aria-pressed="false">
        <i class="swatch swatch--azul" aria-hidden="true"></i>
        <span class="pick-copy"><strong>Living</strong><span class="pick-note">Kitchen, living room, wine cellar, a library corner, an en-suite bedroom, pantry, utility room, gym and cinema room.</span></span>
      </button></li>
      <li><button type="button" class="house-map-pick" data-href="#bedrooms" aria-pressed="false">
        <i class="swatch swatch--rose" aria-hidden="true"></i>
        <span class="pick-copy"><strong>Rest</strong><span class="pick-note">Four en-suite bedrooms and a TV room.</span></span>
      </button></li>
      <li><button type="button" class="house-map-pick" data-href="#studio" aria-pressed="false">
        <i class="swatch swatch--olive" aria-hidden="true"></i>
        <span class="pick-copy"><strong>Annex</strong><span class="pick-note">Two en-suite bedrooms, a kitchen and a living room.</span></span>
      </button></li>
    </ul>
  </div>
</section>""" % ("\n        ".join(bits), outline)



def zone_carousel(slides):
    """Single-row sideways carousel for a house zone. First image eager, rest lazy."""
    figs = []
    n = len(slides)
    for i, (src, alt, cap) in enumerate(slides):
        lazy = "" if i == 0 else ' loading="lazy"'
        figs.append(
            """    <figure class="carousel-slide" role="listitem">
      <div class="carousel-media">
        <img src="images/%s" alt="%s"%s data-lightbox data-caption="%s" decoding="async">
      </div>
      <figcaption><h3 class="photo-title">%s</h3></figcaption>
    </figure>""" % (src, alt, lazy, cap, cap)
        )
    dots = []
    for i in range(n):
        cur = ' aria-current="true"' if i == 0 else ""
        active = " is-active" if i == 0 else ""
        dots.append(
            '      <button type="button" class="carousel-dot%s" aria-label="Photo %d of %d"%s></button>'
            % (active, i + 1, n, cur)
        )
    chev_l = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 4.5L8 12l7.5 7.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    chev_r = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 4.5L16 12l-7.5 7.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    return """  <div class="zone-carousel" data-carousel>
    <button type="button" class="carousel-btn carousel-prev" aria-label="Previous photo">%s</button>
    <div class="carousel-viewport">
      <div class="carousel-track" tabindex="0" role="list" aria-label="Photographs of this house">
%s
      </div>
    </div>
    <button type="button" class="carousel-btn carousel-next" aria-label="Next photo">%s</button>
    <div class="carousel-dots" role="group" aria-label="Choose a photograph">
%s
    </div>
  </div>""" % (chev_l, "\n".join(figs), chev_r, "\n".join(dots))


def house():
    suites = """
    <ul class="suite-list">
      <li><span class="suite-name">Suite Living</span><span class="suite-zone">Living</span><span class="suite-bed">Bed type —</span></li>
      <li><span class="suite-name">Bedroom 1</span><span class="suite-zone">Rest</span><span class="suite-bed">Bed type —</span></li>
      <li><span class="suite-name">Bedroom 2</span><span class="suite-zone">Rest</span><span class="suite-bed">Bed type —</span></li>
      <li><span class="suite-name">Bedroom 3</span><span class="suite-zone">Rest</span><span class="suite-bed">Bed type —</span></li>
      <li><span class="suite-name">Bedroom 4</span><span class="suite-zone">Rest</span><span class="suite-bed">Bed type —</span></li>
      <li><span class="suite-name">Suite 1</span><span class="suite-zone">Annex</span><span class="suite-bed">Bed type —</span></li>
      <li><span class="suite-name">Suite 2</span><span class="suite-zone">Annex</span><span class="suite-bed">Bed type —</span></li>
    </ul>"""
    intro = """
<section class="house-hero">
  <figure class="house-hero-photo">
    <img src="images/Final-10.jpg" alt="The house at COLMO VILLA, seen from the pool, Comporta" data-lightbox data-caption="The house, seen from the pool">
  </figure>
  <div class="house-hero-copy">
    <p class="kicker">The House</p>
    <p class="poetic">Under the """ + acc("reed") + """.</p>
    <h1 class="page-h1">Three houses, seven en-suite bedrooms</h1>
    <p class="house-keyline">7 Bedrooms · 14 Guests · +2 Guests · All en-suite</p>
    <p class="house-place">Comporta Retreat, gated estate · Comporta</p>
  </div>
</section>
"""
    included = """
<section class="included" id="included">
  <p class="kicker">Included</p>
  <h2 class="disp">What's """ + acc("included") + """.</h2>
  <p class="included-highlight">Daily housekeeping, 4 hours, included.</p>
  <ul class="included-list">
    <li>A pool among the pines — heated on request (extra)</li>
    <li>A gym</li>
    <li>A sauna &amp; Turkish bath</li>
    <li>A cinema</li>
    <li>A wine cellar</li>
    <li>A library corner</li>
    <li>Bicycles at the house</li>
    <li>The 4x4</li>
  </ul>
</section>
"""
    living = """
<section class="house-volume zone-band zone-band--azul" id="kitchen">
  <div class="zone-band-inner">
  <h2 class="zone-title">Living</h2>
  <p class="zone-lead">A sitting room open to the pines, and a kitchen made for many hands.</p>
  <p class="zone-inside">1 en-suite bedroom, a kitchen, a living room, a wine cellar, a library corner, a pantry and a utility room, the gym and the cinema.</p>
  """ + zone_carousel([
        ("1.jpg", "The sitting and dining room at COLMO VILLA, Comporta", "The sitting and dining room"),
        ("11.jpg", "The living room at COLMO VILLA, Comporta", "The living room"),
        ("32.jpg", "A gathering of sofas in the living room at COLMO VILLA, Comporta", "A place to gather"),
        ("5.jpg", "A cabinet and a wall of small things at COLMO VILLA, Comporta", "A wall of small things"),
        ("7.jpg", "The kitchen at COLMO VILLA, Comporta", "The kitchen"),
        ("17.jpg", "An en-suite bedroom in the Living house at COLMO VILLA, Comporta", "An en-suite bedroom"),
        ("39.jpg", "The Turkish bath at COLMO VILLA, Comporta", "The Turkish bath"),
    ]) + """
  <p class="zone-back"><a href="#volumes" aria-label="Back to the sketch of the houses"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> The sketch</a></p>
  </div>
</section>
"""
    rest = """
<section id="bedrooms" class="house-volume house-anchor zone-band zone-band--rose">
  <div class="zone-band-inner">
  <h2 class="zone-title">Rest</h2>
  <p class="zone-lead">Four en-suite bedrooms, and a TV room.</p>
  <p class="zone-inside">4 en-suite bedrooms and a TV room.</p>
  """ + zone_carousel([
        ("16.jpg", "A bedroom at COLMO VILLA, Comporta, dressed in linen", "Bedroom 1"),
        ("30.jpg", "A bedroom at COLMO VILLA, Comporta, opening to the light", "Bedroom 2"),
        ("20.jpg", "A bedroom at COLMO VILLA, Comporta, in white linen", "Bedroom 3"),
        ("24.jpg", "A bedroom at COLMO VILLA looking to the pines, Comporta", "Bedroom 4"),
        ("15.jpg", "The TV room in the Rest house at COLMO VILLA, Comporta", "The TV room"),
        ("22.jpg", "A desk and the view in the Rest house at COLMO VILLA, Comporta", "A desk, and the view"),
        ("25.jpg", "A corner of the Rest house at COLMO VILLA, Comporta", "A corner of the house"),
        ("18.jpg", "A bathroom in the Rest house at COLMO VILLA, Comporta", "A bathroom"),
        ("35.jpg", "A bathroom with an oval window at COLMO VILLA, Comporta", "The oval window"),
        ("36.jpg", "A bathroom opening to a court at COLMO VILLA, Comporta", "Opening to a court"),
        ("23.jpg", "A bedroom with the bath just beyond, at COLMO VILLA, Comporta", "The bath, just beyond"),
        ("13.jpg", "A glazed passage of light in the Rest house at COLMO VILLA, Comporta", "A passage of light"),
    ]) + """
  <p class="zone-back"><a href="#volumes" aria-label="Back to the sketch of the houses"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> The sketch</a></p>
  </div>
</section>
"""
    annex = """
<section class="house-volume zone-band zone-band--olive" id="studio">
  <div class="zone-band-inner">
  <h2 class="zone-title">Annex</h2>
  <p class="zone-lead">A separate guest house, independent from the main house, and part of the same stay.</p>
  <p class="zone-inside">2 en-suite bedrooms, a kitchen and a living room. Included in the same booking.</p>
  """ + zone_carousel([
        ("Final-13.jpg", "The Annex at COLMO VILLA among the pines, Comporta", "The annex"),
        ("26.jpg", "A quiet bedroom in the Annex at COLMO VILLA, Comporta", "Suite 1"),
        ("33.jpg", "A bedroom in the Annex opening to the pines, Comporta", "Suite 2"),
    ]) + """
  <p class="zone-back"><a href="#volumes" aria-label="Back to the sketch of the houses"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> The sketch</a></p>
  </div>
</section>
"""
    sleeps = """
<section class="sleeps" id="who-sleeps-where">
  <p class="kicker">The house</p>
  <h2 class="disp">Who sleeps """ + acc("where") + """.</h2>
  <p class="classic lede">Seven en-suite bedrooms, across the three houses.</p>
  """ + suites + """
</section>
"""
    outside = """
<section class="house-outside" id="outside">
  <h2 class="zone-title zone-title-plain">Outside</h2>
  <p class="zone-lead">The pool, the decks, the long table, the pines.</p>
  <p class="zone-inside">The pool, heated on request (extra), the deck and the porch, among the pines.</p>
  <div class="grid zone-grid">
  """ + fig("Final-53.jpg","The pool at COLMO VILLA, Comporta","The pool","rb", heading=True) + """
  """ + fig("Final-54.jpg","The deck and the pool at COLMO VILLA, Comporta","The deck and the pool","ra", heading=True) + """
  """ + fig("Final-45.jpg","The porch at COLMO VILLA, Comporta","The porch","rb", heading=True) + """
  </div>
</section>
"""
    know = """
<section class="good-to-know" id="good-to-know">
  <p class="kicker">The house</p>
  <h2 class="disp">Good to """ + acc("know") + """.</h2>
  <p class="classic lede">What is already here.</p>
  <ul class="know-list">
    <li>7 en-suite bedrooms for 14 guests, and +2</li>
    <li>Three houses: 1 suite in Living, 4 in Rest, 2 in the Annex</li>
    <li>The Annex is a separate guest house with 2 suites, included in the booking</li>
    <li>A kitchen made for many hands</li>
    <li>A pantry and a utility room</li>
    <li>A TV room</li>
    <li>A fireplace</li>
    <li>Air conditioning</li>
    <li>Wifi</li>
    <li>The house, for your people only</li>
  </ul>
</section>
"""
    close = """
<section class="band-dark house-close">
  <div class="band-inner" style="text-align:center">
    """ + media("Final-3.jpg", "The house and the annex at COLMO VILLA among the pines, Comporta", "rb") + """
    <p class="kicker" style="margin-top:36px">The house</p>
    <p class="disp">One whole house.<br>One whole group.<br><span class="acc">Nothing else.</span></p>
    <p><a class="btn" href="availability.html">Request dates</a></p>
  </div>
</section>
"""
    body = intro + included + house_map() + living + rest + annex + sleeps + outside + know + close
    return page("The House · COLMO VILLA, Comporta",
                "7 en-suite bedrooms for 14 guests, and +2, across three houses in the pines of Comporta. Comporta Retreat, a gated estate.",
                "the-house.html", body)


def gallery():
    body = """
<section class="split intro gallery-best" style="grid-template-columns:1fr;padding-bottom:12px">
  <div class="copy">
    <p class="kicker">Gallery</p>
    <p class="poetic">A look """ + acc("around") + """.</p>
    <h1 class="page-h1">A look around</h1>
  </div>
</section>
<div class="grid gallery-best">
  """ + fig("6.jpg","The kitchen at COLMO VILLA, Comporta","The kitchen","ra", tall=True) + """
  """ + fig("Final-55.jpg","The deck looking along the house at COLMO VILLA, Comporta","Along the deck","rb") + """
  """ + fig("Final-4.jpg","The pool among the pines at COLMO VILLA, Comporta","Among the pines","ra") + """
  """ + fig("28.jpg","A bedroom at COLMO VILLA, Comporta, with a patterned rug","Soft light","rb") + """
  """ + fig("34.jpg","A bedroom at COLMO VILLA opening to the trees, Comporta","Opening to the trees","ra") + """
  """ + fig("19.jpg","A shower at COLMO VILLA, Comporta","The shower","rb") + """
  """ + fig("Final-43.jpg","Lounge chairs under an umbrella at COLMO VILLA, Comporta","Under the umbrella","ra", tall=True) + """
  """ + fig("Final-46.jpg","The pool deck at COLMO VILLA, Comporta","The pool deck","rb") + """
  """ + fig("9.jpg","The kitchen at COLMO VILLA, looking out to the pines, Comporta","The kitchen, looking out","ra", tall=True) + """
</div>
"""
    return page("Gallery · COLMO VILLA, Comporta",
                "Photographs of COLMO VILLA: the rooms, the kitchen, the pool and the porch.",
                "gallery.html", body)

def experiences():
    facts = """<p class="moments-facts">7 en-suite bedrooms · 14 guests + 2 · about 5 min to the beach · about 1h15 from Lisbon</p>
<p class="moments-include">Gym, sauna &amp; Turkish bath, bicycles, cinema and the 4x4 — all included in your stay.</p>"""
    body = split("Days at Colmo", "A little time for " + acc("everything") + ".",
       "Swim. Gather. Switch off.",
       ["The house holds both: the long table and the quiet room, the pool and the hour you take for yourself. Not a list of features — a day that can open or close as you like."],
       "Final-1.jpg", "Pool at COLMO VILLA from above, among the pines, Comporta", intro=True, extra=facts,
       h1="Days at Colmo, hour by hour") + """
<div class="exp-grid">
  <figure class="exp-card">
    <div class="ra"><img src="images/29.jpg" alt="A quiet bedroom at COLMO VILLA, Comporta" data-lightbox data-caption="A quiet room"></div>
    <p class="disp">A quiet """ + acc("room") + """.</p>
    <p>A bedroom you can close the door on.</p>
  </figure>
  <figure class="exp-card">
    <div class="rb"><img src="images/Final-59.jpg" alt="A covered outdoor lounge among the pines at COLMO VILLA, Comporta" data-lightbox data-caption="An outdoor lounge among the pines"></div>
    <p class="disp">Among the """ + acc("pines") + """.</p>
    <p>An outdoor lounge, in the shade.</p>
  </figure>
</div>
""" + split("On request", "A chef, and " + acc("massages") + ".",
       "Arranged when you want them.",
       ["A cook for the table, and massages at the house, on request. Ask when you write for dates."],
       "12.jpg", "The dining table at COLMO VILLA, set for a meal, Comporta", flip=True, band=True) + """
<section class="around-tease-mini">
  <p class="kicker">Around</p>
  <h2 class="disp">Beaches, rice fields,<br>the village, """ + acc("restaurants") + """.</h2>
  <p>About 5 min to the beach · about 1h15 from Lisbon.</p>
  <a class="discover" href="comporta.html">Discover Comporta</a>
</section>
<section class="band-dark" id="day">
  <div class="band-inner">
    <p class="kicker">A day here</p>
    <h2 class="disp">One day at """ + acc("Colmo") + """.</h2>
    <p class="classic lede">Together all day.<br>Alone whenever you like.</p>
    <p class="day-note">A suggested rhythm — not a timetable.</p>
    <div class="day-marquee" data-day-marquee>
      <div class="day-track">
        <div class="day-set">
          <figure>
            <span class="hour">08<small>h</small></span>
            <div><img class="day-kitchen" src="images/8.jpg" alt="The kitchen island at COLMO VILLA, looking out to the pool and the pines, Comporta" data-lightbox data-caption="Fresh coffee"></div>
            <figcaption>Fresh coffee</figcaption>
          </figure>
          <figure>
            <span class="hour">09<small>h</small></span>
            <div class="rb"><img src="images/Final-56.jpg" alt="The pool at COLMO VILLA among the pines, Comporta" data-lightbox data-caption="A morning dip"></div>
            <figcaption>A morning dip</figcaption>
          </figure>
          <figure>
            <span class="hour">11<small>h</small></span>
            <div><img src="images/Final-61.jpg" alt="Bicycles at COLMO VILLA, Comporta" data-lightbox data-caption="A run, or a bike ride"></div>
            <figcaption>A run, or a bike ride</figcaption>
          </figure>
          <figure>
            <span class="hour">14<small>h</small></span>
            <div class="day-typo-panel">
              <p>An off-road drive — the 4x4 is yours to take.</p>
            </div>
          </figure>
          <figure>
            <span class="hour">17<small>h</small></span>
            <div class="ra"><img src="images/37.jpg" alt="The gym at COLMO VILLA, Comporta" data-lightbox data-caption="The gym at COLMO VILLA, Comporta"></div>
            <figcaption>The gym</figcaption>
          </figure>
          <figure>
            <span class="hour">18<small>h</small></span>
            <div><img src="images/Final-50.jpg" alt="Chairs around the fire pit among the pines at COLMO VILLA, Comporta" data-lightbox data-caption="Evening by the fire"></div>
            <figcaption>Evening by the fire</figcaption>
          </figure>
          <figure>
            <span class="hour">19<small>h</small></span>
            <div class="rb"><img src="images/38.jpg" alt="The sauna &amp; Turkish bath at COLMO VILLA, Comporta" data-lightbox data-caption="Sauna &amp; Turkish bath"></div>
            <figcaption>Sauna &amp; Turkish bath</figcaption>
          </figure>
          <figure>
            <span class="hour">20<small>h</small></span>
            <div><img src="images/Final-53.jpg" alt="The pool at COLMO VILLA, Comporta, among the pines" data-lightbox data-caption="A swim"></div>
            <figcaption>A swim</figcaption>
          </figure>
          <figure>
            <span class="hour">22<small>h</small></span>
            <div class="ra"><img src="images/40.jpg" alt="The cinema room at COLMO VILLA, Comporta" data-lightbox data-caption="A film in the cinema"></div>
            <figcaption>A film in the cinema</figcaption>
          </figure>
        </div>
      </div>
    </div>
    <p class="day-close">Do it all, or """ + acc("nothing at all") + """.</p>
  </div>
</section>
"""
    return page("Days at Colmo · COLMO VILLA, Comporta",
                "A little time for everything: the pool, the cinema, the gym and the sauna &amp; Turkish bath, and a day at Colmo.",
                "days-at-colmo.html", body)

def comporta():
    body = """<section class="split intro around-intro">
  <div class="copy">
    <p class="kicker">Comporta</p>
    <p class="poetic">Pines behind, Atlantic <span class="acc">ahead</span>.</p>
    <h1 class="page-h1">Around Comporta</h1>
    <p class="classic lede">Beaches, rice fields, the village, restaurants.</p>
    <p>COLMO VILLA is in the Comporta Retreat, on the Alentejo coast. About 5 min to the beach · about 1h15 from Lisbon.</p>
  </div>
</section>
<section class="around">
  <div class="around-inner">
    <div class="around-photos">
      <figure>
        <img src="images/Final-58.jpg" alt="COLMO VILLA among the pines, Comporta, the Atlantic beyond" data-lightbox data-caption="The pines, and the Atlantic beyond">
        <figcaption>The pines, and the Atlantic beyond</figcaption>
      </figure>
      <figure>
        <img src="images/Final-5.jpg" alt="The pines of the Comporta Retreat around COLMO VILLA" data-lightbox data-caption="The pines of the Comporta Retreat">
        <figcaption>The pines of the Comporta Retreat</figcaption>
      </figure>
      <figure>
        <img src="images/Final-47.jpg" alt="The sand and the pines around the houses at COLMO VILLA, Comporta" data-lightbox data-caption="Around the houses">
        <figcaption>Around the houses</figcaption>
      </figure>
    </div>
    <div class="around-grid">
      <article class="around-card">
        <h2>The beaches</h2>
        <p>The Atlantic is close — about 5 min to the beach. Comporta, Carvalhal, Pego and Melides follow the shore from north to south.</p>
      </article>
      <article class="around-card">
        <h2>The rice fields</h2>
        <p>Rice fields are part of the landscape of the region, between the pines and the water.</p>
      </article>
      <article class="around-card">
        <h2>The village</h2>
        <p>Comporta village is the slow centre of the day: a few streets, shops, and somewhere to sit.</p>
      </article>
      <article class="around-card">
        <h2>Restaurants</h2>
        <p>There are restaurants in the village and around the area. Ask us for the ones we like when you write for dates.</p>
      </article>
    </div>
  </div>
</section>
<section class="around-guide" id="around-guide">
  <p class="kicker">Nearby</p>
  <h2 class="disp">A guide to what's <span class="acc">around</span>.</h2>
  <ul class="guide-cats">
    <li>Beaches</li>
    <li>Restaurants</li>
    <li>Grocery store</li>
    <li>Golf</li>
    <li>Walks and outings</li>
  </ul>
  <div class="guide-map-slot" role="presentation" aria-hidden="true"></div>
</section>
"""
    return page("Comporta · COLMO VILLA, Comporta",
                "Beaches, rice fields, the village and restaurants around COLMO VILLA. About 5 min to the beach · about 1h15 from Lisbon.",
                "comporta.html", body)


def availability():
    body = split("Availability", "Book the " + acc("house") + ".",
       "The house, for your people only.",
       ["A request is not a booking. Once we confirm, you will receive the terms and the payment to hold the dates."],
       "2.jpg", "The sitting room at COLMO VILLA, Comporta, at the end of the day", intro=True, h1="Request your dates") + """
<section class="band-dark">
  <div class="band-inner" style="max-width:40em">
    <p class="kicker">Confirmation</p>
    <p class="poetic">We reply within """ + acc("48 hours") + """.</p>
    <p>Write to us with your dates. We come back within two days, and nothing is held until we confirm.</p>
  </div>
</section>
<section class="split alt" style="grid-template-columns:1fr;max-width:820px">
  <div class="copy book-card avail-stack" style="background:transparent;padding:0;max-width:none">
    <div class="cal-wrap">
      <div class="cal-head">
        <button type="button" class="cal-nav cal-prev" aria-label="Previous month">&#8249;</button>
        <div class="cal-heading">
          <p class="cal-title">June 2027</p>
          <p class="cal-sub">An example stay</p>
        </div>
        <button type="button" class="cal-nav cal-next" aria-label="Next month">&#8250;</button>
      </div>
      <div class="cal" aria-label="Example calendar for June 2027">
        <span class="dow">Mon</span><span class="dow">Tue</span><span class="dow">Wed</span><span class="dow">Thu</span><span class="dow">Fri</span><span class="dow">Sat</span><span class="dow">Sun</span>
        <span class="empty"></span>
        <span class="busy">1</span><span class="busy">2</span><span class="busy">3</span><span class="busy">4</span><span class="busy">5</span><span class="busy">6</span>
        <span class="busy">7</span><span class="busy">8</span><span class="busy">9</span><span class="busy">10</span><span class="busy">11</span>
        <span class="open">12</span><span class="open">13</span>
        <span class="open">14</span><span class="open">15</span><span class="open">16</span><span class="open">17</span><span class="open">18</span>
        <span class="sel">19</span><span class="sel">20</span>
        <span class="sel">21</span><span class="sel">22</span><span class="sel">23</span><span class="sel">24</span><span class="sel">25</span>
        <span class="out">26</span>
        <span class="open">27</span>
        <span class="open">28</span><span class="open">29</span><span class="open">30</span>
        <span class="empty"></span><span class="empty"></span><span class="empty"></span><span class="empty"></span>
      </div>
      <p class="cal-legend">Sand: already reserved · Outline: open · Terracotta: 19–25 June, seven nights · Dashed: departure on the 26th.</p>
      <p class="cal-note">This calendar is an example, to show how a stay can look.</p>
    </div>
    <div class="rates">
      <h2 class="rates-title">Indicative rates</h2>
      <table>
        <thead><tr><th>Season</th><th>When</th><th>From</th></tr></thead>
        <tbody>
          <tr><td>Low</td><td>November–March, not festive</td><td>€1,850 / night · min. 4</td></tr>
          <tr><td>Mid</td><td>April, May, October</td><td>€2,400 / night · min. 4</td></tr>
          <tr><td>High</td><td>June, September, Christmas &amp; Easter</td><td>€3,200 / night · min. 5</td></tr>
          <tr><td>Peak</td><td>July and August</td><td>€3,900 / night · min. 7</td></tr>
        </tbody>
      </table>
      <div class="bill">
        Example: Saturday 19 to Saturday 26 June 2027, 14 guests.<br>
        7 nights in High season, 7 × €3,200 = €22,400, plus cleaning €550.<br>
        <strong>€22,950</strong> for the house. Security deposit, example: €1,500.
      </div>
      <p class="hint">Example terms: 30% to hold the dates once confirmed, the balance 60 days before arrival, free cancellation up to 60 days. Figures are indicative. The terms of a stay are confirmed in writing.</p>
    </div>
    <form id="book-form" class="form-block avail-form" method="post" action="#">
      <h2 class="form-title">Request these dates</h2>
      <div class="form-row">
        <label>Name <input type="text" name="name" required autocomplete="name"></label>
        <label>Email <input type="email" name="email" required autocomplete="email"></label>
      </div>
      <div class="form-row">
        <label>Arrival <input type="date" name="arrival" required></label>
        <label>Departure <input type="date" name="departure" required></label>
      </div>
      <div class="form-row">
        <label>Guests
          <select name="guests" required>
            <option value="" disabled selected>Choose</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="13">13</option>
            <option value="14">14</option>
            <option value="14+2">14+2</option>
          </select>
        </label>
      </div>
      <label>Message <textarea name="message" rows="4" placeholder="Tell us a little about the stay."></textarea></label>
      <button class="btn" type="submit">Request dates</button>
      <p class="mail-note">Or write to <a href="mailto:colmovillacomporta@gmail.com">colmovillacomporta@gmail.com</a>.</p>
      <p class="book-confirm" id="book-confirm" hidden>Thank you. Your request has been sent, and we will come back to you.</p>
      <p class="book-fallback" id="book-fallback" hidden>If your email did not open, write to <a href="mailto:colmovillacomporta@gmail.com">colmovillacomporta@gmail.com</a> with your dates.</p>
      <p class="book-error" id="book-error" hidden>The request could not be sent. Please write to <a href="mailto:colmovillacomporta@gmail.com">colmovillacomporta@gmail.com</a>.</p>
    </form>
  </div>
</section>
"""
    return page("Availability · COLMO VILLA, Comporta",
                "Request dates at COLMO VILLA. We confirm within 48 hours. Indicative rates.",
                "availability.html", body)

def story():
    body = split("Our Story", "The refuge of " + acc("simplicity") + ".",
       "“Nothing was bought online.”",
       ["A house for friends, and for anyone who needs to stop. Under the reed, between the pines and the Atlantic. The pool, the gym, the sauna &amp; Turkish bath and the cinema are there when you want them — proof of a life lived slowly, not a list of features."],
       "Final-57.jpg", "Looking back at COLMO VILLA from the garden, Comporta", intro=True, h1="Our story") + split(
       "The way it was made", "Portuguese tradition, held " + acc("lightly") + ".",
       "What is natural, and lasts.",
       ["Time, and the quiet it needs. The materials of the place, the roof of the old huts, a contemporary house that does not raise its voice."],
       "Final-48.jpg", "Light through the interiors of COLMO VILLA, Comporta", flip=True, band=True) + """
<section class="band-dark">
  <div class="band-inner" style="text-align:center;max-width:28em;margin:0 auto">
    <img class="sketch" src="images/esquisso-cream.png" alt="" style="opacity:.7;margin-bottom:24px">
    <p class="kicker">The house</p>
    <h2 class="disp">Under the reed, between the pines and the """ + acc("Atlantic") + """.</h2>
    <p><a class="btn" href="the-house.html">Discover the house</a></p>
  </div>
</section>
"""
    return page("Our Story · COLMO VILLA, Comporta",
                "The refuge of simplicity. A house under the reed, between the pines and the Atlantic.",
                "our-story.html", body)

ARRIVE_MAP = '<div class="map-card rb"><svg class="cmap" viewBox="0 0 560 500" xmlns="http://www.w3.org/2000/svg" aria-label="Illustrated map of Comporta and surroundings, north to south">\n  <rect width="560" height="500" fill="#F1EBDD"/>\n  <path d="M0 0 H148 C170 80 150 150 168 230 C186 310 140 370 155 500 H0 Z" fill="#B7A58A"/>\n  <path d="M0 0 H128 C150 90 132 160 150 240 C168 320 122 380 136 500 H0 Z" fill="#B7A58A" opacity=".55"/>\n  <text x="36" y="250" fill="#514638" font-family="Jost,sans-serif" font-size="10" letter-spacing="3" font-weight="500">ATLANTIC</text>\n  <path d="M148 0 H560 V500 H155 C140 370 186 310 168 230 C150 150 170 80 148 0 Z" fill="#E2D7C2"/>\n  <g fill="none" stroke="#B7A58A" stroke-width="1" opacity=".7">\n    <path d="M400 230 h90 v70 h-90 z"/>\n    <path d="M408 244 h74 M408 258 h74 M408 272 h74 M408 286 h74"/>\n    <path d="M430 310 h70 v55 h-70 z"/>\n    <path d="M438 322 h54 M438 336 h54 M438 350 h54"/>\n  </g>\n  <text x="400" y="218" fill="#5E5D48" font-family="Jost,sans-serif" font-size="9" letter-spacing="1.6">RICE FIELDS</text>\n  <g fill="#77765B" opacity=".85">\n    <g transform="translate(288,188)"><path d="M0 22 L6 0 L12 22 Z"/><rect x="5" y="22" width="2" height="6"/></g>\n    <g transform="translate(308,176)"><path d="M0 26 L7 0 L14 26 Z"/><rect x="6" y="26" width="2" height="6"/></g>\n    <g transform="translate(328,196)"><path d="M0 20 L5 0 L10 20 Z"/><rect x="4" y="20" width="2" height="5"/></g>\n    <g transform="translate(298,210)"><path d="M0 18 L5 0 L10 18 Z"/><rect x="4" y="18" width="2" height="5"/></g>\n    <g transform="translate(318,222)"><path d="M0 16 L4 0 L8 16 Z"/><rect x="3.5" y="16" width="1.5" height="4"/></g>\n    <g transform="translate(278,226)"><path d="M0 20 L5 0 L10 20 Z"/><rect x="4" y="20" width="2" height="5"/></g>\n    <g transform="translate(338,214)"><path d="M0 22 L6 0 L12 22 Z"/><rect x="5" y="22" width="2" height="5"/></g>\n  </g>\n  <text x="300" y="178" fill="#5E5D48" font-family="Jost,sans-serif" font-size="9" letter-spacing="1.6">PINES</text>\n  <!-- North to south along the coast -->\n  <circle cx="152" cy="130" r="5" fill="#514638"/>\n  <text x="166" y="126" fill="#514638" font-family="Jost,sans-serif" font-size="11">Comporta beach</text>\n  \n  <circle cx="148" cy="210" r="5" fill="#514638"/>\n  <text x="162" y="206" fill="#514638" font-family="Jost,sans-serif" font-size="11">Carvalhal beach</text>\n  \n  <circle cx="145" cy="290" r="5" fill="#514638"/>\n  <text x="159" y="286" fill="#514638" font-family="Jost,sans-serif" font-size="11">Pego beach</text>\n  \n  <circle cx="150" cy="400" r="4.5" fill="#514638"/>\n  <text x="164" y="396" fill="#514638" font-family="Jost,sans-serif" font-size="11">Melides</text>\n  <text x="164" y="409" fill="#5E5D48" font-family="Jost,sans-serif" font-size="9">to the south</text>\n  <!-- Colmo -->\n  <circle cx="248" cy="262" r="7" fill="#A8573A"/>\n  <circle cx="248" cy="262" r="11" fill="none" stroke="#A8573A" stroke-width="1.2"/>\n  <text x="264" y="258" fill="#A8573A" font-family="Jost,sans-serif" font-size="12" font-weight="500" letter-spacing="0.8">COLMO VILLA</text>\n  <text x="264" y="272" fill="#5E5D48" font-family="Jost,sans-serif" font-size="9">Comporta Retreat</text>\n  <!-- village inland, near northern Comporta -->\n  <circle cx="355" cy="145" r="4.5" fill="#514638"/>\n  <text x="367" y="141" fill="#514638" font-family="Jost,sans-serif" font-size="11">Comporta village</text>\n  <text x="367" y="154" fill="#5E5D48" font-family="Jost,sans-serif" font-size="9">shops · restaurants</text>\n  <circle cx="340" cy="330" r="4.5" fill="#514638"/>\n  <text x="352" y="326" fill="#514638" font-family="Jost,sans-serif" font-size="11">Restaurants</text>\n  \n  <text x="430" y="48" fill="#5E5D48" font-family="Jost,sans-serif" font-size="9" letter-spacing="1.2">↑ LISBON</text>\n  <text x="430" y="62" fill="#5E5D48" font-family="Jost,sans-serif" font-size="9">airport</text>\n  <text x="36" y="480" fill="#5E5D48" font-family="Jost,sans-serif" font-size="8" letter-spacing="1">ILLUSTRATIVE · NOT TO SCALE · NORTH TO SOUTH</text>\n</svg></div>'

def contact():
    body = """
<section class="split intro" id="where-we-are">
  <div class="copy">
    <p class="kicker">Contact</p>
    <p class="poetic">In the Comporta Retreat, on the Alentejo """ + acc("coast") + """.</p>
    <h1 class="page-h1">Get in touch</h1>
    <p class="classic lede">Among the pines, in the Comporta area.</p>
    <p>COLMO VILLA sits in the Comporta Retreat, in Comporta, on the Alentejo coast. Pines and dunes around the house, the Atlantic beyond.</p>
    <p>The exact address will be shared once a stay is confirmed.</p>
  </div>
  <div class="media ra">
  <img src="images/Final-5.jpg" alt="The pines of the Comporta Retreat around COLMO VILLA" data-lightbox data-caption="The pines of the Comporta Retreat around COLMO VILLA">
</div>
</section>
<section class="band-dark arrive-map" id="how-to-arrive">
  <div class="band-inner">
    <h2 class="arrive-title">How to arrive</h2>
    <p class="poetic poetic-on-dark">North to south, along the """ + acc("coast") + """.</p>
    <p class="classic lede">Illustrative, not to scale.</p>
    """ + ARRIVE_MAP + """
  </div>
</section>
<section class="split flip alt">
  <div class="copy">
    <h2 class="disp">Write to """ + acc("us") + """.</h2>
    <p class="classic lede">For dates, or for a question about the house.</p>
    <p>Use the form on Availability, or write directly — for a stay, or for a chef or massages on request.</p>
    <p><a class="btn" href="availability.html">Request dates</a></p>
    <div class="contact-actions">
      <p class="mail-note"><a href="mailto:colmovillacomporta@gmail.com">colmovillacomporta@gmail.com</a></p>
      <p class="mail-note"><a href="https://www.instagram.com/colmo_villa_comporta_retreat_/" target="_blank" rel="noopener noreferrer">Follow on Instagram · @colmo_villa_comporta_retreat_</a></p>
    </div>
  </div>
  <div class="media rb">
  <img src="images/14.jpg" alt="A quiet corner of COLMO VILLA, Comporta" data-lightbox data-caption="A quiet corner of COLMO VILLA, Comporta">
</div>
</section>
"""
    return page("Contact · COLMO VILLA, Comporta",
                "Write to COLMO VILLA. We reply within 48 hours. In the Comporta Retreat, on the Alentejo coast. colmovillacomporta@gmail.com",
                "contact.html", body)

def policy_page(filename, title, desc, heading, lede, paras):
    body = """<section class="policy">
  <div class="policy-inner">
    <p class="kicker">Policies</p>
    <h1 class="page-h1">%s</h1>
    <p class="classic lede">%s</p>
    %s
  </div>
</section>
""" % (heading, lede, "".join("<p>%s</p>\n    " % p for p in paras))
    return page(title, desc, "", body, footer_current=filename)

def policies():
    mail = '<a href="mailto:colmovillacomporta@gmail.com">colmovillacomporta@gmail.com</a>'
    return {
        "privacy.html": policy_page(
            "privacy.html",
            "Privacy Policy · COLMO VILLA, Comporta",
            "Privacy Policy for COLMO VILLA. This page is a placeholder, to be completed.",
            "Privacy Policy",
            "This page is a placeholder.",
            [
                "The privacy policy for COLMO VILLA has not been written yet, and will be completed here.",
                "Nothing on this page should be read as a legal statement, or as a description of how personal data is handled. Until the policy is ready, write to %s if you have a question." % mail,
            ],
        ),
        "terms.html": policy_page(
            "terms.html",
            "Terms &amp; Conditions · COLMO VILLA, Comporta",
            "Terms and Conditions for COLMO VILLA. This page is a placeholder, to be completed.",
            "Terms and Conditions",
            "This page is a placeholder.",
            [
                "The terms and conditions for a stay at COLMO VILLA have not been written yet, and will be completed here.",
                "Nothing on this page should be read as a legal statement, or as the terms of a booking. Until they are ready, write to %s if you have a question." % mail,
            ],
        ),
        "cancellation.html": policy_page(
            "cancellation.html",
            "Cancellation Policy · COLMO VILLA, Comporta",
            "Cancellation Policy for COLMO VILLA. This page is a placeholder, to be completed.",
            "Cancellation Policy",
            "This page is a placeholder.",
            [
                "The cancellation policy for COLMO VILLA has not been written yet, and will be completed here.",
                "The figures and example terms on the Availability page are indicative only, and are not a policy. Until the cancellation policy is ready, write to %s if you have a question." % mail,
            ],
        ),
        "cookies.html": policy_page(
            "cookies.html",
            "Cookies · COLMO VILLA, Comporta",
            "Cookie notice for COLMO VILLA. This page is a placeholder, to be completed.",
            "Cookie notice",
            "This page is a placeholder.",
            [
                "A cookie notice for COLMO VILLA has not been written yet, and will be completed here.",
                "Nothing on this page should be read as a legal statement, or as a description of cookies in use. Until the notice is ready, write to %s if you have a question." % mail,
            ],
        ),
    }

def main():
    pages = {
        "index.html": home(),
        "the-house.html": house(),
        "gallery.html": gallery(),
        "days-at-colmo.html": experiences(),
        "comporta.html": comporta(),
        "availability.html": availability(),
        "contact.html": contact(),
    }
    pages.update(policies())
    for name, html in pages.items():
        (ROOT / name).write_text(html)
        print(name, len(html))
    stubs = [
        ("experiences.html", "days-at-colmo.html", "Days at Colmo · COLMO VILLA, Comporta", "Days at Colmo at COLMO VILLA, Comporta", False),
        ("the-moments.html", "days-at-colmo.html", "Days at Colmo · COLMO VILLA, Comporta", "Days at Colmo at COLMO VILLA, Comporta", False),
        ("our-story.html", "index.html#story", "COLMO VILLA · Private Villa in Comporta, Portugal", "The story of COLMO VILLA, Comporta", True),
    ]
    for name, dest, title, label, fixed in stubs:
        script = 'location.replace("%s");' % dest if fixed else 'location.replace("%s" + location.hash + location.search);' % dest
        html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%s</title>
<link rel="canonical" href="%s">
<meta http-equiv="refresh" content="0;url=%s">
<script>%s</script>
</head>
<body>
<p><a href="%s">%s</a></p>
</body>
</html>
""" % (title, dest, dest, script, dest, label)
        (ROOT / name).write_text(html)
        print(name, "redirect stub")
    print("built", len(pages) + len(stubs))

if __name__ == "__main__":
    main()
