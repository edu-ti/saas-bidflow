FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    postgresql-client \
    redis \
    bash \
    cron

RUN docker-php-ext-install pdo_pgsql pdo_mysql mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN mkdir -p /var/www/html/storage && \
    mkdir -p /var/www/html/bootstrap/cache && \
    chown -R www-data:www-data /var/www/html && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

WORKDIR /var/www/html

RUN echo "*/1 * * * * cd /var/www/html && php artisan schedule:run >> /dev/null 2>&1" > /etc/crontabs/www-data

EXPOSE 9000

CMD ["php-fpm"]