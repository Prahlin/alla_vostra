#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="/Users/prahlin/alla_vostra"
MOB="${ROOT}/mob"
JAVA17_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"

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
npx eas-cli build --platform android --profile production
