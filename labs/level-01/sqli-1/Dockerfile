FROM php:8.1-apache

# Install only necessary packages and clean up
RUN apt-get update && apt-get install -y \
    sqlite3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* \
    && rm -rf /var/tmp/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Create app directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Create SQLite database directory and uploads directory
RUN mkdir -p /var/www/html/db \
    && mkdir -p /var/www/html/uploads \
    && chown -R www-data:www-data /var/www/html/db \
    && chown -R www-data:www-data /var/www/html/uploads \
    && chmod -R 755 /var/www/html/db \
    && chmod -R 755 /var/www/html/uploads

# Initialize database
RUN php init_db.php

# Expose port 80
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
