# Script de despliegue para crm.rejestracjahiszpania.com
# Configuración del servidor BanaHosting

param(
    [string]$ServerIP = "162.213.253.208",
    [string]$Username = "root",
    [string]$Domain = "crm.rejestracjahiszpania.com",
    [string]$ProjectPath = "C:\Users\kenyi\Documents\PROYECTOS POLSKAGRUPA\CRM POLSKA"
)

Write-Host "Iniciando despliegue del CRM a $Domain" -ForegroundColor Green
Write-Host "Directorio del proyecto: $ProjectPath" -ForegroundColor Blue
Write-Host "Servidor: $ServerIP" -ForegroundColor Blue

# Verificar que existe la carpeta dist
if (-not (Test-Path "$ProjectPath\dist")) {
    Write-Host "Error: No existe la carpeta 'dist'. Ejecuta 'npm run build' primero." -ForegroundColor Red
    exit 1
}

# Crear archivo comprimido con la aplicación
Write-Host "Creando archivo comprimido..." -ForegroundColor Yellow
$DistPath = "$ProjectPath\dist"
$DeployZip = "$ProjectPath\crm-rejestracjahiszpania-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"

# Comprimir los archivos de dist
Compress-Archive -Path "$DistPath\*" -DestinationPath $DeployZip -Force
Write-Host "Archivo creado: $DeployZip" -ForegroundColor Green

# Crear script de configuración del servidor
$ServerScript = @"
#!/bin/bash
set -e

DOMAIN="$Domain"
APP_DIR="/var/www/`$DOMAIN"
NGINX_CONFIG="/etc/nginx/sites-available/`$DOMAIN"
ZIP_FILE="/tmp/crm-app.zip"

echo "🚀 Configurando `$DOMAIN en el servidor..."

# Crear directorio de la aplicación
sudo mkdir -p `$APP_DIR
sudo chown -R www-data:www-data `$APP_DIR

# Extraer archivos
cd `$APP_DIR
sudo unzip -o `$ZIP_FILE
sudo chown -R www-data:www-data `$APP_DIR

# Crear configuración de Nginx
sudo tee `$NGINX_CONFIG > /dev/null <<EOF
server {
    listen 80;
    server_name `$DOMAIN;
    root `$APP_DIR;
    index index.html;

    # Configuración para SPA (Single Page Application)
    location / {
        try_files \`$uri \`$uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Seguridad adicional
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # Logs
    access_log /var/log/nginx/`$DOMAIN.access.log;
    error_log /var/log/nginx/`$DOMAIN.error.log;
}
EOF

# Habilitar el sitio
sudo ln -sf `$NGINX_CONFIG /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Configurar SSL con Let's Encrypt
if command -v certbot &> /dev/null; then
    echo "🔒 Configurando SSL para `$DOMAIN..."
    sudo certbot --nginx -d `$DOMAIN --non-interactive --agree-tos --email admin@pgkhiszpanii.com
else
    echo "⚠️ Certbot no instalado. SSL debe configurarse manualmente."
fi

echo "✅ Despliegue completado para `$DOMAIN"
echo "🌐 Sitio disponible en: https://`$DOMAIN"

# Limpiar archivo temporal
rm -f `$ZIP_FILE
"@

$ServerScriptPath = "$ProjectPath\deploy\setup-rejestracjahiszpania.sh"
$ServerScript | Out-File -FilePath $ServerScriptPath -Encoding UTF8

Write-Host "Script del servidor creado: $ServerScriptPath" -ForegroundColor Green

# Mostrar comandos para ejecutar manualmente
Write-Host "`nCOMANDOS PARA EJECUTAR EN EL SERVIDOR:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "1. Subir el archivo ZIP al servidor:" -ForegroundColor White
Write-Host "   scp `"$DeployZip`" ${Username}@${ServerIP}:/tmp/crm-app.zip" -ForegroundColor Gray

Write-Host "`n2. Subir y ejecutar el script de configuración:" -ForegroundColor White
Write-Host "   scp `"$ServerScriptPath`" ${Username}@${ServerIP}:/tmp/setup.sh" -ForegroundColor Gray
Write-Host "   ssh ${Username}@${ServerIP} 'chmod +x /tmp/setup.sh && sudo /tmp/setup.sh'" -ForegroundColor Gray

Write-Host "`n3. O ejecutar comandos directamente:" -ForegroundColor White
Write-Host "   ssh ${Username}@${ServerIP}" -ForegroundColor Gray

Write-Host "`nCONFIGURACION DNS NECESARIA:" -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Cyan
Write-Host "Agregar en NameCheap DNS:" -ForegroundColor White
Write-Host "Tipo: A" -ForegroundColor Gray
Write-Host "Host: crm.rejestracjahiszpania" -ForegroundColor Gray
Write-Host "Valor: $ServerIP" -ForegroundColor Gray

Write-Host "`nPreparacion de despliegue completada!" -ForegroundColor Green
Write-Host "Archivos listos en: $ProjectPath\deploy" -ForegroundColor Blue