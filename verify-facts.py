#!/usr/bin/env python3
"""Fact-lock gate for index.html. Run from pratyasa-site/ before every commit.

Normalises the page (strips script/style/comments/tags, collapses whitespace)
BEFORE matching, because values are split across elements in the markup
(e.g. <span>10</span> <span>ag/mL</span>). Matching raw HTML would fail on
correct content and pass on broken content.
"""
import pathlib
import re
import sys

PAGE = pathlib.Path(__file__).resolve().parent / "index.html"

REQUIRED = [
    "429867", "202241053140",
    "16 September 2022", "24 April 2023",
    "National Institute of Technology",
    "N. Sandhyarani", "Tushar Pathak", "Haritha K", "Arun R", "Ravi Varma",
    "10 ag", "10 ng", "8.2", "71",
    "10.1021/acs.langmuir.5c00784",
    "research prototype",
]
# Phrase-level only. Never ban the bare word "approved" — the mandatory
# disclaimer says "not an approved or regulated diagnostic product".
FORBIDDEN = [
    "fda", "ce mark", "clinically proven", "clinically approved",
    "clinically validated", "for sale", "buy now", "guaranteed",
    "best-in-class",
]


def normalise(html: str) -> str:
    text = re.sub(r"<script\b.*?</script>", " ", html, flags=re.S | re.I)
    text = re.sub(r"<style\b.*?</style>", " ", text, flags=re.S | re.I)
    text = re.sub(r"<!--.*?-->", " ", text, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = text.replace("&nbsp;", " ").replace("&amp;", "&")
    return re.sub(r"\s+", " ", text)


def main() -> int:
    if not PAGE.exists():
        print(f"FACT-LOCK FAIL: {PAGE} does not exist")
        return 1
    text = normalise(PAGE.read_text(encoding="utf-8"))
    lower = text.lower()
    failures = [f"missing required: {s!r}" for s in REQUIRED if s not in text]
    failures += [f"forbidden phrase present: {s!r}" for s in FORBIDDEN if s in lower]
    if failures:
        print("FACT-LOCK FAIL")
        for f in failures:
            print(" -", f)
        return 1
    print(f"FACT-LOCK PASS ({len(REQUIRED)} required present, {len(FORBIDDEN)} forbidden absent)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
