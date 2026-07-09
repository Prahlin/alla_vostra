#!/usr/bin/env bash
set -Eeuo pipefail

EMU="/Users/prahlin/Library/Android/sdk/emulator/emulator"
ADB="/Users/prahlin/Library/Android/sdk/platform-tools/adb"
MOB="/Users/prahlin/alla_vostra/mob"
APP_PACKAGE="com.anonymous.allavostramobile"
APP_ACTIVITY="${APP_PACKAGE}/.MainActivity"

LARGE_AVD="AllaVostra_Large_Android_API_35"
SMALL_AVD="AllaVostra_Small_Android_API_34"

LARGE_DEVICE="emulator-5554"
SMALL_DEVICE="emulator-5556"

start_emulator() {
  local avd="$1"
  local port="$2"
  shift 2

  local device="emulator-${port}"

  if "$ADB" devices | awk -v device="$device" '$1 == device { found = 1 } END { exit !found }'; then
    echo "$device is already present."
    return
  fi

  echo "Starting $avd on $device..."
  "$EMU" -avd "$avd" -port "$port" -no-snapshot-load "$@" \
    > "/tmp/${avd}.log" 2>&1 &
}

wait_for_boot() {
  local device="$1"

  echo "Waiting for $device..."

  until "$ADB" devices | awk -v device="$device" '$1 == device && $2 == "device" { found = 1 } END { exit !found }'; do
    sleep 2
  done

  until [ "$("$ADB" -s "$device" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
    sleep 2
  done

  echo "$device booted."
}

wait_for_metro() {
  echo "Waiting for Metro on localhost:8081..."

  until curl -sS --max-time 2 http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; do
    sleep 2
  done

  echo "Metro is running."
}

launch_app() {
  local device="$1"

  echo "Launching Alla Vostra on $device..."
  "$ADB" -s "$device" reverse tcp:8081 tcp:8081
  "$ADB" -s "$device" shell am force-stop "$APP_PACKAGE"
  "$ADB" -s "$device" shell am start -n "$APP_ACTIVITY"
}

launch_emulator_apps_when_ready() {
  wait_for_boot "$LARGE_DEVICE"
  wait_for_boot "$SMALL_DEVICE"
  wait_for_metro

  launch_app "$LARGE_DEVICE"
  launch_app "$SMALL_DEVICE"

  echo "Alla Vostra is running on Android Large and Android Small."
}

start_emulator "$LARGE_AVD" 5554 -gpu host
start_emulator "$SMALL_AVD" 5556

launch_emulator_apps_when_ready &

cd "$MOB"

echo "Starting Expo tunnel for your physical Android device."
echo "Scan the QR code with Expo Go when it appears."
npm run start -- --tunnel
