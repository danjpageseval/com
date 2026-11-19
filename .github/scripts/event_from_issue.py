#!/usr/bin/env python3
"""Turn an approved event issue (from .github/ISSUE_TEMPLATE/event-*.yml) into
docs/_events/<year>/<id>.md, downloading an attached logo.

Reads ISSUE_TITLE, ISSUE_BODY and ISSUE_NUMBER from the environment. On success
writes `path`, `id` and `title` to $GITHUB_OUTPUT. On a validation problem it
writes the reasons to event-errors.md and exits 1.
"""
import json
import os
import re
import sys
import unicodedata
import urllib.parse
import urllib.request
from datetime import date
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

DOCS = "docs"
LOGO_DIR = "assets/images/events"
MAX_LOGO_BYTES = 1_000_000
LOGO_HOSTS = ("github.com", "user-images.githubusercontent.com", "private-user-images.githubusercontent.com")
TYPES = {"Conference": "conference", "Meetup": "meetup", "Training": "training",
         "Hackathon": "hackathon", "Deadline": "deadline"}
ECOSYSTEMS = {"BEAM (several languages)": "beam", "Elixir": "elixir", "Erlang": "erlang",
              "Gleam": "gleam", "LFE": "lfe", "Non-BEAM (Other)": "other"}
# Issue form labels -> keys (must match the labels in the issue forms).
LABELS = {
    "Event name": "title", "Organizer": "organizer", "Event URL": "url", "Location": "location",
    "Start date": "start_date", "Start time": "start_time", "End date": "end_date", "End time": "end_time",
    "Opens date": "opens_date", "Closes date": "closes_date", "Closes time": "closes_time",
    "Time zone": "timezone", "Ecosystem": "ecosystem", "Description": "description", "Logo": "logo",
    "Related events": "related", "Announcement URL": "announcement",
}

errors = []


def parse_body(body):
    fields = {}
    for block in re.split(r"^### ", body.replace("\r\n", "\n"), flags=re.M)[1:]:
        label, _, value = block.partition("\n")
        value = value.strip()
        if value == "_No response_":
            value = ""
        key = LABELS.get(label.strip())
        if key:
            fields[key] = value
    return fields


def slug(text, max_len=60):
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")[:max_len].rstrip("-")


def check_date(name, value, required=True):
    if not value:
        if required:
            errors.append(f"{name} is required.")
        return ""
    try:
        date.fromisoformat(value)
    except ValueError:
        errors.append(f"{name} `{value}` is not a date in YYYY-MM-DD form.")
    return value


def check_time(name, value):
    if value and not re.fullmatch(r"([01]\d|2[0-3]):[0-5]\d", value):
        errors.append(f"{name} `{value}` is not a 24-hour HH:MM time.")
    return value


def check_url(name, value, required=True):
    if not value:
        if required:
            errors.append(f"{name} is required.")
        return ""
    parsed = urllib.parse.urlparse(value)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        errors.append(f"{name} `{value}` is not an http(s) URL.")
    return value


def stamp(day, time):
    return f"{day}T{time}" if day and time else day


