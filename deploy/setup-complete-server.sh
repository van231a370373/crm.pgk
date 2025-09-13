# CONFIGURACIÓN COMPLETA PARA SERVIDOR NAMECHEAP
# Ejecutar estos comandos en SSH (root@162.213.253.208)

echo "🚀 Configurando servidor para CRM Polska..."

# 1. Actualizar sistema
apt update && apt upgrade -y

# 2. Instalar Nginx
apt install -y nginx curl unzip

# 3. Crear estructura de directorios
mkdir -p /var/www/crm-polska/dist
mkdir -p /var/log/nginx/crm-polska

# 4. Crear configuración de Nginx para el subdominio
cat > /etc/nginx/sites-available/crm-polska << 'EOF'
server {
    listen 80;
    server_name crm.pgkhiszpania.com;
    
    root /var/www/crm-polska/dist;
    index index.html index.htm;
    
    # Logs específicos para el CRM
    access_log /var/log/nginx/crm-polska/access.log;
    error_log /var/log/nginx/crm-polska/error.log;
    
    # Configuración para React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache para archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Hide server version
    server_tokens off;
}
EOF

# 5. Habilitar el sitio
ln -sf /etc/nginx/sites-available/crm-polska /etc/nginx/sites-enabled/

# 6. Remover configuración por defecto si existe
rm -f /etc/nginx/sites-enabled/default

# 7. Verificar configuración de Nginx
nginx -t

# 8. Crear página de prueba temporal
cat > /var/www/crm-polska/dist/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>CRM Polska - Configuración exitosa</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto; }
        h1 { color: #2563eb; }
        .success { color: #16a34a; font-weight: bold; font-size: 18px; }
        .info { color: #6b7280; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 CRM Polska</h1>
        <div class="success">✅ Servidor configurado correctamente</div>
        <div class="info">
            <p>El subdominio <strong>crm.pgkhiszpania.com</strong> está funcionando.</p>
            <p>El CRM será desplegado aquí próximamente.</p>
        </div>
        <div class="info">
            <small>Servidor: NameCheap | IP: 162.213.253.208</small>
        </div>
    </div>
</body>
</html>
EOF

# 9. Configurar permisos
chown -R www-data:www-data /var/www/crm-polska
chmod -R 755 /var/www/crm-polska

# 10. Configurar firewall
ufw allow 22   # SSH
ufw allow 80   # HTTP
ufw allow 443  # HTTPS (para SSL futuro)
ufw --force enable

# 11. Reiniciar y habilitar Nginx
systemctl restart nginx
systemctl enable nginx

# 12. Verificar estado
systemctl status nginx --no-pager

echo ""
echo "✅ ¡Configuración completada!"
echo "🌐 Cuando el DNS se propague, el sitio estará disponible en:"
echo "   http://crm.pgkhiszpania.com"
echo ""
echo "📋 Para subir el CRM:"
echo "   1. Subir archivos a: /var/www/crm-polska/dist/"
echo "   2. Ejecutar: systemctl reload nginx"
echo ""