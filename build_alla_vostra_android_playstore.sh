#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOB="${ROOT}/mob"
JAVA17_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
PROFILE="${1:-production}"

if [ "$PROFILE" = "--help" ] || [ "$PROFILE" = "-h" ]; then
  cat <<'EOF'
Usage: ./build_alla_vostra_android_playstore.sh [profile]

Profiles:
  playTest     Build a Play-uploadable AAB using preview/test env vars.
  production   Build a Play-uploadable AAB using production env vars.

Default profile: production
EOF
  exit 0
fi

if [ ! -x "${JAVA17_HOME}/bin/java" ]; then
  echo "Java 17 was not found at ${JAVA17_HOME}."
  echo "Install it with: brew install openjdk@17"
  exit 1
fi

cd "$MOB"

if ! npx eas-cli whoami >/dev/null 2>&1; then
  echo "EAS is not logged in."
  echo "Run: cd ${MOB} && npx eas-cli login"
  exit 1
fi

export JAVA_HOME="$JAVA17_HOME"
export EAS_NO_VCS=1
npx eas-cli build --platform android --profile "$PROFILE"
