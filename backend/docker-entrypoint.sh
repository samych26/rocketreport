#!/bin/bash
set -e

# Koyeb (and other PaaS) inject $PORT — make Apache listen on it
PORT="${PORT:-80}"
if [ "$PORT" != "80" ]; then
    sed -i "s/^Listen 80$/Listen ${PORT}/" /etc/apache2/ports.conf
    sed -i "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf
    echo "[entrypoint] Apache configured to listen on port ${PORT}."
fi

JWT_DIR=/var/www/html/config/jwt

# Decode JWT keys from base64 env vars (set on Render)
if [ -n "$JWT_SECRET_KEY_BASE64" ]; then
    mkdir -p "$JWT_DIR"
    echo "$JWT_SECRET_KEY_BASE64" | base64 -d > "$JWT_DIR/private.pem"
    chmod 600 "$JWT_DIR/private.pem"
    chown www-data:www-data "$JWT_DIR/private.pem"
    echo "[entrypoint] JWT private key decoded."
fi

if [ -n "$JWT_PUBLIC_KEY_BASE64" ]; then
    mkdir -p "$JWT_DIR"
    echo "$JWT_PUBLIC_KEY_BASE64" | base64 -d > "$JWT_DIR/public.pem"
    chmod 644 "$JWT_DIR/public.pem"
    chown www-data:www-data "$JWT_DIR/public.pem"
    echo "[entrypoint] JWT public key decoded."
fi

chown -R www-data:www-data /var/www/html/var

echo "[entrypoint] Running database migrations..."
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

echo "[entrypoint] Warming up cache..."
php bin/console cache:warmup

echo "[entrypoint] Starting Apache..."
exec apache2-foreground
