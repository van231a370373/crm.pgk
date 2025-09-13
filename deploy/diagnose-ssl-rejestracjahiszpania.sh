# Script de diagnóstico SSL para crm.rejestracjahiszpania.com

#!/bin/bash

DOMAIN="crm.rejestracjahiszpania.com"
SERVER_IP="162.213.253.208"

echo "🔍 Diagnóstico SSL para $DOMAIN"
echo "=================================="

# 1. Verificar resolución DNS
echo "1. Verificando DNS..."
DNS_IP=$(nslookup $DOMAIN | grep "Address:" | tail -1 | cut -d' ' -f2)
echo "   DNS resuelve a: $DNS_IP"
if [ "$DNS_IP" = "$SERVER_IP" ]; then
    echo "   ✅ DNS correcto"
else
    echo "   ❌ DNS incorrecto (debería ser $SERVER_IP)"
fi

# 2. Verificar conectividad HTTP
echo "2. Verificando HTTP..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN)
echo "   Estado HTTP: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    echo "   ✅ HTTP funciona"
else
    echo "   ❌ HTTP no funciona"
fi

# 3. Verificar HTTPS
echo "3. Verificando HTTPS..."
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN 2>/dev/null || echo "ERROR")
echo "   Estado HTTPS: $HTTPS_STATUS"
if [ "$HTTPS_STATUS" = "200" ]; then
    echo "   ✅ HTTPS funciona"
else
    echo "   ❌ HTTPS no funciona"
fi

# 4. Verificar certificado SSL
echo "4. Verificando certificado SSL..."
SSL_INFO=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -subject 2>/dev/null || echo "ERROR")
if [ "$SSL_INFO" != "ERROR" ]; then
    echo "   Certificado: $SSL_INFO"
    
    # Verificar fechas del certificado
    SSL_DATES=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "ERROR")
    echo "   Fechas: $SSL_DATES"
else
    echo "   ❌ No se pudo obtener información del certificado"
fi

# 5. Verificar configuración de Nginx
echo "5. Verificando Nginx..."
if systemctl is-active --quiet nginx; then
    echo "   ✅ Nginx está corriendo"
else
    echo "   ❌ Nginx no está corriendo"
fi

# 6. Verificar archivos de configuración
echo "6. Verificando configuración..."
if [ -f "/etc/nginx/sites-enabled/$DOMAIN" ]; then
    echo "   ✅ Configuración de sitio existe"
else
    echo "   ❌ Configuración de sitio no existe"
fi

# 7. Verificar logs
echo "7. Últimos logs de error:"
if [ -f "/var/log/nginx/$DOMAIN.error.log" ]; then
    tail -5 "/var/log/nginx/$DOMAIN.error.log"
else
    echo "   No hay logs específicos del dominio"
    tail -5 /var/log/nginx/error.log 2>/dev/null || echo "   No se pueden leer logs"
fi

echo ""
echo "🔧 SOLUCIONES RECOMENDADAS:"
echo "=========================="
if [ "$HTTPS_STATUS" != "200" ]; then
    echo "1. Ejecutar: bash fix-ssl-rejestracjahiszpania.sh"
    echo "2. O manualmente:"
    echo "   certbot --nginx -d $DOMAIN --email admin@pgkhiszpanii.com"
fi

echo "3. Verificar que el puerto 443 esté abierto en el firewall"
echo "4. Reiniciar nginx: systemctl restart nginx"