FROM php:8.1-apache

COPY index.php /var/www/html/

RUN chmod 644 /var/www/html/index.php && \
    chown www-data:www-data /var/www/html/index.php

EXPOSE 80

USER www-data

CMD ["apache2-foreground"]