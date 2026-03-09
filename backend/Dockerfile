FROM php:8.2-apache

WORKDIR /var/www/html

# Install system deps
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    git \
    unzip \
    libicu-dev \
    libzip-dev \
    libgd-dev \
    libpng-dev \
    libjpeg-dev \
    fontconfig \
    libxrender1 \
    xfonts-75dpi \
    xfonts-base \
    libssl3 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && curl -sL https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-3/wkhtmltox_0.12.6.1-3.bookworm_amd64.deb -o /tmp/wkhtmltopdf.deb \
    && dpkg -i /tmp/wkhtmltopdf.deb || apt-get install -f -y \
    && rm /tmp/wkhtmltopdf.deb \
    && docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install \
        pdo_mysql \
        intl \
        zip \
        gd \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configure Apache VirtualHost to serve Symfony from /public
RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        AllowOverride All\n\
        Require all granted\n\
        Options -Indexes\n\
    </Directory>\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Install Composer dependencies first (better layer caching)
COPY composer.json composer.lock /var/www/html/
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-autoloader \
    && composer dump-autoload --optimize --no-dev

# Copy the rest of the application
COPY . /var/www/html

# Create minimal .env for Symfony bootEnv (real values come from environment variables)
RUN echo "APP_ENV=prod" > /var/www/html/.env

# Re-run autoloader now that all files are present
RUN composer dump-autoload --optimize --no-dev

# Install sandbox npm dependencies
RUN cd /var/www/html/scripts && npm install --omit=dev

# Copy and prepare entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create secure storage for generated files (outside public/)
RUN mkdir -p /var/www/html/var/generated && chown -R www-data:www-data /var/www/html/var && chmod 755 /var/www/html/var/generated

# Set permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
