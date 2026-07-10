#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="/Users/prahlin/alla_vostra"
EMU="/Users/prahlin/Library/Android/sdk/emulator/emulator"
ADB="/Users/prahlin/Library/Android/sdk/platform-tools/adb"
MOB="${ROOT}/mob"
SERVER="${ROOT}/server"
APP_PACKAGE="com.anonymous.allavostramobile"
APP_ACTIVITY="${APP_PACKAGE}/.MainActivity"

LARGE_AVD="AllaVostra_Large_Android_API_35"
SMALL_AVD="AllaVostra_Small_Android_API_34"

LARGE_DEVICE="emulator-5554"
SMALL_DEVICE="emulator-5556"

METRO_PORT="${METRO_PORT:-8081}"
SERVER_PORT="${SERVER_PORT:-3000}"
HOST_BACKEND_URL="http://localhost:${SERVER_PORT}"
DEVICE_BACKEND_URL="http://localhost:${SERVER_PORT}"
BACKEND_MODE="${BACKEND_MODE:-local}"
BACKEND_LOG="/tmp/alla_vostra_${BACKEND_MODE}_backend.log"
STRIPE_WEBHOOK_LOG="/tmp/alla_vostra_stripe_listen.log"
BACKEND_PID=""
STRIPE_WEBHOOK_PID=""

cleanup() {
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi

  if [ -n "$STRIPE_WEBHOOK_PID" ]; then
    kill "$STRIPE_WEBHOOK_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

load_env_file() {
  local file="$1"

  if [ ! -f "$file" ]; then
    return
  fi

  set -a
  set +u
  # shellcheck disable=SC1090
  source "$file"
  set -u
  set +a
}

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
  echo "Waiting for Metro on localhost:${METRO_PORT}..."

  until curl -sS --max-time 2 "http://localhost:${METRO_PORT}/status" 2>/dev/null | grep -q "packager-status:running"; do
    sleep 2
  done

  echo "Metro is running."
}

is_backend_running() {
  curl -fsS --max-time 2 "${HOST_BACKEND_URL}/api/health" >/dev/null 2>&1
}

start_stripe_webhook_forwarding() {
  if [ "${START_STRIPE_WEBHOOK_FORWARDING:-1}" != "1" ]; then
    echo "Stripe webhook forwarding disabled."
    return
  fi

  if ! command -v stripe >/dev/null 2>&1; then
    echo "Stripe CLI not found; skipping webhook forwarding."
    echo "Install Stripe CLI or set STRIPE_WEBHOOK_SECRET manually to test webhook-triggered Postmark order emails."
    return
  fi

  echo "Starting Stripe webhook forwarding to ${HOST_BACKEND_URL}/api/stripe-webhook..."
  : > "$STRIPE_WEBHOOK_LOG"
  stripe listen --forward-to "${HOST_BACKEND_URL}/api/stripe-webhook" \
    > "$STRIPE_WEBHOOK_LOG" 2>&1 &
  STRIPE_WEBHOOK_PID="$!"

  if [ -n "${STRIPE_WEBHOOK_SECRET:-}" ]; then
    echo "Using existing STRIPE_WEBHOOK_SECRET from the environment."
    return
  fi

  echo "Waiting briefly for Stripe CLI webhook signing secret..."
  for _ in $(seq 1 20); do
    local webhook_secret
    webhook_secret="$(grep -Eo 'whsec_[A-Za-z0-9_]+' "$STRIPE_WEBHOOK_LOG" 2>/dev/null | head -n 1 || true)"

    if [ -n "$webhook_secret" ]; then
      export STRIPE_WEBHOOK_SECRET="$webhook_secret"
      echo "Captured STRIPE_WEBHOOK_SECRET for this local backend session."
      return
    fi

    if ! kill -0 "$STRIPE_WEBHOOK_PID" >/dev/null 2>&1; then
      echo "Stripe CLI exited before a webhook secret was captured. See $STRIPE_WEBHOOK_LOG."
      return
    fi

    sleep 1
  done

  echo "Could not capture a Stripe webhook secret yet. Webhook forwarding log: $STRIPE_WEBHOOK_LOG"
}

