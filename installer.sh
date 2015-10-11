#!/bin/bash
# File to configure basic server

sudo apt-get update
sudo apt-get install -y apache2
sudo /etc/init.d/apache2 restart
sudo chown -R www-data:www-data /var/www
sudo chmod -R 755 /var/www
sudo a2enmod rewrite

