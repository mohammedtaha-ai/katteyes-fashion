# Common Commands

> Quick reference. The full versions live in `scripts/*` after Phase 9; until then, use these.

## Docker (primary)

```bash
# First-time setup
bash scripts/setup.sh                          # boot from zero with Docker
LOCAL=1 bash scripts/setup.sh                  # fallback: PHP + MySQL on host (Herd)

# Run-time
docker compose up -d                           # start all 5 services
docker compose down                            # stop (volumes kept)
docker compose down -v                         # stop + delete volumes (DESTRUCTIVE)
docker compose ps                              # status
docker compose logs -f api                     # tail API logs
docker compose logs -f web                     # tail Vite logs

# Smoke test (all services reachable)
bash scripts/smoke.sh

# Stop one service
docker compose stop web

# Rebuild after Dockerfile change
docker compose build --no-cache api
```

## Backend (`api/` inside container)

```bash
# Tests
docker compose exec api php artisan test                            # all
docker compose exec api php artisan test --filter=Order             # by name
docker compose exec api php artisan test --coverage                 # coverage report
docker compose exec api vendor/bin/pint --test                     # code style

# DB
docker compose exec api php artisan migrate
docker compose exec api php artisan migrate:fresh --seed           # DESTRUCTIVE
docker compose exec api php artisan db:seed --class=CategorySeeder  # one seeder
docker compose exec api php artisan storage:link

# Custom artisan commands (Phase 9.7)
docker compose exec api php artisan products:prune-images
docker compose exec api php artisan products:prune-images --delete
docker compose exec api php artisan backup:db --keep=7

# Composer
docker compose exec api composer require <package> --no-interaction
docker compose exec api composer require --dev <package>

# PHP shell
docker compose exec api php artisan tinker
```

## Frontend (`web/` inside container)

```bash
# Tests
docker compose exec web npm test                       # one-shot
docker compose exec web npm run test:watch             # dev mode
docker compose exec web npm run test:coverage          # coverage
docker compose exec web npm run lint                   # eslint
docker compose exec web npm run type-check             # tsc --noEmit

# Build
docker compose exec web npm run build                  # production build → dist/
docker compose exec web npm run preview                # preview production build

# Add a package
docker compose exec web npm install <package>
docker compose exec web npm install -D <package>       # devDependency
```

## Database (MySQL inside container)

```bash
# Connect
docker compose exec mysql mysql -uroot -p$DB_ROOT_PASSWORD $DB_DATABASE

# Backup
docker compose exec -T mysql mysqldump -uroot -p$DB_ROOT_PASSWORD $DB_DATABASE | gzip > backup.sql.gz

# Restore
gunzip < backup.sql.gz | docker compose exec -T mysql mysql -uroot -p$DB_ROOT_PASSWORD $DB_DATABASE
```

## Sanity checks

```bash
# Laravel health
curl -s http://localhost:8000/up | head -5

# Vite up
curl -sI http://localhost:5173 | head -2

# phpMyAdmin
open http://localhost:8080

# Mailpit inbox (sees emails sent by Laravel)
open http://localhost:8025

# CORS check
curl -sI -X OPTIONS http://localhost:8000/api/v1/categories \
  -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: GET' | grep -i access-control

# Login as the seeded admin
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@katteyes.test","password":"password"}' | jq
```

## Web URLs in dev

| Service | URL |
|---|---|
| Storefront (Vite) | <http://localhost:5173> |
| API root | <http://localhost:8000/api/v1> |
| API health | <http://localhost:8000/up> |
| Admin login redirect | <http://localhost:5173/login> → after login → <http://localhost:5173/admin/products> |
| phpMyAdmin | <http://localhost:8080> |
| Mailpit | <http://localhost:8025> |
