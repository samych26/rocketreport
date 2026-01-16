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
    # wkhtmltopdf removed for now (not in bookworm repo), install manually if needed \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g axios lodash moment decimal.js \
    && docker-php-ext-install \
    pdo_mysql \
    intl \
    zip \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configure Apache to serve Symfony from /public
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf \
    && sed -ri -e 's!/var/www/!/var/www/html/public!g' /etc/apache2/apache2.conf

# Enable .htaccess for /var/www/html/public directory
RUN sed -i '/<Directory \/var\/www\/html\/public>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Copy existing app (mounted in docker-compose, so this is mostly for build)
COPY . /var/www/html

# Set permissions (lightweight for dev)
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

