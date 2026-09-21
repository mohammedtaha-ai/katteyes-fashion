# api/ — Laravel 11 Backend

This is the Laravel 11 API for Katteyes Fashion.

## Running locally (Docker — preferred)

Already handled by `scripts/setup.sh` at the repo root. The `api` service in
`docker-compose.yml` mounts this folder, so any edit here triggers a reload
(thanks to PHP-FPM + `php artisan serve` in the container).

## Running outside Docker (Herd / XAMPP / native PHP)

```bash
cd api
cp .env.example .env
sed -i 's/DB_HOST=mysql/DB_HOST=127.0.0.1/' .env
sed -i 's/MAIL_MAILER=smtp/MAIL_MAILER=log/' .env
composer install
php artisan key:generate
php artisan migrate --force --seed
php artisan storage:link
php artisan serve --port=8000
```

## Environment variables (key ones)

| Variable          | Purpose                                              | Example                          |
|-------------------|------------------------------------------------------|----------------------------------|
| APP_URL           | Public base URL of this API                          | `http://localhost:8000`           |
| FRONTEND_URL      | Where CORS allows requests from                      | `http://localhost:5173`           |
| DB_HOST           | MySQL host                                           | `mysql` (Docker) / `127.0.0.1`    |
| DB_DATABASE       | Database name                                        | `katteyes`                       |
| DB_USERNAME       | DB user                                              | `katteyes`                       |
| DB_PASSWORD       | DB password                                          | (set in `.env`)                  |
| MAIL_MAILER       | `smtp` in production, `log` locally                  | `log`                            |
| MAIL_HOST         | SMTP host (Mailpit in dev)                           | `mailpit`                        |
| MAIL_PORT         | SMTP port                                            | `1025`                           |
| WHATSAPP_NUMBER   | Phone number used in checkout WhatsApp links         | `967713301759`                   |
| FILESYSTEM_DISK   | `local` (default) or `s3`                            | `local`                          |
| ADMIN_EMAIL       | Admin login email (seeded)                           | `admin@katteyes.test`            |
| ADMIN_PASSWORD    | Admin login password (seeded)                        | `password`                       |

## Tests

```bash
docker compose exec api php artisan test
```

## Useful artisan commands

```bash
php artisan migrate:fresh --seed    # Drop all tables, re-migrate, re-seed
php artisan products:prune-images  # List orphan product image files
php artisan products:prune-images --delete
php artisan backup:db              # Dump MySQL → storage/backups/
php artisan storage:link           # Symlink public/storage → storage/app/public
```

## Folder structure

```
api/
├── app/
│   ├── Actions/        # Single-purpose business logic (CreateOrderAction, UploadImageAction)
│   ├── Console/Commands/  # Custom artisan commands (Task 9.7)
│   ├── Http/
│   │   ├── Controllers/Api/V1/  # Public + Admin controllers
│   │   ├── Middleware/          # EnsureRole etc.
│   │   ├── Requests/            # Form Request validation
│   │   └── Resources/           # API Resources (transformers)
│   ├── Models/         # Eloquent models
│   └── Services/       # Stateless services (WhatsAppMessageBuilder, OrderNumberGenerator)
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
├── routes/
│   ├── api.php         # /api/v1/* routes
│   └── console.php     # Laravel 11 scheduler (Task 9.7)
└── tests/              # Pest 3 tests
```