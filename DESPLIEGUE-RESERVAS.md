# 🚀 **Despliegue en www.pgkhiszpanii.com/reservas**

## 📁 **Estructura de Carpetas en tu Servidor**

Tu sitio web debe tener esta estructura en el servidor:

```
/public_html/                          ← Raíz de www.pgkhiszpanii.com
├── index.html                         ← Tu página principal actual
├── reservas/                          ← Nueva carpeta para el sistema de citas
│   ├── index.html                     ← Formulario de reservas (renombrar reservas.html)
│   └── api/
│       └── reservas.php               ← API del sistema
└── ... (otros archivos de tu web)
```

### **URLs finales que funcionarán:**
- **Formulario de reservas**: `https://www.pgkhiszpanii.com/reservas/`
- **API**: `https://www.pgkhiszpanii.com/reservas/api/reservas.php`

---

## 📋 **Pasos de Despliegue**

### **Paso 1: Crear la estructura de carpetas**
En tu servidor (cPanel, FTP, SSH):

```bash
# Si usas SSH/Terminal
cd /public_html/
mkdir reservas
mkdir reservas/api

# O crea las carpetas desde cPanel File Manager
```

### **Paso 2: Subir los archivos**

**Archivo 1**: `/public_html/reservas/index.html`
- Sube el archivo `reservas.html` 
- Renómbralo a `index.html`
- ✅ Ya está configurado con la URL correcta

**Archivo 2**: `/public_html/reservas/api/reservas.php`
- Sube el archivo `api-reservas.php`
- Renómbralo a `reservas.php`

### **Paso 3: Configurar la base de datos**

#### **Credenciales a actualizar en `/public_html/reservas/api/reservas.php`:**

```php
// Líneas 12-16 y 501-505: Actualizar con tus datos reales
$db_host = 'localhost';                    // Generalmente 'localhost'
$db_name = 'tu_nombre_base_datos';         // Nombre de tu BD en cPanel
$db_user = 'tu_usuario_bd';                // Usuario de BD en cPanel
$db_pass = 'tu_password_bd';               // Contraseña de BD
```

#### **Para encontrar estos datos:**
1. **cPanel** → **MySQL Databases**
2. **Crear base de datos**: `pgk_reservas` (o el nombre que prefieras)
3. **Crear usuario**: `pgk_user` con contraseña segura
4. **Asignar usuario a la base de datos** con todos los permisos

### **Paso 4: Configurar emails**

En `/public_html/reservas/api/reservas.php`:

```php
// Líneas 463, 580, 581: Actualizar emails
$adminEmail = 'info@pgkhiszpanii.com';     // Tu email para recibir notificaciones
$headers = "From: noreply@pgkhiszpanii.com\r\n";  // Email de sistema
$headers .= "Reply-To: info@pgkhiszpanii.com\r\n"; // Email de respuesta
```

---

## 🔧 **Configuración del CRM Local**

Tu CRM funcionará localmente y se conectará a la base de datos en línea:

### **Actualizar conexión en tu CRM:**

En `src/utils/supabase.ts` o donde manejes la BD:

```typescript
// Configuración para conectar con tu BD en línea
const DB_CONFIG = {
  host: 'www.pgkhiszpanii.com',  // O la IP de tu hosting
  database: 'tu_nombre_base_datos',
  user: 'tu_usuario_bd',
  password: 'tu_password_bd',
  port: 3306
};
```

---

## ✅ **Lista de Verificación Pre-Lanzamiento**

### **En el servidor:**
- [ ] ✅ Carpeta `/reservas/` creada
- [ ] ✅ Carpeta `/reservas/api/` creada  
- [ ] ✅ Archivo `index.html` subido a `/reservas/`
- [ ] ✅ Archivo `reservas.php` subido a `/reservas/api/`
- [ ] ⚠️ **Credenciales de BD actualizadas** en `reservas.php`
- [ ] ⚠️ **Emails configurados** en `reservas.php`
- [ ] ⚠️ **Permisos de escritura** en la carpeta API

### **Pruebas:**
- [ ] **URL del formulario**: `https://www.pgkhiszpanii.com/reservas/`
- [ ] **API responde**: `https://www.pgkhiszpanii.com/reservas/api/reservas.php?action=available-dates`
- [ ] **Base de datos se crea**: Las tablas aparecen automáticamente
- [ ] **Reserva de prueba**: Hacer una cita de prueba completa
- [ ] **Emails funcionan**: Verificar que llegan las confirmaciones

---

## 🏆 **URLs Finales del Sistema**

### **Para tus clientes:**
📱 **Formulario web**: `https://www.pgkhiszpanii.com/reservas/`

### **Para ti (CRM local):**
💻 **CRM**: `http://localhost:5173` (tu desarrollo local)
🔗 **API**: Conecta automáticamente a tu servidor online

### **Para pruebas:**
🧪 **API directa**: `https://www.pgkhiszpanii.com/reservas/api/reservas.php?action=available-dates`

---

## 🔗 **Integración con tu Web Actual**

### **Agregar botón en tu página principal:**

En tu `index.html` actual, agrega:

```html
<!-- Botón para reservar citas -->
<div class="cta-reservas">
    <h3>¿Necesitas una consulta?</h3>
    <p>Reserva tu cita online de forma rápida y sencilla</p>
    <a href="/reservas/" class="btn-primary">
        📅 Reservar Cita Online
    </a>
</div>

<!-- Estilos opcionales -->
<style>
.cta-reservas {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    margin: 20px 0;
}
.btn-primary {
    display: inline-block;
    background: #4CAF50;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
    margin-top: 10px;
}
</style>
```

---

## 🚨 **¡Importante! Credenciales de BD**

**ANTES de que funcione, DEBES actualizar:**

1. **Líneas 12-16** en `reservas.php`:
```php
$db_host = 'localhost';
$db_name = 'TU_BD_REAL';      ← CAMBIAR
$db_user = 'TU_USUARIO_REAL'; ← CAMBIAR
$db_pass = 'TU_PASSWORD_REAL';← CAMBIAR
```

2. **Líneas 501-505** en `reservas.php` (mismos valores)

3. **Línea 463** - Email admin:
```php
$adminEmail = 'info@pgkhiszpanii.com'; // ← Verificar
```

---

## 🎉 **¡Listo para lanzar!**

Una vez completados estos pasos:

✅ **Tus clientes pueden reservar 24/7** en `www.pgkhiszpanii.com/reservas/`  
✅ **Tú controlas todo desde tu CRM local**  
✅ **Las citas se sincronizan automáticamente**  
✅ **Sistema profesional y automatizado**  

**¿Alguna duda con el despliegue?** 🚀