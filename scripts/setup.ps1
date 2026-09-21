$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
docker compose pull
docker compose build --no-cache
docker compose up -d mysql mailpit
Start-Sleep -Seconds 10
docker compose up -d api web phpmyadmin
docker compose exec -T api composer install --no-interaction
docker compose exec -T api php artisan key:generate
docker compose exec -T api php artisan migrate --force --seed
docker compose exec -T api php artisan storage:link
docker compose exec -T web npm install
Write-Host "Setup complete. Open http://localhost:5173"
