# Comandos de Despliegue para crm.rejestracjahiszpania.com
# Ejecutar estos comandos en orden

# PASO 1: Verificar conectividad al servidor
echo "Verificando conectividad al servidor..."
ssh -o ConnectTimeout=10 root@162.213.253.208 "echo 'Conexion exitosa al servidor'" || echo "ERROR: No se puede conectar al servidor"

# PASO 2: Subir archivo ZIP al servidor
echo "Subiendo archivo de la aplicacion..."
scp "crm-rejestracjahiszpania-20250913-173044.zip" root@162.213.253.208:/tmp/crm-app.zip

# PASO 3: Subir script de configuración
echo "Subiendo script de configuracion..."
scp "deploy/setup-rejestracjahiszpania.sh" root@162.213.253.208:/tmp/setup.sh

# PASO 4: Ejecutar configuración en el servidor
echo "Ejecutando configuracion del servidor..."
ssh root@162.213.253.208 "chmod +x /tmp/setup.sh && sudo /tmp/setup.sh"

# PASO 5: Verificar que el sitio funciona
echo "Verificando el despliegue..."
sleep 30  # Esperar a que se configure todo
curl -I http://crm.rejestracjahiszpania.com || echo "Sitio aun no disponible, verificar DNS"

echo "Despliegue completado!"
echo "Sitio: http://crm.rejestracjahiszpania.com"
echo "Una vez configurado SSL: https://crm.rejestracjahiszpania.com"