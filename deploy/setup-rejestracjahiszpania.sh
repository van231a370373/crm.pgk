#!/bin/bash
set -e

DOMAIN="crm.rejestracjahiszpania.com"
APP_DIR="/var/www/$DOMAIN"
NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"
ZIP_FILE="/tmp/crm-app.zip"

echo "ðŸš€ Configurando $DOMAIN en el servidor..."

# Crear directorio de la aplicaciÃ³n
sudo mkdir -p $APP_DIR
sudo chown -R www-data:www-data $APP_DIR

# Extraer archivos
cd $APP_DIR
sudo unzip -o $ZIP_FILE
sudo chown -R www-data:www-data $APP_DIR

# Crear configuraciÃ³n de Nginx
sudo tee $NGINX_CONFIG > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $APP_DIR;
    index index.html;

    # ConfiguraciÃ³n para SPA (Single Page Application)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache para assets estÃ¡ticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Seguridad adicional
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # Logs
    access_log /var/log/nginx/$DOMAIN.access.log;
    error_log /var/log/nginx/$DOMAIN.error.log;
}
EOF

# Habilitar el sitio
sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Configurar SSL con Let's Encrypt
if command -v certbot &> /dev/null; then
    echo "ðŸ”’ Configurando SSL para $DOMAIN..."
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@pgkhiszpanii.com
else
    echo "âš ï¸ Certbot no instalado. SSL debe configurarse manualmente."
fi

echo "âœ… Despliegue completado para $DOMAIN"
echo "ðŸŒ Sitio disponible en: https://$DOMAIN"

# Limpiar archivo temporal
rm -f $ZIP_FILE
