"""Local unit tests for ical_busy.parse_busy, with a synthetic calendar. No network."""
import datetime as dt, os, sys, tempfile, unittest
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ical_busy as ib

TODAY = dt.date(2026, 11, 24)

def ics(*events):
    body = ["BEGIN:VCALENDAR", "VERSION:2.0"]
    for ev in events:
        body.append("BEGIN:VEVENT")
        body.extend(ev)
        body.append("END:VEVENT")
    body.append("END:VCALENDAR")
    return "\r\n".join(body) + "\r\n"

def ev(start, end, summary="Stay", transp=None, status=None, extra=None):
    rows = ["DTSTART;VALUE=DATE:" + start, "DTEND;VALUE=DATE:" + end, "SUMMARY:" + summary]
    if transp: rows.append("TRANSP:" + transp)
    if status: rows.append("STATUS:" + status)
    if extra: rows.extend(extra)
    return rows

class ParseBusy(unittest.TestCase):
    def parse(self, raw, min_nights=2):
        return ib.parse_busy(raw, today=TODAY, min_nights=min_nights)

    def test_confirmed_all_day_is_busy(self):
        raw = ics(ev("20270710", "20270717", "Family stay"))
        self.assertEqual(self.parse(raw), [["2027-07-10", "2027-07-17"]])

    def test_orcamento_prefix_excluded(self):
        raw = ics(ev("20270710", "20270717", "[ORÇAMENTO] Guest"))
        self.assertEqual(self.parse(raw), [])

    def test_orcamento_no_accent_lowercase_and_space(self):
        raw = ics(ev("20270710", "20270717", "  [orcamento] guest"))
        self.assertEqual(self.parse(raw), [])

    def test_orcamento_mixed_case_accent(self):
        raw = ics(ev("20270710", "20270717", "[Orçamento] Guest"))
        self.assertEqual(self.parse(raw), [])

    def test_orcamento_combining_cedilla(self):
        raw = ics(ev("20270710", "20270717", "[ORC\u0327AMENTO] Guest"))
        self.assertEqual(self.parse(raw), [])

    def test_folded_summary_excluded(self):
        raw = "BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20270710\r\nDTEND;VALUE=DATE:20270717\r\nSUMMARY:[ORÇA\r\n MENTO] Guest\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n"
        self.assertEqual(self.parse(raw), [])

    def test_escaped_summary_excluded(self):
        raw = ics(ev("20270710", "20270717", r"[ORÇAMENTO] Guest\, family"))
        self.assertEqual(self.parse(raw), [])

    def test_title_containing_tag_later_is_kept(self):
        raw = ics(ev("20270710", "20270717", "Hold [ORÇAMENTO] later"))
        self.assertEqual(self.parse(raw), [["2027-07-10", "2027-07-17"]])

    def test_transparent_excluded(self):
        raw = ics(ev("20270710", "20270717", "Stay", transp="TRANSPARENT"))
        self.assertEqual(self.parse(raw), [])

    def test_opaque_kept(self):
        raw = ics(ev("20270710", "20270717", "Stay", transp="OPAQUE"))
        self.assertEqual(self.parse(raw), [["2027-07-10", "2027-07-17"]])

    def test_cancelled_ignored(self):
        raw = ics(ev("20270710", "20270717", "Stay", status="CANCELLED"))
        self.assertEqual(self.parse(raw), [])

    def test_timed_event_ignored(self):
        raw = ics(["DTSTART:20270710T160000Z", "DTEND:20270717T110000Z", "SUMMARY:Stay"])
        self.assertEqual(self.parse(raw), [])

    def test_short_stay_ignored(self):
        raw = ics(ev("20270710", "20270711", "Stay"))
        self.assertEqual(self.parse(raw, min_nights=2), [])

    def test_past_end_ignored(self):
        raw = ics(ev("20260101", "20260108", "Stay"))
        self.assertEqual(self.parse(raw), [])

    def test_merges_overlapping(self):
        raw = ics(ev("20270710", "20270717", "A"), ev("20270715", "20270720", "B"))
        self.assertEqual(self.parse(raw), [["2027-07-10", "2027-07-20"]])

    def test_quote_and_confirmed_together(self):
        raw = ics(ev("20270710", "20270717", "[ORÇAMENTO] Maybe"), ev("20270801", "20270808", "Confirmed"))
        self.assertEqual(self.parse(raw), [["2027-08-01", "2027-08-08"]])

    def test_language_param_on_summary(self):
        raw = ics(["DTSTART;VALUE=DATE:20270710", "DTEND;VALUE=DATE:20270717", "SUMMARY;LANGUAGE=pt-PT:[ORÇAMENTO] Guest"])
        self.assertEqual(self.parse(raw), [])

    def test_write_busy_skips_unchanged(self):
        busy = [["2027-07-10", "2027-07-17"]]
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, "data", "busy.json")
            self.assertTrue(ib.write_busy(busy, [p], now=dt.datetime(2026, 11, 24, tzinfo=dt.timezone.utc)))
            self.assertFalse(ib.write_busy(busy, [p], now=dt.datetime(2026, 11, 25, tzinfo=dt.timezone.utc)))

if __name__ == "__main__":
    unittest.main()
