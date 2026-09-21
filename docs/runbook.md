# Runbook — Katteyes Fashion ops

Common operational tasks for the Katteyes Fashion deployment.

## View logs

```bash
# All services
docker compose logs -f

# Single service (api, web, mysql, mailpit, phpmyadmin)
docker compose logs -f api

# Last 100 lines only
docker compose logs --tail=100 api
```

## Database

### Backup (manual)

```bash
bash scripts/backup-db.sh
# → backups/katteyes-YYYYMMDD-HHMMSS.sql
```

### Automated daily backup

`backup:db --keep=7` runs at 03:00 UTC via Laravel scheduler (see
`api/routes/console.php`). Backups older than 7 days are pruned automatically.

### Restore from backup

```bash
# 1. Stop the app so no traffic competes with the import
docker compose stop api web

# 2. Pipe the dump into mysql
docker compose exec -T mysql mysql -uroot -p"$DB_ROOT_PASSWORD" katteyes < backups/katteyes-20260920-120000.sql

# 3. Restart
docker compose up -d
```

### Fresh database (dev only — drops everything)

```bash
bash scripts/fresh.sh
# Equivalent to: php artisan migrate:fresh --seed --force
```

### Connection troubleshooting

If the API logs `SQLSTATE[HY000] [2002] Connection refused`:

1. Confirm mysql container is healthy: `docker compose ps`
2. Check `DB_HOST=mysql` in `api/.env` (NOT `127.0.0.1` in Docker mode)
3. Verify `DB_ROOT_PASSWORD` matches between root `.env` and `docker-compose.yml`

## Mailpit (dev only)

Mailpit captures all outgoing mail. Visit <http://localhost:8025>.

If Mailpit isn't receiving mail:

1. Confirm mailpit container is up: `docker compose ps mailpit`
2. Check `api/.env` has `MAIL_HOST=mailpit` and `MAIL_PORT=1025`
3. Trigger a test mail: `docker compose exec api php artisan tinker` then
   `Mail::raw('hi', fn ($m) => $m->to('test@test')->subject('test'));`

In production, set `MAIL_MAILER=smtp` and point `MAIL_HOST` / `MAIL_PORT` /
`MAIL_USERNAME` / `MAIL_PASSWORD` at your real SMTP provider.

## Storage / file uploads

In dev, uploads go to `storage/app/public/` (the `public` disk).
`php artisan storage:link` creates the `public/storage` symlink so files
are reachable at `http://localhost:8000/storage/...`.

In production, switch to S3 by setting in `.env`:

```
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=katteyes-uploads
AWS_URL=https://katteyes-uploads.s3.amazonaws.com
```

To rotate S3 keys: edit `.env` with new keys + `docker compose restart api`.

## Orphan image cleanup

If you see 404s in browser console for `storage/products/...` paths:

```bash
# List orphans (no DB row referencing them)
docker compose exec api php artisan products:prune-images

# Actually delete them
docker compose exec api php artisan products:prune-images --delete
```

A daily prune runs at 04:00 UTC via scheduler. Use this command for ad-hoc
cleanup if a manual upload was interrupted mid-flight.

## Scaling advice

This v1 deployment is single-node (all 5 services on one VPS). To scale:

- **Read scaling:** Put nginx or Caddy in front of `api:8000` and
  `web:5173`. Use CDN for `web/dist/*` static assets.
- **DB scaling:** Move MySQL to a managed instance (RDS / PlanetScale /
  DigitalOcean Managed DB). Update `DB_HOST` accordingly.
- **Storage scaling:** Move to S3 (see above). Local disk doesn't survive
  container restarts in orchestrated environments (k8s, ECS, swarm).
- **Workers:** Currently no queue workers are needed (checkout is
  synchronous). If you add `SendOrderEmail` jobs later, add a `worker`
  service to `docker-compose.yml` running `php artisan queue:work`.

## Updating the app

```bash
git pull
bash scripts/setup.sh    # rebuilds containers + runs new migrations + npm install
```

Migrations are non-destructive in v1 (additive only). Destructive changes
go through a manual review.

## Emergency: API down

1. `docker compose ps` — is `api` running?
2. `docker compose logs --tail=200 api` — any fatal errors?
3. `docker compose restart api` — try a clean restart
4. `docker compose exec api php artisan migrate:status` — pending migrations?
5. If DB is corrupt: restore from backup (see above)