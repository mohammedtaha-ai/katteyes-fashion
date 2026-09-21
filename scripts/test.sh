#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "== Backend tests (phpunit/pest) =="
docker compose exec -T api php artisan test
echo
echo "== Frontend tests (vitest) =="
docker compose exec -T web npm test -- --run
