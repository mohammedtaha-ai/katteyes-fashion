FROM php:8.3-cli-bookworm

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libonig-dev libxml2-dev default-mysql-client \
 && docker-php-ext-install pdo_mysql gd zip bcmath opcache \
 && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html

EXPOSE 8000

# عند كل start:
# 1) تأكد من بنية storage (الـ named volume الجديد فاضي)
# 2) composer install (idempotent)
# 3) php artisan serve
CMD ["sh", "-c", "mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache && chmod -R 777 storage bootstrap/cache 2>/dev/null || true && composer install --no-interaction --no-progress --optimize-autoloader && php artisan serve --host=0.0.0.0 --port=8000"]
