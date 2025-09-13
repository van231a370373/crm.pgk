# Script de despliegue para Windows PowerShell
# CRM Polska - Despliegue a servidor NameCheap

param(
    [string]$ServerIP = "162.213.253.208",
    [string]$Username = "root",
    [int]$Port = 22
)

Write-Host "🚀 Iniciando despliegue de CRM Polska..." -ForegroundColor Green

# Verificar que existe el directorio dist
if (!(Test-Path "dist")) {
    Write-Host "❌ Error: No se encontró el directorio 'dist'. Ejecuta 'npm run build' primero." -ForegroundColor Red
    exit 1
}

# Verificar que existe SCP (PuTTY o Git Bash)
$scpPath = Get-Command scp -ErrorAction SilentlyContinue
if (!$scpPath) {
    Write-Host "❌ Error: SCP no encontrado. Instala Git Bash o PuTTY." -ForegroundColor Red
    Write-Host "💡 Alternativa: Usa WinSCP o FileZilla para subir manualmente." -ForegroundColor Yellow
    exit 1
}

try {
    # Crear archivos comprimidos
    Write-Host "📦 Preparando archivos..." -ForegroundColor Cyan
    
    # Comprimir dist usando PowerShell
    Compress-Archive -Path "dist\*" -DestinationPath "crm-polska-dist.zip" -Force
    
    Write-Host "📤 Subiendo archivos al servidor..." -ForegroundColor Cyan
    
    # Subir archivos usando SCP
    & scp -P $Port "crm-polska-dist.zip" "${Username}@${ServerIP}:/tmp/"
    & scp -P $Port "deploy/nginx.conf" "${Username}@${ServerIP}:/tmp/"
    & scp -P $Port "deploy/setup-server.sh" "${Username}@${ServerIP}:/tmp/"
    
    Write-Host "🔧 Configurando servidor..." -ForegroundColor Cyan
    
    # Comandos SSH para configurar el servidor
    $sshCommands = @"
chmod +x /tmp/setup-server.sh
/tmp/setup-server.sh
mkdir -p /var/www/crm-polska/dist
cd /var/www/crm-polska/dist
unzip -o /tmp/crm-polska-dist.zip
chown -R www-data:www-data /var/www/crm-polska
chmod -R 755 /var/www/crm-polska
systemctl reload nginx
echo "✅ Despliegue completado en servidor!"
"@
    
    # Ejecutar comandos en el servidor
    echo $sshCommands | & ssh -p $Port "$Username@$ServerIP" 'bash -s'
    
    # Limpiar archivos temporales
    Remove-Item "crm-polska-dist.zip" -Force
    
    Write-Host ""
    Write-Host "🎉 ¡Despliegue completado exitosamente!" -ForegroundColor Green
    Write-Host "📋 Información del despliegue:" -ForegroundColor White
    Write-Host "   🖥️ Servidor: $ServerIP" -ForegroundColor Gray
    Write-Host "   🌐 Dominio: http://crm.pgkhiszpania.com" -ForegroundColor Gray
    Write-Host "   📁 Directorio: /var/www/crm-polska" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔗 Próximo paso: Configurar el subdominio en NameCheap:" -ForegroundColor Yellow
    Write-Host "   1. Ir al panel de NameCheap" -ForegroundColor Gray
    Write-Host "   2. Advanced DNS > Add Record" -ForegroundColor Gray
    Write-Host "   3. Tipo: A Record" -ForegroundColor Gray
    Write-Host "   4. Host: crm" -ForegroundColor Gray
    Write-Host "   5. Value: $ServerIP" -ForegroundColor Gray
    Write-Host "   6. TTL: Automatic" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Error durante el despliegue: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}