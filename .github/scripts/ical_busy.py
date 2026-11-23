"""Reads the private iCal feed of the COLMO VILLA Google Calendar (URL from the ICAL_URL secret)
and writes v16/data/busy.json with booked nights only: no titles, names, notes or colours.
A booking is an all-day event of at least MIN_NIGHTS nights. Timed events are ignored."""
import json, os, sys, urllib.request, datetime as dt

URL = os.environ.get("ICAL_URL", "").strip()
OUT = os.environ.get("OUT", "v16/data/busy.json")
MIN_NIGHTS = int(os.environ.get("MIN_NIGHTS", "2"))
if not URL:
    print("ICAL_URL secret is not set; nothing to do."); sys.exit(0)

import time
raw = None
for attempt in range(4):                                   # errors never print the private address
    try:
        req = urllib.request.Request(URL, headers={"User-Agent": "colmo-villa-availability/1.0"})
        raw = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace"); break
    except Exception as e:
        code = getattr(e, "code", type(e).__name__)
        print("Calendar fetch failed (%s), attempt %d" % (code, attempt + 1)); time.sleep(20 * (attempt + 1))
if raw is None or "BEGIN:VCALENDAR" not in raw:
    print("Could not read the calendar; busy.json left unchanged."); sys.exit(1)
lines = []
for ln in raw.replace("\r\n", "\n").split("\n"):          # unfold folded lines
    if ln[:1] in (" ", "\t") and lines: lines[-1] += ln[1:]
    else: lines.append(ln)

def day(v):  # all-day values look like 20270703
    v = v.strip()
    return dt.date(int(v[0:4]), int(v[4:6]), int(v[6:8])) if len(v) == 8 and v.isdigit() else None

today = dt.date.today()
ranges, ev = [], None
for ln in lines:
    if ln == "BEGIN:VEVENT": ev = {}
    elif ln == "END:VEVENT" and ev is not None:
        s, e = ev.get("DTSTART"), ev.get("DTEND")
        if s and e and ev.get("STATUS", "").upper() != "CANCELLED" and (e - s).days >= MIN_NIGHTS and e > today:
            ranges.append([s, e])
        ev = None
    elif ev is not None and ":" in ln:
        k, v = ln.split(":", 1); name = k.split(";")[0].upper()
        if name in ("DTSTART", "DTEND"): ev[name] = day(v)
        elif name == "STATUS": ev[name] = v

ranges.sort()
merged = []
for s, e in ranges:                                        # join touching or overlapping stays
    if merged and s <= merged[-1][1]: merged[-1][1] = max(merged[-1][1], e)
    else: merged.append([s, e])
busy = [[s.isoformat(), e.isoformat()] for s, e in merged]

old = None
if os.path.exists(OUT):
    try: old = json.load(open(OUT)).get("busy")
    except Exception: pass
if old == busy:
    print("No change:", busy); sys.exit(0)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump({"updated": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "busy": busy}, open(OUT, "w"), indent=1)
print("Updated:", busy)
