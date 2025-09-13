# Configuración DNS para crm.rejestracjahiszpania.com

## Información del Servidor
- **IP del Servidor:** 162.213.253.208
- **Proveedor:** BanaHosting  
- **Dominio:** crm.rejestracjahiszpania.com
- **Fecha:** 13 de Septiembre, 2025

## Configuración en NameCheap DNS

### 1. Acceder al Panel de NameCheap
1. Ir a https://namecheap.com
2. Iniciar sesión en tu cuenta
3. Ir a "Domain List" 
4. Buscar el dominio `rejestracjahiszpania.com`
5. Click en "Manage"

### 2. Configurar DNS Records
En la sección "Advanced DNS":

**Registro A para el subdominio CRM:**
```
Tipo: A Record
Host: crm
Valor: 162.213.253.208
TTL: Automatic (o 5 min para propagación rápida)
```

**Verificar registros existentes:**
- Asegurar que no hay conflictos con otros registros A o CNAME para 'crm'
- Si existe un CNAME para 'crm', eliminarlo antes de agregar el registro A

### 3. Propagación DNS
- **Tiempo estimado:** 15 minutos - 2 horas
- **Verificar con:** `nslookup crm.rejestracjahiszpania.com`
- **O usar:** https://www.whatsmydns.net/

### 4. SSL Certificate
Una vez que el dominio apunte al servidor, el script automáticamente:
- Configurará Let's Encrypt
- Habilitará HTTPS
- Redirigirá HTTP a HTTPS

## Comandos de Verificación

### Verificar DNS:
```bash
# Desde cualquier terminal
nslookup crm.rejestracjahiszpania.com

# Debería mostrar:
# Server: [DNS_SERVER]
# Address: [DNS_SERVER_IP]
# Name: crm.rejestracjahiszpania.com
# Address: 162.213.253.208
```

### Verificar conectividad al servidor:
```bash
ping crm.rejestracjahiszpania.com
curl -I http://crm.rejestracjahiszpania.com
```

## Estados del Despliegue

### ✅ Completado:
- [x] Compilación de producción
- [x] Archivo ZIP creado
- [x] Scripts de servidor preparados

### 🔄 En Proceso:
- [ ] Configuración DNS en NameCheap
- [ ] Subida de archivos al servidor
- [ ] Configuración de Nginx
- [ ] Configuración SSL

### 📋 Pendiente:
- [ ] Pruebas de funcionamiento
- [ ] Monitoreo inicial

## Notas Importantes

1. **Backup:** Antes de cualquier cambio, hacer backup del servidor
2. **DNS Cache:** Limpiar cache DNS local si es necesario: `ipconfig /flushdns`
3. **Firewall:** Verificar que puertos 80 y 443 estén abiertos
4. **Logs:** Monitorear `/var/log/nginx/` para errores

## Contactos de Soporte
- **BanaHosting:** [Panel de control del hosting]
- **NameCheap:** Soporte técnico DNS
- **Dominio Principal:** rejestracjahiszpania.com