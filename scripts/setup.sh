#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "== Katteyes setup =="
[ -f .env ] || cp .env.example .env

if [ "${LOCAL:-0}" = "1" ]; then
  echo "LOCAL mode (no Docker)"
  command -v php    >/dev/null || { echo "PHP not found on host. Install Herd or PHP 8.3+."; exit 1; }
  command -v mysql  >/dev/null || { echo "mysql client not found."; exit 1; }
  cp api/.env.example api/.env
  sed -i 's/DB_HOST=mysql/DB_HOST=127.0.0.1/'  api/.env
  sed -i 's/MAIL_MAILER=smtp/MAIL_MAILER=log/' api/.env
  (cd api && composer install --no-interaction && php artisan key:generate && php artisan migrate --force --seed && php artisan storage:link)
  (cd web && npm install)
  echo "Run: (cd api && php artisan serve) + (cd web && npm run dev)"
else
  docker compose pull
  docker compose build --no-cache
  docker compose up -d mysql mailpit
  echo "Waiting for mysql..."
  until docker compose exec -T mysql mysqladmin ping -h127.0.0.1 -uroot -p"$DB_ROOT_PASSWORD" --silent 2>/dev/null; do sleep 2; done
  docker compose up -d api web phpmyadmin
  docker compose exec -T api composer install --no-interaction
  docker compose exec -T api php artisan key:generate
  docker compose exec -T api php artisan migrate --force --seed
  docker compose exec -T api php artisan storage:link
  docker compose exec -T web npm install
  echo "API:        http://localhost:${API_PORT:-8000}"
  echo "Web:        http://localhost:${WEB_PORT:-5173}"
  echo "phpMyAdmin: http://localhost:${PHPMYADMIN_PORT:-8080}"
  echo "Mailpit:    http://localhost:${MAILPIT_PORT:-8025}"
fi
