#!/usr/bin/env bash
set -euo pipefail

SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/update-preview.sh"

chmod +x "$SCRIPT_PATH"

CRON_LINE="0 * * * * $SCRIPT_PATH"

if crontab -l 2>/dev/null | grep -qF "$SCRIPT_PATH"; then
  echo "Cron-задача уже установлена."
  exit 0
fi

(
  crontab -l 2>/dev/null || true
  echo "$CRON_LINE"
) | crontab -

echo "Cron-задача установлена: $CRON_LINE"