#!/bin/bash

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Watching project:"
echo "$PROJECT_DIR"
echo ""
echo "Regenerating snapshot when relevant source files change..."
echo ""

fswatch -o \
  --exclude="/\\.git/" \
  --exclude="/node_modules/" \
  --exclude="/\\.expo/" \
  --exclude="/dist/" \
  --exclude="/build/" \
  --exclude="/\\.next/" \
  --exclude="\\.DS_Store$" \
  --exclude="alla_vostra_PROJECT_SNAPSHOT\\.txt$" \
  --exclude="read_project\\.sh$" \
  --exclude="watch_project\\.sh$" \
  --exclude="\\.pdf$" \
  --exclude="\\.zip$" \
  "$PROJECT_DIR" | while read -r event; do
    "$PROJECT_DIR/read_project.sh"
  done