# Katteyes Fashion

Full-stack rebuild of the original static-HTML store.

- **Backend:** Laravel 11 API (`api/`)
- **Frontend:** React 18 + Vite SPA (`web/`)
- **Database:** MySQL 8 (`docker/mysql-init/`)
- **Stack:** Tailwind + shadcn/ui + TanStack Query + Zustand

## Quick start (Docker Desktop)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Clone this repo
3. Run:
   ```bash
   cp .env.example .env
   bash scripts/setup.sh
   ```

Then open:

- Storefront: <http://localhost:5173>
- Admin login: `admin@katteyes.test` / `password` (defined in `.env`)
- phpMyAdmin: <http://localhost:8080>
- Mailpit: <http://localhost:8025>
- API health: <http://localhost:8000/up>

## Stack details

See `docs/superpowers/specs/2026-09-16-katteyes-fashion-design.md`.

## Tests

```bash
bash scripts/test.sh
```

## Deploy

See `scripts/deploy.sh` + `docs/runbook.md`.