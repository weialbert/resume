#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Checking resume outputs..."

# Check dependency
if ! command -v pdfinfo >/dev/null 2>&1; then
  echo "pdfinfo not found"
  echo "Install it with:"
  echo "  macOS:   brew install poppler"
  echo "  Ubuntu: sudo apt install poppler-utils"
  exit 1
fi

# Build
uv run make all

# Check outputs
for f in \
  build/resume.pdf \
  build/resume.html \
  build/resume.md \
  build/index.html
do
  test -f "$f" || {
    echo "Missing output: $f"
    exit 1
  }
done

# Page count
PAGE_COUNT=$(pdfinfo build/resume.pdf | awk '/Pages/ {print $2}')

echo "PDF pages: $PAGE_COUNT"

if [ "$PAGE_COUNT" != "1" ]; then
  echo "resume.pdf must be exactly 1 page"
  exit 1
fi

echo "Resume checks passed"

uv run make clean