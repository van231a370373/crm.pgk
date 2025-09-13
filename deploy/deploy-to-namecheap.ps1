# SCRIPT PARA SUBIR CRM AL SERVIDOR
# Ejecutar desde tu PC con PowerShell

# 1. Verificar que tengas el archivo comprimido
if (!(Test-Path "crm-polska-dist.zip")) {
    Write-Host "❌ No encontrado: crm-polska-dist.zip" -ForegroundColor Red
    Write-Host "💡 Ejecuta primero: Compress-Archive -Path 'dist\*' -DestinationPath 'crm-polska-dist.zip' -Force" -ForegroundColor Yellow
    exit
}

$SERVER_IP = "162.213.253.208"
$USERNAME = "root"

Write-Host "🚀 Subiendo CRM Polska..." -ForegroundColor Green

# 2. Subir archivo al servidor
Write-Host "📤 Subiendo archivos..." -ForegroundColor Cyan
scp -P 22 "crm-polska-dist.zip" "${USERNAME}@${SERVER_IP}:/tmp/"
scp -P 22 "deploy/setup-complete-server.sh" "${USERNAME}@${SERVER_IP}:/tmp/"

# 3. Configurar servidor y desplegar
Write-Host "🔧 Configurando servidor..." -ForegroundColor Cyan
$commands = @"
chmod +x /tmp/setup-complete-server.sh
/tmp/setup-complete-server.sh
cd /var/www/crm-polska/dist
unzip -o /tmp/crm-polska-dist.zip
chown -R www-data:www-data /var/www/crm-polska
chmod -R 755 /var/www/crm-polska
systemctl reload nginx
echo ""
echo "✅ CRM desplegado exitosamente!"
echo "🌐 Acceso: http://crm.pgkhiszpania.com"
"@

echo $commands | ssh -p 22 "${USERNAME}@${SERVER_IP}" 'bash -s'

Write-Host ""
Write-Host "🎉 ¡Despliegue completado!" -ForegroundColor Green
Write-Host "📋 Información:" -ForegroundColor White
Write-Host "   🖥️ Servidor: $SERVER_IP" -ForegroundColor Gray  
Write-Host "   🌐 URL: http://crm.pgkhiszpania.com" -ForegroundColor Gray
Write-Host "   📁 Directorio: /var/www/crm-polska/dist" -ForegroundColor Gray
Write-Host ""
Write-Host "⏳ El sitio estará disponible cuando el DNS se propague (5-30 minutos)" -ForegroundColor Yellow