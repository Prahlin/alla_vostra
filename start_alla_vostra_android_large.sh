#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
EMU="${SDK}/emulator/emulator"
ADB="${SDK}/platform-tools/adb"
AVD="AllaVostra_Large_Android_API_35"
DEVICE="emulator-5554"
PORT="5554"
APP_PACKAGE="com.allavostra.app"
APP_ACTIVITY="${APP_PACKAGE}/.MainActivity"
METRO_PORT="${METRO_PORT:-8081}"
LOG="/tmp/${AVD}_${PORT}.log"
LAUNCHD_LABEL="com.allavostra.largeavd"
LAUNCHD_PLIST="${ROOT}/launchd/${LAUNCHD_LABEL}.plist"

if [ ! -x "$EMU" ]; then
  echo "Android emulator not found at $EMU"
  exit 1
fi

if [ ! -x "$ADB" ]; then
  echo "adb not found at $ADB"
  exit 1
fi

export ANDROID_HOME="$SDK"
export ANDROID_SDK_ROOT="$SDK"

if ! "$EMU" -list-avds | grep -qx "$AVD"; then
  echo "AVD $AVD was not found."
  echo "Check Android Studio Device Manager or run: $EMU -list-avds"
  exit 1
fi

if ! "$ADB" devices | awk -v device="$DEVICE" '$1 == device && $2 == "device" { found = 1 } END { exit !found }'; then
  echo "Starting $AVD on $DEVICE..."
  launchctl bootout "gui/$(id -u)/${LAUNCHD_LABEL}" >/dev/null 2>&1 || true
  launchctl bootstrap "gui/$(id -u)" "$LAUNCHD_PLIST"
fi

echo "Waiting for $DEVICE..."
until "$ADB" devices | awk -v device="$DEVICE" '$1 == device && $2 == "device" { found = 1 } END { exit !found }'; do
  sleep 1
done

until [ "$("$ADB" -s "$DEVICE" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
  sleep 1
done

actual_avd="$("$ADB" -s "$DEVICE" emu avd name 2>/dev/null | tr -d '\r' | sed -n '1p')"
if [ "$actual_avd" != "$AVD" ]; then
  echo "$DEVICE is running $actual_avd, not $AVD."
  exit 1
fi

"$ADB" -s "$DEVICE" reverse "tcp:${METRO_PORT}" "tcp:${METRO_PORT}" >/dev/null 2>&1 || true
"$ADB" -s "$DEVICE" shell am force-stop "$APP_PACKAGE"
"$ADB" -s "$DEVICE" shell am start -n "$APP_ACTIVITY"

echo "$APP_PACKAGE is running on $DEVICE ($AVD)."
"$ADB" -s "$DEVICE" shell wm size
"$ADB" -s "$DEVICE" shell wm density
