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
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g axios lodash moment decimal.js \
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

# Copy existing app (mounted in docker-compose, so this is mostly for build)
COPY . /var/www/html

# Set permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]