def download_logo(text, base):
    match = re.search(r"https://[^\s)\"'>]+", text or "")
    if not match:
        return None
    url = match.group(0)
    host = urllib.parse.urlparse(url).netloc
    if host not in LOGO_HOSTS:
        errors.append(f"Logo must be an image uploaded to the issue (got a link to {host}).")
        return None
    req = urllib.request.Request(url, headers={"User-Agent": "eef-events-bot"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        ctype = resp.headers.get("Content-Type", "").split(";")[0]
        data = resp.read(MAX_LOGO_BYTES + 1)
    ext = {"image/png": ".png", "image/jpeg": ".jpg", "image/svg+xml": ".svg",
           "image/webp": ".webp", "image/gif": ".gif"}.get(ctype)
    if not ext:
        errors.append(f"Logo is not a PNG, JPG, SVG, WebP or GIF image ({ctype or 'unknown type'}).")
        return None
    if len(data) > MAX_LOGO_BYTES:
        errors.append("Logo is larger than 1 MB.")
        return None
    name = f"{base}{ext}"
    os.makedirs(os.path.join(DOCS, LOGO_DIR), exist_ok=True)
    with open(os.path.join(DOCS, LOGO_DIR, name), "wb") as f:
        f.write(data)
    return f"/{LOGO_DIR}/{name}"


def yaml_value(value):
    # JSON strings and lists are valid YAML flow scalars/sequences.
    return json.dumps(value, ensure_ascii=False)


def main():
    title = os.environ["ISSUE_TITLE"]
    number = os.environ["ISSUE_NUMBER"]
    m = re.match(r"\[Event: (\w+)\]", title)
    etype = TYPES.get(m.group(1)) if m else None
    if not etype:
        errors.append("The issue title must start with `[Event: <type>]` from an event form.")
        return finish()
    f = parse_body(os.environ["ISSUE_BODY"])

    name = f.get("title", "").strip()
    if not name:
        errors.append("Event name is required.")
    organizer = f.get("organizer", "").strip()
    if not organizer:
        errors.append("Organizer is required.")
    location = f.get("location", "").strip()
    if not location:
        errors.append("Location is required.")
    url = check_url("Event URL", f.get("url", "").strip())
    tz = f.get("timezone", "").strip()
    try:
        ZoneInfo(tz)
    except (ZoneInfoNotFoundError, ValueError):
        errors.append(f"Time zone `{tz}` is not an IANA time zone name such as Europe/Stockholm.")
    ecosystem = ECOSYSTEMS.get(f.get("ecosystem", ""), "")
    if not ecosystem:
        errors.append("Ecosystem is required.")

    fm = {"title": name, "type": etype}
    if etype == "deadline":
        opens = check_date("Opens date", f.get("opens_date", ""), required=False)
        closes = check_date("Closes date", f.get("closes_date", ""))
        closes_time = check_time("Closes time", f.get("closes_time", ""))
        if opens and closes and opens > closes:
            errors.append("Opens date is after the closes date.")
        if opens:
            fm["opens"] = opens
        fm["closes"] = stamp(closes, closes_time)
        first_day = closes
    else:
        start = check_date("Start date", f.get("start_date", ""))
        end = check_date("End date", f.get("end_date", ""))
        start_time = check_time("Start time", f.get("start_time", ""))
        end_time = check_time("End time", f.get("end_time", ""))
        if start and end and start > end:
            errors.append("Start date is after the end date.")
        fm["start"] = stamp(start, start_time)
        fm["end"] = stamp(end, end_time)
        first_day = start
    fm.update({"timezone": tz, "organizer": organizer, "location": location,
               "ecosystem": ecosystem, "link": url})

    related = [r.strip().lstrip("#") for r in f.get("related", "").split(",") if r.strip()]
    for r in related:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}-[a-z0-9-]+", r):
            errors.append(f"Related event `{r}` is not an event id such as 2026-05-18-code-beam-lite-stockholm-2026.")
    if related:
        fm["related"] = related
    announcement = check_url("Announcement URL", f.get("announcement", "").strip(), required=False)
    if announcement:
        fm["announcements"] = [{"title": "Announcement", "url": announcement}]
    fm["issue"] = int(number)

    if errors:
        return finish()

    event_id = f"{first_day}-{slug(name)}"
    year_dir = os.path.join(DOCS, "_events", first_day[:4])
    path = os.path.join(year_dir, f"{event_id}.md")
    n = 1
    while os.path.exists(path):
        n += 1
        path = os.path.join(year_dir, f"{event_id}-{n}.md")
    event_id = os.path.basename(path)[:-3]

    try:
        logo = download_logo(f.get("logo", ""), f"{slug(organizer, 40)}-{event_id[:10]}")
    except OSError as exc:
        errors.append(f"Logo could not be downloaded ({exc}).")
        logo = None
    if errors:
        return finish()
    if logo:
        fm["logo"] = logo

    lines = ["---"]
    for key, value in fm.items():
        if isinstance(value, list) and value and isinstance(value[0], dict):
            lines.append(f"{key}:")
            for item in value:
                lines.append("  - " + "\n    ".join(f"{k}: {yaml_value(v)}" for k, v in item.items()))
        else:
            lines.append(f"{key}: {yaml_value(value)}")
    lines.append("---")
    description = f.get("description", "").strip()
    os.makedirs(year_dir, exist_ok=True)
    with open(path, "w", encoding="utf-8") as out:
        out.write("\n".join(lines) + "\n" + description + "\n")

    with open(os.environ.get("GITHUB_OUTPUT", os.devnull), "a", encoding="utf-8") as gh:
        gh.write(f"path={path}\nid={event_id}\n")
        gh.write(f"title={name.replace(chr(10), ' ')}\n")
    print(f"wrote {path}")
    return 0


def finish():
    with open("event-errors.md", "w", encoding="utf-8") as out:
        out.write("This event could not be added automatically:\n\n")
        out.write("\n".join(f"- {e}" for e in errors) + "\n\n")
        out.write("Please edit the issue to fix these, then a maintainer can add the `approved` label again.\n")
    print("\n".join(errors), file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
