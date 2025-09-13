#!/bin/bash

# Script de despliegue para CRM Polska
# Ejecutar en el servidor como root

echo "🚀 Iniciando despliegue de CRM Polska..."

# Actualizar sistema
apt update && apt upgrade -y

# Instalar dependencias necesarias
apt install -y nginx curl software-properties-common

# Instalar Node.js (si no está instalado)
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
fi

# Crear directorio del proyecto
mkdir -p /var/www/crm-polska
cd /var/www/crm-polska

# Configurar permisos
chown -R www-data:www-data /var/www/crm-polska
chmod -R 755 /var/www/crm-polska

# Configurar Nginx
cp /tmp/nginx.conf /etc/nginx/sites-available/crm-polska
ln -sf /etc/nginx/sites-available/crm-polska /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Verificar configuración de Nginx
nginx -t

# Reiniciar servicios
systemctl restart nginx
systemctl enable nginx

# Configurar firewall básico
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

echo "✅ Servidor configurado correctamente!"
echo "📁 Directorio del proyecto: /var/www/crm-polska"
echo "🌐 Configuración Nginx: /etc/nginx/sites-available/crm-polska"
echo ""
echo "Próximos pasos:"
echo "1. Subir los archivos del proyecto a /var/www/crm-polska/dist"
echo "2. Configurar el subdominio crm.pgkhiszpania.com en tu panel de control"
echo "3. Opcional: Configurar SSL con Let's Encrypt"