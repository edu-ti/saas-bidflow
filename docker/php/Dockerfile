FROM php:8.4-fpm-alpine

RUN apk add --no-cache icu-data-full\
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    postgresql-client \
    redis \
    bash \
    fcron \
    oniguruma-dev || true

RUN docker-php-ext-install pdo_pgsql pdo_mysql mbstring exif pcntl bcmath gd

# Instalar extensão PHP Redis para cache, sessions e queues
RUN apk add --no-cache autoconf gcc g++ make linux-headers \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del autoconf gcc g++ make linux-headers

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY docker/php/opcache-production.ini /usr/local/etc/php/conf.d/opcache-production.ini

RUN mkdir -p /var/www/html/storage && \
    mkdir -p /var/www/html/bootstrap/cache && \
    chown -R www-data:www-data /var/www/html && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

WORKDIR /var/www/html

RUN echo "*/1 * * * * cd /var/www/html && php artisan schedule:run >> /dev/null 2>&1" > /etc/crontabs/www-data

EXPOSE 9000

CMD ["php-fpm"]