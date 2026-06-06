#!/bin/bash

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEB_OUTPUT_FILE="$PROJECT_DIR/alla_vostra_WEB_PROJECT_SNAPSHOT.txt"
APP_OUTPUT_FILE="$PROJECT_DIR/alla_vostra_APP_PROJECT_SNAPSHOT.txt"

echo "Generating separate project snapshots..."
echo "Project directory: $PROJECT_DIR"
echo "Web snapshot: $WEB_OUTPUT_FILE"
echo "App snapshot: $APP_OUTPUT_FILE"
echo ""

write_header() {
  local output_file="$1"
  local snapshot_type="$2"

  cat > "$output_file" <<EOF
alla_vostra ${snapshot_type} PROJECT SNAPSHOT
Generated: $(date)
Project directory: $PROJECT_DIR

IMPORTANT INSTRUCTIONS FOR CHATGPT & CODEX:
1. Read this entire snapshot before giving code edits.
2. Preserve all assets, spacing, alignment, fonts, images, layout, animations, and relative positioning unless specifically asked to change them.
3. Do not remove unrelated code.
4. Do not rewrite large sections unless requested.
5. When giving code changes, include exact line/row numbers whenever possible.
6. Print full scripts when requested.
7. Treat this project structure as the source of truth.
8. If you don't understand something, ask for clarification instead of making assumptions.
9. Warn me, or at least caution me, if I ask for something that would break the project or cause it to not work as intended.

10. Memorize these commands as dictionary abbreviations:
cur = current
img = image
prev = previous
fut = future
scr = scroll

11. Memorize these commands for how to respond to future requests:
pfs = print full script
pos = point out relevant script snippet only
pob = point out relevant script block only
e = explain/elaborate what you mean
fsd = this is the final script I decided on
rf = better, but refine further
u = unchanged
dr = disregard my last comment
r = reverse
sni = please provide the script, NOT an image mockup
fnr = finished loading, but no response/reaction
cm = please compose a brief commit message of the changes performed since the last commit


============================================================
PROJECT FILE TREE
============================================================

EOF
}

print_file() {
  local output_file="$1"
  local file="$2"

  if [ -f "$file" ]; then
    {
      echo ""
      echo ""
      echo "============================================================"
      echo "FILE: ${file#$PROJECT_DIR/}"
      echo "============================================================"
      echo ""
      nl -ba "$file"
    } >> "$output_file"
  fi
}

write_app_snapshot() {
  write_header "$APP_OUTPUT_FILE" "APP / MOBILE"

  find "$PROJECT_DIR/mob" \
    -path "$PROJECT_DIR/mob/node_modules" -prune -o \
    -path "$PROJECT_DIR/mob/.expo" -prune -o \
    -path "$PROJECT_DIR/mob/.cache" -prune -o \
    -path "$PROJECT_DIR/mob/.metro" -prune -o \
    -path "$PROJECT_DIR/mob/.turbo" -prune -o \
    -print | sort >> "$APP_OUTPUT_FILE"

  cat >> "$APP_OUTPUT_FILE" <<EOF


============================================================
FILE CONTENTS — APP / MOBILE SOURCE
============================================================

EOF

  for file in \
    "$PROJECT_DIR/mob/app/_layout.js" \
    "$PROJECT_DIR/mob/app/index.js" \
    "$PROJECT_DIR/mob/app/products.js" \
    "$PROJECT_DIR/mob/app/aboutus.js" \
    "$PROJECT_DIR/mob/app/contact.js" \
    "$PROJECT_DIR/mob/app/shop.js" \
    "$PROJECT_DIR/mob/components/AppHeader.js" \
    "$PROJECT_DIR/mob/components/PageDivider.js" \
    "$PROJECT_DIR/mob/components/ProductCard.js" \
    "$PROJECT_DIR/mob/components/ScreenFade.js" \
    "$PROJECT_DIR/mob/components/ShippingPromo.js" \
    "$PROJECT_DIR/mob/styles/headerStyles.js" \
    "$PROJECT_DIR/mob/styles/sharedStyles.js" \
    "$PROJECT_DIR/mob/styles/productsStyles.js" \
    "$PROJECT_DIR/mob/styles/aboutusStyles.js" \
    "$PROJECT_DIR/mob/styles/contactStyles.js" \
    "$PROJECT_DIR/mob/styles/shopStyles.js" \
    "$PROJECT_DIR/mob/utils/headerScrollContext.js" \
    "$PROJECT_DIR/mob/utils/openPaymentLink.js" \
    "$PROJECT_DIR/mob/data/products.js" \
    "$PROJECT_DIR/mob/app.json" \
    "$PROJECT_DIR/mob/package.json" \
    "$PROJECT_DIR/mob/babel.config.js"
  do
    print_file "$APP_OUTPUT_FILE" "$file"
  done

  cat >> "$APP_OUTPUT_FILE" <<EOF


============================================================
NOT INCLUDED IN APP SNAPSHOT
============================================================

The app snapshot intentionally excludes generated/cache/runtime directories:
- mob/node_modules
- mob/.expo
- mob/.cache
- mob/.metro
- mob/.turbo

EOF
}

