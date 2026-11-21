#!/bin/sh

set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)

mac_ip=${EXPO_PUBLIC_API_HOST:-}
if [ -z "$mac_ip" ]; then
  mac_ip=$(ipconfig getifaddr en0 2>/dev/null || true)
fi
if [ -z "$mac_ip" ]; then
  mac_ip=$(ipconfig getifaddr en1 2>/dev/null || true)
fi

if [ -z "$mac_ip" ]; then
  echo "Could not find the Mac's Wi-Fi address. Set EXPO_PUBLIC_API_HOST manually."
  exit 1
fi

echo "Using chess API at http://${mac_ip}:8000"

(
  cd "$repo_root"
  exec server/.venv/bin/python -m uvicorn server.api.routes:app --reload --host 0.0.0.0 --port 8000
) &
server_pid=$!

cleanup() {
  kill "$server_pid" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

cd "$repo_root/client"
EXPO_PUBLIC_API_URL="http://${mac_ip}:8000" npx expo start --lan
