#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
cat <<EOF
== Deploy (stub) ==

This project does not yet have a production target configured.

To deploy:
1. Provision a VPS (Ubuntu 22.04+ / Debian 12+) with Docker + Docker Compose.
2. Copy .env.example to .env on the server and fill in:
   - APP_ENV=production, APP_DEBUG=false
   - DB_ROOT_PASSWORD, DB_PASSWORD, WHATSAPP_NUMBER
   - FRONTEND_URL=https://your-domain.com
   - FILESYSTEM_DISK=s3 + S3_* keys (or leave 'local' for VPS disk)
3. Copy api/.env.example to api/.env on the server and configure DB / mail.
4. Run: bash scripts/setup.sh
5. Add a reverse proxy (nginx or Caddy) in front of api:8000 and web:5173.
6. For SSL: use Caddy auto-TLS or certbot with nginx.

When ready, edit scripts/deploy.sh to actually push code (rsync / git pull / etc.).
EOF
exit 0