write_web_snapshot() {
  write_header "$WEB_OUTPUT_FILE" "WEB / DESKTOP"

  find "$PROJECT_DIR" \
    -path "$PROJECT_DIR/.git" -prune -o \
    -path "$PROJECT_DIR/mob" -prune -o \
    -path "$PROJECT_DIR/.expo" -prune -o \
    -path "$PROJECT_DIR/.expo-shared" -prune -o \
    -path "$PROJECT_DIR/.metro" -prune -o \
    -path "$PROJECT_DIR/.cache" -prune -o \
    -path "$PROJECT_DIR/.turbo" -prune -o \
    -print | sort >> "$WEB_OUTPUT_FILE"

  cat >> "$WEB_OUTPUT_FILE" <<EOF


============================================================
FILE CONTENTS — WEB / DESKTOP SOURCE
============================================================

EOF

  for file in \
    "$PROJECT_DIR/index.html" \
    "$PROJECT_DIR/layout-styles.css" \
    "$PROJECT_DIR/style.css" \
    "$PROJECT_DIR/other/index.html" \
    "$PROJECT_DIR/other/products.html" \
    "$PROJECT_DIR/other/aboutus.html" \
    "$PROJECT_DIR/other/contact.html" \
    "$PROJECT_DIR/other/shop.html" \
    "$PROJECT_DIR/other/assets/js/header.js" \
    "$PROJECT_DIR/other/assets/css/shared.css" \
    "$PROJECT_DIR/other/assets/css/base.css" \
    "$PROJECT_DIR/other/assets/css/header.css" \
    "$PROJECT_DIR/other/assets/css/index.css" \
    "$PROJECT_DIR/other/assets/css/products.css" \
    "$PROJECT_DIR/other/assets/css/aboutus.css" \
    "$PROJECT_DIR/other/assets/css/contact.css" \
    "$PROJECT_DIR/other/assets/css/shop.css" \
    "$PROJECT_DIR/other/assets/css/layout.css" \
    "$PROJECT_DIR/other/assets/css/responsive.css" \
    "$PROJECT_DIR/other/assets/css/debug.css" \
    "$PROJECT_DIR/other/script.js" \
    "$PROJECT_DIR/other/shop.js"
  do
    print_file "$WEB_OUTPUT_FILE" "$file"
  done

  cat >> "$WEB_OUTPUT_FILE" <<EOF


============================================================
FILE CONTENTS — ROOT / TOOLING
============================================================

EOF

  for file in \
    "$PROJECT_DIR/.gitignore" \
    "$PROJECT_DIR/read_project.sh" \
    "$PROJECT_DIR/package.json"
  do
    print_file "$WEB_OUTPUT_FILE" "$file"
  done

  cat >> "$WEB_OUTPUT_FILE" <<EOF


============================================================
NOT INCLUDED IN WEB SNAPSHOT
============================================================

The web snapshot intentionally excludes:
- .git
- mob/
- .expo
- .expo-shared
- .metro
- .cache
- .turbo

The mobile app now has its own separate snapshot:
- alla_vostra_APP_PROJECT_SNAPSHOT.txt

EOF
}

write_app_snapshot
write_web_snapshot

echo "Done."
echo ""
echo "Snapshots created here:"
echo "$APP_OUTPUT_FILE"
echo "$WEB_OUTPUT_FILE"
echo ""
echo "Open them with:"
echo "open \"$APP_OUTPUT_FILE\""
echo "open \"$WEB_OUTPUT_FILE\""