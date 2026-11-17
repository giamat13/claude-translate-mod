"""Hebrew -> English offline translator. Reads stdin (UTF-8), writes translation to stdout.
Lines without Hebrew and fenced code blocks are left untouched."""
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
sys.stdin.reconfigure(encoding="utf-8")

import argostranslate.translate as t

HEB = re.compile(r"[֐-׿]")


def main():
    text = sys.stdin.read()
    out = []
    in_code = False
    for line in text.split("\n"):
        if line.strip().startswith("```"):
            in_code = not in_code
            out.append(line)
        elif in_code or not HEB.search(line):
            out.append(line)
        else:
            out.append(t.translate(line, "he", "en"))
    sys.stdout.write("\n".join(out))


main()
