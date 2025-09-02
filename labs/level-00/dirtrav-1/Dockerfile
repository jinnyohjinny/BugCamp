FROM php:8.2-apache-bookworm

RUN apt-get update && apt-get install -y \
    wget \
    && rm -rf /var/lib/apt/lists/*

COPY . /var/www/html/
COPY bugcamp.key /bugcamp.key

RUN chmod -R 755 /var/www/html/ && \
    chown -R www-data:www-data /var/www/html/ && \
    chmod 644 /bugcamp.key

RUN mkdir -p /var/www/html/uploads && \
    chmod 755 /var/www/html/uploads

EXPOSE 8080

RUN sed -i 's/80/8080/g' /etc/apache2/sites-available/000-default.conf
RUN sed -i 's/80/8080/g' /etc/apache2/ports.conf

RUN a2enmod rewrite

CMD ["apache2-foreground"]