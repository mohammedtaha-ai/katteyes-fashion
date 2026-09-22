FROM php:8.3-cli-bookworm

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libpng-dev libjpeg-dev libwebp-dev libonig-dev libxml2-dev default-mysql-client \
 && docker-php-ext-configure gd --with-jpeg --with-webp \
 && docker-php-ext-install pdo_mysql gd zip bcmath opcache \
 && pecl install redis && docker-php-ext-enable redis \
 && echo "zend_extension=opcache\nopcache.enable=1\nopcache.enable_cli=1\nopcache.memory_consumption=512\nopcache.interned_strings_buffer=64\nopcache.max_accelerated_files=30000\nopcache.validate_timestamps=1\nopcache.revalidate_freq=60\nopcache.fast_shutdown=1" > /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
 && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html

EXPOSE 8000

# عند كل start:
# 1) تأكد من بنية storage (الـ named volume الجديد فاضي)
# 2) composer install (idempotent)
# 3) php artisan serve
CMD ["sh", "-c", "mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache && chmod -R 777 storage bootstrap/cache 2>/dev/null || true && composer install --no-interaction --no-progress --optimize-autoloader && php artisan serve --host=0.0.0.0 --port=8000 --no-reload"]
