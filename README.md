# Katteyes Fashion

Full-stack rebuild of an Arabic RTL fashion store — **Laravel 11 API + React 18 SPA** in a Docker Desktop dev stack.

- **Backend** (`api/`): Laravel 11 · Sanctum (PAT) · MySQL 8 · Intervention Image
- **Frontend** (`web/`): React 18 · Vite · TypeScript · Tailwind CSS · shadcn/ui · TanStack Query · Zustand
- **Dev stack**: `docker-compose.yml` brings up MySQL + API + Web + Mailpit + phpMyAdmin
- **Checkout**: WhatsApp-based (no payment gateway in v1)
- **Auth**: Admin (email+password) + Customer (optional registration) + Anonymous guest checkout

## Status

🚧 **Early bootstrap** — implementation has not started yet. The architecture is fully designed and the task-by-task build plan is ready.

| | |
|---|---|
| 📐 Architecture spec | [`docs/superpowers/specs/2026-09-16-katteyes-fashion-design.md`](docs/superpowers/specs/2026-09-16-katteyes-fashion-design.md) |
| 🛠️ Implementation plan | [`docs/superpowers/plans/2026-09-17-katteyes-fashion-build.md`](docs/superpowers/plans/2026-09-17-katteyes-fashion-build.md) |
| 🗺️ Codebase roadmap (live) | [`docs/codebase/roadmap/`](docs/codebase/roadmap/) |

> The `codebase/roadmap/` directory is the cross-agent knowledge base — function catalog, project structure, and common commands. It is **updated after every task** so the next subagent or contributor can orient in seconds instead of searching the tree.

## Planned quick start

```bash
# Requires Docker Desktop 4.x+
bash scripts/setup.sh
```

This boots mysql + api + web + mailpit + phpmyadmin, runs migrations + seeds, and prints the URLs for each service.

If you prefer to run PHP/MySQL directly on your host (no Docker), see `LOCAL=1 bash scripts/setup.sh`.

## Legacy prototypes

The original single-file HTML prototypes are kept at the repo root as historical reference (the original is being rebuilt into the full-stack app above):

- `index.html` — original storefront
- `admin.html` — original admin panel

## What this repo contains (right now)

- ✅ The architecture spec, the implementation plan, the roadmap skeleton
- ⏳ The actual API code (Phase 2 onwards in the plan)
- ⏳ The actual React code (Phase 7 onwards in the plan)

## Tasks-to-code mapping

Every major decision and feature maps to a numbered task in the implementation plan. The plan is structured for TDD (failing test → impl → passing test → commit), so progress is reviewable task-by-task.

## License

TBD — added during Phase 9.
