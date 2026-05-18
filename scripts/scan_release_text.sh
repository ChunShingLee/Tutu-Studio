#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-ios/TuTuVisionApp/TuTuVisionApp}"

python3 - "$ROOT_DIR" <<'PY'
from pathlib import Path
import re
import sys

root = Path(sys.argv[1])
if not root.exists():
    print(f"scan root not found: {root}", file=sys.stderr)
    sys.exit(1)

literal_pattern = re.compile(r'"([^"\\]|\\.)*"')
blocked_patterns = [
    ("TODO", re.compile(r"todo", re.IGNORECASE)),
    ("占位", re.compile(r"占位")),
    ("placeholder", re.compile(r"placeholder", re.IGNORECASE)),
    ("设计稿", re.compile(r"设计稿")),
    ("Lorem", re.compile(r"lorem", re.IGNORECASE)),
]
pure_image_pattern = re.compile(r"^\s*image\s*$", re.IGNORECASE)

violations = []

for path in sorted(root.rglob("*.swift")):
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except UnicodeDecodeError:
        continue

    for line_number, line in enumerate(lines, start=1):
        for match in literal_pattern.finditer(line):
            literal = match.group(0)[1:-1]

            for label, pattern in blocked_patterns:
                if pattern.search(literal):
                    violations.append((path, line_number, label, literal))

            if pure_image_pattern.match(literal):
                violations.append((path, line_number, "image", literal))

if violations:
    print("Blocked release text detected:")
    for path, line_number, label, literal in violations:
        print(f"{path}:{line_number}: [{label}] {literal}")
    sys.exit(1)

print(f"release text scan passed for {root}")
PY
