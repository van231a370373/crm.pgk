# Script para corregir SSL en crm.rejestracjahiszpania.com
# Ejecutar en el servidor como root

#!/bin/bash
set -e

DOMAIN="crm.rejestracjahiszpania.com"
EMAIL="admin@pgkhiszpanii.com"

echo "🔒 Configurando SSL para $DOMAIN..."

# Verificar que el dominio resuelve correctamente
echo "Verificando DNS..."
nslookup $DOMAIN

# Instalar certbot si no está instalado
if ! command -v certbot &> /dev/null; then
    echo "Instalando certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Verificar configuración de Nginx
echo "Verificando configuración de Nginx..."
nginx -t

# Generar certificado SSL con Let's Encrypt
echo "Generando certificado SSL..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

# Verificar que el certificado se instaló correctamente
echo "Verificando certificado..."
certbot certificates

# Reiniciar Nginx para aplicar cambios
systemctl reload nginx

# Configurar renovación automática
echo "Configurando renovación automática..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "✅ SSL configurado correctamente para $DOMAIN"
echo "🌐 Sitio disponible en: https://$DOMAIN"

# Verificar que HTTPS funciona
curl -I https://$DOMAIN || echo "⚠️ Verificar manualmente el sitio"