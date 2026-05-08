#!/bin/bash

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
READ_SCRIPT="$PROJECT_DIR/read_project.sh"

echo "Watching alla_vostra for changes..."
echo "Leave this terminal running."
echo "Press Control + C to stop."
echo ""

LAST_STATE=""

while true; do
  CURRENT_STATE=$(find "$PROJECT_DIR" \
    -path "$PROJECT_DIR/.git" -prune -o \
    -path "$PROJECT_DIR/node_modules" -prune -o \
    -path "$PROJECT_DIR/.expo" -prune -o \
    -path "$PROJECT_DIR/dist" -prune -o \
    -path "$PROJECT_DIR/build" -prune -o \
    -path "$PROJECT_DIR/.next" -prune -o \
    -name "alla_vostra_PROJECT_SNAPSHOT.txt" -prune -o \
    -name "read_project.sh" -prune -o \
    -name "watch_project.sh" -prune -o \
    -type f \
    \( \
      -name "*.js" -o \
      -name "*.jsx" -o \
      -name "*.ts" -o \
      -name "*.tsx" -o \
      -name "*.json" -o \
      -name "*.css" -o \
      -name "*.scss" -o \
      -name "*.html" -o \
      -name "*.php" -o \
      -name "*.shtml" -o \
      -name "*.py" -o \
      -name "*.md" -o \
      -name "*.txt" \
    \) \
    -exec stat -f "%N %m %z" {} \; | sort)

  if [ "$CURRENT_STATE" != "$LAST_STATE" ]; then
    echo "Change detected. Updating snapshot..."
    bash "$READ_SCRIPT"
    LAST_STATE="$CURRENT_STATE"
    echo "Snapshot updated."
    echo ""
  fi

  sleep 2
done