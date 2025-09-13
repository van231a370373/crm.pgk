#!/bin/bash

# Script para subir archivos al servidor
# Ejecutar desde tu máquina local

SERVER_IP="162.213.253.208"
SERVER_USER="root"
PROJECT_DIR="/var/www/crm-polska"

echo "📦 Subiendo CRM Polska al servidor..."

# Comprimir archivos de producción
echo "🗜️ Comprimiendo archivos..."
cd dist
tar -czf ../crm-polska-dist.tar.gz *
cd ..

# Subir archivos al servidor
echo "📤 Subiendo al servidor $SERVER_IP..."
scp -P 22 crm-polska-dist.tar.gz $SERVER_USER@$SERVER_IP:/tmp/
scp -P 22 deploy/nginx.conf $SERVER_USER@$SERVER_IP:/tmp/
scp -P 22 deploy/setup-server.sh $SERVER_USER@$SERVER_IP:/tmp/

# Ejecutar comandos en el servidor
echo "🔧 Configurando servidor..."
ssh -p 22 $SERVER_USER@$SERVER_IP << 'EOF'
    # Hacer ejecutable el script
    chmod +x /tmp/setup-server.sh
    
    # Ejecutar configuración del servidor
    /tmp/setup-server.sh
    
    # Extraer archivos del proyecto
    cd /var/www/crm-polska
    tar -xzf /tmp/crm-polska-dist.tar.gz -C dist/
    
    # Ajustar permisos
    chown -R www-data:www-data /var/www/crm-polska
    chmod -R 755 /var/www/crm-polska
    
    # Reiniciar Nginx
    systemctl reload nginx
    
    echo "✅ Despliegue completado!"
    echo "🌐 Tu CRM está disponible en: http://crm.pgkhiszpania.com"
EOF

# Limpiar archivos temporales
rm -f crm-polska-dist.tar.gz

echo "🎉 ¡Despliegue completado exitosamente!"
echo ""
echo "📋 Información del despliegue:"
echo "   🖥️ Servidor: $SERVER_IP"
echo "   🌐 Dominio: http://crm.pgkhiszpania.com"
echo "   📁 Directorio: $PROJECT_DIR"
echo ""
echo "🔗 Próximo paso: Configurar el subdominio en tu panel de NameCheap"