# Katteyes Fashion — Project Instructions

> These instructions apply to every Claude Code session on this repo. The user
> converses in Arabic; respond in Arabic unless they ask otherwise. Code, commits,
> and identifiers stay in English.

## Stack

- **Backend:** Laravel 11 (`api/`) — PHP 8.3, MySQL 8.4, Sanctum bearer tokens,
  Pest 3 + PHPUnit 12. Admin-driven catalog (no seeders for products/categories).
- **Frontend:** React 19 + Vite 8 + TypeScript (`web/`) — Tailwind v3, shadcn/ui
  primitives, TanStack Query v5, Zustand 5 with persist middleware, MSW for tests,
  RHF + Zod for forms. react-dropzone + @dnd-kit for admin uploads.
- **Infra:** Docker Compose — 5 services: `mysql`, `mailpit`, `phpmyadmin`, `api`,
  `web`. **Never** run npm/composer/artisan on the Windows host.
- **WhatsApp checkout:** no payment gateway in v1. `WHATSAPP_NUMBER=967713301759`,
  currency `YER`.

## Mandatory workflow rules

1. **All tooling inside Docker.** Use `docker compose exec -T web …` for npm/vitest/tsc
   and `docker compose exec -T api …` for composer/php artisan/test. Bash on Windows
   uses forward slashes (`F:/workeprojects/katteyes_fashion`).
2. **Plan before code.** New work goes in `docs/superpowers/plans/YYYY-MM-DD-<name>.md`
   with checkbox steps, then dispatched as tasks via subagent-driven-development.
3. **SDD ledger.** Every task updates `.superpowers/sdd/<plan>/progress.md` with
   one of: `complete (commits a..b, review clean)`, `fix round R/5 (X, Y open)`, or
   `parked — <finding> — Ruling: <why>`.
4. **Each task = implementer subagent + reviewer subagent.** Controller adjudicates
   concerns. Two commits per task when the brief requests (feat + docs).
5. **Roadmap is the cross-agent knowledge base.** Every task appends `Component →
   path:line — description` to `docs/codebase/roadmap/functions.md`.
6. **Source contracts are mandatory** for stateful sources (Zustand stores, the
   axios client). Store under `docs/contracts/...` mirroring source paths; the
   integrity test `web/src/__tests__/contracts/source-contracts.test.ts` enforces
   schema + `tested_by` linkage. See `docs/superpowers/plans/2026-10-10-core-source-contracts-and-architecture.md`.

## Frontend conventions

- Path alias `@/*` → `web/src/*`. Resolved in `web/vite.config.ts` (dev) and
  `web/tsconfig.app.json` (build). If you add a new file using `@/`, both must
  know about it.
- `<QueryClientProvider>` + `<BrowserRouter>` wrap `<App />` in `web/src/main.tsx`.
  Don't wrap them again inside individual pages.
- TanStack Query v5 syntax only: `mutation.isError`, `mutation.isPending` (not
  `mutation.error` boolean). For test wrappers use `renderHook` + `QueryClientProvider`.
- Zustand stores: `useAuthStore` (token + user) and `useCartStore` (items, persisted
  under `katteyes_auth` / `katteyes_cart`). `updateQty(idx, delta)` no-ops on
  out-of-bounds idx (fixed in Task 8.3 hotfix).
- `formatCurrency` uses `ar-YE` locale → renders Arabic-Indic digits. Tests must
  match with `/YER/` or `/[\u0660-\u0669]/`, not `3,500.00`.
- `data?.data?.data` triple-wrap for AxiosResponse → Resource → Entity. Verified
  pattern in Tasks 8.1, 8.2, 8.4.
- Frontend dev server reads `web/.env` at startup only. After creating or editing
  it, `docker compose restart web`.
- `web/src/__tests__/mocks/handlers.ts` is MSW for tests only. Dev server hits the
  real API at `VITE_API_URL`.

## Backend conventions

- `api/.env` is the local override; `api/.env.example` is the template.
- Soft deletes on `products` and `categories` only. `restrictOnDelete` on
  product→category FK. `cascadeOnDelete` on product_image→product and
  order_item→order.
- Rate limit 60 req/min on `/auth/*` via `RateLimiter::for('auth')`.
- Spec §7.4 Arabic error messages are literal — keep them exact.
- Admin can CRUD products via dashboard. The seeder only seeds the admin user.
- `php artisan test` for backend (covers both Pest and PHPUnit tests in this repo).

## Git & releases

- Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
  unless the user overrides.
- Branch strategy: feature work on a topic branch, then merge to `main` with
  `--no-ff`. The plan's milestone completion step tags a release.
- Public repo: `github.com/mohammedtaha-ai/katteyes-fashion`.

## Sub-agent context budget

- Token budget is tight. Prefer parallel dispatch over sequential reads.
- Subagent returns: max 20 lines, one per file as `file:line — finding`.
- When dispatching implementers, include: the brief path, exact constraints
  (HARD list), the verified-true dev convention (e.g. "TS uses `data.data.data`
  triple-wrap"), and the report contract.
- Don't re-derive facts already in the plan/spec; reference them.

## Read before doing

- `docs/superpowers/specs/2026-09-16-katteyes-fashion-design.md` — the source-of-truth
  architecture spec.
- `docs/codebase/roadmap/functions.md` — the cross-agent knowledge base; append
  here, never duplicate elsewhere.
- The relevant plan's task brief in `docs/superpowers/plans/…` and the latest
  progress entry in `.superpowers/sdd/<plan>/progress.md`.

## If unsure

Ask. The user prefers clarification over rework. One short question beats
guessing. Never invent functions, file paths, or test names — verify by reading.
