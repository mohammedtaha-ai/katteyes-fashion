#!/usr/bin/env bash
set -e
echo "== smoke =="
curl -fsSI http://localhost:8000/up >/dev/null && echo "✅ API /up"
curl -fsSI http://localhost:5173    >/dev/null && echo "✅ Web 5173"
curl -fsSI http://localhost:8080    >/dev/null && echo "✅ phpMyAdmin 8080"
curl -fsSI http://localhost:8025    >/dev/null && echo "✅ Mailpit 8025"
docker compose exec -T mysql mysqladmin ping -h127.0.0.1 -uroot -p"$DB_ROOT_PASSWORD" >/dev/null \
  && echo "✅ MySQL ping"