#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "== Fresh database (drops all + re-migrate + seed) =="
docker compose exec -T api php artisan migrate:fresh --seed --force