start_backend() {
  load_env_file "${SERVER}/.env"
  load_env_file "${SERVER}/.env.local"

  if is_backend_running; then
    echo "Backend already running at ${HOST_BACKEND_URL}."
    return
  fi

  start_stripe_webhook_forwarding

  echo "Starting ${BACKEND_MODE} backend on ${HOST_BACKEND_URL}..."
  : > "$BACKEND_LOG"

  case "$BACKEND_MODE" in
    local)
      (
        cd "$SERVER"
        PORT="$SERVER_PORT" node local-dev-server.js
      ) > "$BACKEND_LOG" 2>&1 &
      ;;
    vercel)
      (
        cd "$SERVER"
        PORT="$SERVER_PORT" npm exec --yes vercel -- dev --listen "$SERVER_PORT"
      ) > "$BACKEND_LOG" 2>&1 &
      ;;
    *)
      echo "Unknown BACKEND_MODE '${BACKEND_MODE}'. Use 'local' or 'vercel'."
      exit 1
      ;;
  esac

  BACKEND_PID="$!"

  echo "Waiting for backend health check..."
  for _ in $(seq 1 60); do
    if is_backend_running; then
      echo "Backend is running at ${HOST_BACKEND_URL}."
      return
    fi

    if ! kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
      echo "Backend exited while starting. Last log lines:"
      tail -n 40 "$BACKEND_LOG" || true
      exit 1
    fi

    sleep 2
  done

  echo "Backend did not become healthy in time. Last log lines:"
  tail -n 40 "$BACKEND_LOG" || true
  exit 1
}

reverse_ports() {
  local device="$1"

  "$ADB" -s "$device" reverse "tcp:${METRO_PORT}" "tcp:${METRO_PORT}"
  "$ADB" -s "$device" reverse "tcp:${SERVER_PORT}" "tcp:${SERVER_PORT}"
}

launch_app() {
  local device="$1"

  echo "Launching Alla Vostra on $device..."
  reverse_ports "$device"
  "$ADB" -s "$device" shell am force-stop "$APP_PACKAGE"
  "$ADB" -s "$device" shell am start -n "$APP_ACTIVITY"
}

list_physical_android_devices() {
  "$ADB" devices | awk '$2 == "device" && $1 !~ /^emulator-/ { print $1 }'
}

launch_connected_physical_apps() {
  local device
  local found_device=0

  while IFS= read -r device; do
    found_device=1

    if "$ADB" -s "$device" shell pm path "$APP_PACKAGE" >/dev/null 2>&1; then
      launch_app "$device"
    else
      echo "Alla Vostra is not installed on physical device $device; skipping it."
      echo "Install the Android development build on $device, then rerun this script for Google Pay testing."
    fi
  done < <(list_physical_android_devices)

  if [ "$found_device" -eq 0 ]; then
    echo "No physical Android devices connected for Google Pay testing."
  fi
}

launch_emulator_apps_when_ready() {
  wait_for_boot "$LARGE_DEVICE"
  wait_for_boot "$SMALL_DEVICE"
  wait_for_metro

  launch_app "$LARGE_DEVICE"
  launch_app "$SMALL_DEVICE"
  launch_connected_physical_apps

  echo "Alla Vostra is running fullstack on Android Large and Android Small."
  echo "Emulators reach backend through adb reverse at ${DEVICE_BACKEND_URL}."
  echo "Connected physical Android devices also use adb reverse at ${DEVICE_BACKEND_URL}."
}

start_emulator "$LARGE_AVD" 5554 -gpu host
start_emulator "$SMALL_AVD" 5556

start_backend

launch_emulator_apps_when_ready &

cd "$MOB"

export EXPO_PUBLIC_STRIPE_PAYMENT_SHEET_URL="${DEVICE_BACKEND_URL}/api/payment-sheet"
export EXPO_PUBLIC_CONTACT_MESSAGE_URL="${DEVICE_BACKEND_URL}/api/contact-message"

echo "Starting Expo for Android emulator fullstack testing."
echo "Stripe payment route: ${EXPO_PUBLIC_STRIPE_PAYMENT_SHEET_URL}"
echo "Contact message route: ${EXPO_PUBLIC_CONTACT_MESSAGE_URL}"
echo "Backend log: ${BACKEND_LOG}"
echo "Stripe webhook log: ${STRIPE_WEBHOOK_LOG}"
npm run start -- --localhost
