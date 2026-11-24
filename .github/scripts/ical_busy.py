"""Reads the private iCal feed of the COLMO VILLA Google Calendar (URL from the ICAL_URL secret)
and writes booked nights only: no titles, names, notes or colours.
A booking is an all-day event of at least MIN_NIGHTS nights. Timed events are ignored.
Events whose summary starts with [ORCAMENTO] (accent optional) and transparent events are left free."""
import json, os, sys, unicodedata, datetime as dt

DEFAULT_OUT = "v16/data/busy.json,v17/data/busy.json"

def unfold(raw):
    lines = []
    for ln in raw.replace("\r\n", "\n").split("\n"):
        if ln[:1] in (" ", "\t") and lines:
            lines[-1] += ln[1:]
        else:
            lines.append(ln)
    return lines

def unescape(v):
    out, i, s = [], 0, v or ""
    while i < len(s):
        if s[i] == "\\" and i + 1 < len(s):
            c = s[i + 1]
            out.append("\n" if c in "nN" else c)
            i += 2
        else:
            out.append(s[i]); i += 1
    return "".join(out)

def day(v):
    v = (v or "").strip()
    return dt.date(int(v[0:4]), int(v[4:6]), int(v[6:8])) if len(v) == 8 and v.isdigit() else None

def fold_key(s):
    s = unescape(s).strip()
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.casefold()

def is_quote(summary):
    return fold_key(summary).startswith("[orcamento]")

def parse_busy(raw, today=None, min_nights=2):
    today = today or dt.date.today()
    ranges, ev = [], None
    for ln in unfold(raw):
        if ln == "BEGIN:VEVENT":
            ev = {}
        elif ln == "END:VEVENT" and ev is not None:
            s, e = ev.get("DTSTART"), ev.get("DTEND")
            transp = unescape(ev.get("TRANSP") or "").strip().upper()
            status = unescape(ev.get("STATUS") or "").strip().upper()
            if (s and e and status != "CANCELLED" and transp != "TRANSPARENT"
                    and not is_quote(ev.get("SUMMARY") or "")
                    and (e - s).days >= min_nights and e > today):
                ranges.append([s, e])
            ev = None
        elif ev is not None and ":" in ln:
            k, v = ln.split(":", 1)
            name = k.split(";")[0].upper()
            if name in ("DTSTART", "DTEND"):
                ev[name] = day(v)
            elif name in ("STATUS", "TRANSP", "SUMMARY"):
                ev[name] = v
    ranges.sort()
    merged = []
    for s, e in ranges:
        if merged and s <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], e)
        else:
            merged.append([s, e])
    return [[s.isoformat(), e.isoformat()] for s, e in merged]

def write_busy(busy, paths, now=None):
    stamp = (now or dt.datetime.now(dt.timezone.utc)).strftime("%Y-%m-%dT%H:%MZ")
    payload = json.dumps({"updated": stamp, "busy": busy}, indent=1)
    changed = False
    for out in paths:
        old = None
        if os.path.exists(out):
            try:
                with open(out) as f:
                    old = json.load(f).get("busy")
            except Exception:
                pass
        if old == busy:
            continue
        os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
        with open(out, "w") as f:
            f.write(payload + "\n")
        changed = True
    return changed

def fetch_calendar(url):
    import time, urllib.request
    raw = None
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "colmo-villa-availability/1.0"})
            raw = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
            break
        except Exception as e:
            code = getattr(e, "code", type(e).__name__)
            print("Calendar fetch failed (%s), attempt %d" % (code, attempt + 1))
            time.sleep(20 * (attempt + 1))
    return raw

def main(argv=None, env=None):
    env = env if env is not None else os.environ
    url = (env.get("ICAL_URL") or "").strip()
    outs = [p.strip() for p in (env.get("OUT") or DEFAULT_OUT).split(",") if p.strip()]
    min_nights = int(env.get("MIN_NIGHTS") or "2")
    if not url:
        print("ICAL_URL secret is not set; nothing to do.")
        return 0
    raw = fetch_calendar(url)
    if raw is None or "BEGIN:VCALENDAR" not in raw:
        print("Could not read the calendar; busy.json left unchanged.")
        return 1
    busy = parse_busy(raw, min_nights=min_nights)
    if not write_busy(busy, outs):
        print("No change: %d ranges" % len(busy))
        return 0
    print("Updated: %d ranges" % len(busy))
    return 0

if __name__ == "__main__":
    sys.exit(main())
