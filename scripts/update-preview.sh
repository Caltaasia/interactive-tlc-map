#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$PROJECT_DIR/logs/update-preview.log"
TIMESTAMP="$(date '+%Y-%m-%d %H:%M:%S')"

mkdir -p "$(dirname "$LOG_FILE")"

echo "[$TIMESTAMP] Начало обновления production-превью..." >> "$LOG_FILE"

cd "$PROJECT_DIR"

docker compose build app-prod >> "$LOG_FILE" 2>&1

docker compose up -d --force-recreate app-prod >> "$LOG_FILE" 2>&1

echo "[$TIMESTAMP] Обновление завершено." >> "$LOG_FILE"