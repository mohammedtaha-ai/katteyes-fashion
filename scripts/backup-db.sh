#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
TS=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$ROOT/backups"
mkdir -p "$BACKUP_DIR"
FILE="$BACKUP_DIR/katteyes-$TS.sql"
echo "== Backing up database to $FILE =="
docker compose exec -T mysql mysqldump -uroot -p"$DB_ROOT_PASSWORD" katteyes > "$FILE"
echo "OK: $FILE ($(wc -l < "$FILE") lines, $(du -h "$FILE" | cut -f1))"
