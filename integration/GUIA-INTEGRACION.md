# Guía Completa de Integración: Sistema de Reserva de Citas
## Cómo integrar el sistema de citas con www.pgkhiszpanii.com

### 📋 **Resumen del Sistema**

Este sistema permite que los visitantes de tu sitio web reserven citas que se guardan automáticamente en tu CRM. Incluye:

- ✅ **Formulario web** adaptado a tu marca
- ✅ **API PHP** para recibir las reservas
- ✅ **Base de datos MySQL** para almacenar las citas
- ✅ **Emails automáticos** de confirmación
- ✅ **Integración con CRM** para gestionar las citas

---

## 🚀 **PASO 1: Subir Archivos al Servidor**

### **1.1. Subir la API (reservas.php)**

```bash
# Ubicación recomendada en tu servidor:
/public_html/api/reservas.php
```

**Archivo a subir:** `integration/api-reservas.php`

### **1.2. Subir el Formulario Web (reservas.html)**

```bash
# Opciones de ubicación:
/public_html/reservar-cita/index.html     # URL: www.pgkhiszpanii.com/reservar-cita/
/public_html/citas.html                   # URL: www.pgkhiszpanii.com/citas.html
/public_html/reservas.html                # URL: www.pgkhiszpanii.com/reservas.html
```

**Archivo a subir:** `integration/reservas.html`

---

## 🔧 **PASO 2: Configurar la Base de Datos**

### **2.1. Crear Base de Datos (si no tienes una)**

```sql
CREATE DATABASE pgk_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### **2.2. Configurar Credenciales en reservas.php**

Edita el archivo `api/reservas.php` y actualiza estas líneas:

```php
// CONFIGURACIÓN DE BASE DE DATOS - ACTUALIZAR CON TUS DATOS
$db_host = 'localhost';           // Generalmente 'localhost'
$db_name = 'pgk_crm';           // Nombre de tu base de datos
$db_username = 'TU_USUARIO_DB';  // Usuario de la base de datos
$db_password = 'TU_PASSWORD_DB'; // Contraseña de la base de datos

// CONFIGURACIÓN DE EMAIL - ACTUALIZAR CON TUS DATOS
$admin_email = 'info@pgkhiszpanii.com';  // Tu email para recibir notificaciones
$from_email = 'noreply@pgkhiszpanii.com'; // Email desde el que se envían confirmaciones
```

### **2.3. La API Creará la Tabla Automáticamente**

Al recibir la primera reserva, la API creará automáticamente la tabla `appointments` con todos los campos necesarios.

---

## 🌐 **PASO 3: Configurar URLs en el Formulario**

Edita `reservas.html` y actualiza esta línea:

```javascript
// LÍNEA 97: Cambiar por la URL real de tu API
const API_URL = 'https://www.pgkhiszpanii.com/api/reservas.php';
```

---

## 📧 **PASO 4: Configurar Emails**

### **4.1. Verificar Configuración del Servidor**

Asegúrate de que tu hosting permite envío de emails con PHP `mail()`. Si no funciona, actualiza en `reservas.php`:

```php
// Para servidores con SMTP personalizado:
// Cambia la función sendConfirmationEmail() por configuración SMTP
// Ejemplo con PHPMailer (requiere instalación):

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

function sendConfirmationEmailSMTP($to_email, $client_name, $appointment_data) {
    $mail = new PHPMailer(true);
    
    $mail->isSMTP();
    $mail->Host = 'smtp.tuproveedor.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'tu@email.com';
    $mail->Password = 'tu_password';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    // Resto de configuración...
}
```

### **4.2. Personalizar Plantillas de Email**

En `reservas.php`, personaliza los mensajes de email (líneas 100-150):

```php
$subject = "✅ Confirmación de Cita - PGK Hiszpanii";
$message = "
<html>
<head><title>Confirmación de Cita</title></head>
<body style='font-family: Arial, sans-serif;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #3B82F6;'>¡Hola $client_name!</h2>
        <p>Hemos recibido tu solicitud de cita con los siguientes detalles:</p>
        
        <!-- Personaliza el contenido del email aquí -->
        
    </div>
</body>
</html>
";
```

---

## 🎨 **PASO 5: Personalizar Diseño**

### **5.1. Actualizar Colores de Marca**

En `reservas.html`, actualiza los colores (líneas 15-50):

```css
/* Cambiar colores principales */
.hero-gradient {
    background: linear-gradient(135deg, #TU_COLOR_1 0%, #TU_COLOR_2 100%);
}

/* Botones */
.bg-blue-600 { background-color: #TU_COLOR_PRINCIPAL; }
.hover:bg-blue-700:hover { background-color: #TU_COLOR_HOVER; }
```

### **5.2. Actualizar Logo y Textos**

```html
<!-- Línea 50: Logo -->
<div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
    <img src="/logo.png" alt="PGK" class="w-8 h-8"> <!-- Usar tu logo -->
</div>

<!-- Línea 60: Textos principales -->
<h1 class="text-xl font-bold text-gray-900">PGK Hiszpanii</h1>
<p class="text-sm text-gray-600">Tu descripción personalizada</p>
```

### **5.3. Actualizar Información de Contacto**

```html
<!-- Líneas 500-550: Actualizar datos reales -->
<p class="text-gray-600">+34 XXX XXX XXX</p> <!-- Tu teléfono -->
<p class="text-gray-600">info@pgkhiszpanii.com</p> <!-- Tu email -->
<p class="text-gray-600">Tu dirección real</p> <!-- Tu dirección -->
```

---

## 🔗 **PASO 6: Integrar con Tu Sitio Web Existente**

### **6.1. Opción A: Página Independiente**

Sube `reservas.html` y crea un enlace desde tu sitio:

```html
<!-- En tu menú principal -->
<a href="/reservar-cita/" class="nav-link">Reservar Cita</a>
```

### **6.2. Opción B: Sección Dentro de Página Existente**

Copia el contenido del formulario (desde `<section class="py-16 bg-white">`) e intégralo en tu página:

```html
<!-- En tu página principal -->
<section id="reservar-cita">
    <!-- Contenido del formulario aquí -->
</section>
```

### **6.3. Opción C: Modal/Popup**

```html
<!-- Botón para abrir popup -->
<button onclick="openBookingModal()">Reservar Cita</button>

<!-- Modal con el formulario -->
<div id="bookingModal" class="modal">
    <!-- Formulario integrado -->
</div>
```

---

## 📱 **PASO 7: Conectar con tu CRM**

### **7.1. Verificar Datos en la Base de Datos**

Después de recibir algunas reservas, verifica que se guarden correctamente:

```sql
SELECT * FROM appointments ORDER BY created_at DESC LIMIT 10;
```

### **7.2. Importar Citas en tu CRM**

En tu CRM, ve a la sección "Calendario" o ejecuta este comando para sincronizar:

```javascript
// En tu CRM, crear función para importar desde BD
async function importWebAppointments() {
    // Código para leer desde la tabla appointments
    // y sincronizar con el estado local del CRM
}
```

---

## 🧪 **PASO 8: Probar el Sistema**

### **8.1. Lista de Verificación**

- [ ] Subir `api/reservas.php` al servidor
- [ ] Subir `reservas.html` al servidor
- [ ] Configurar credenciales de base de datos
- [ ] Actualizar URL de API en el formulario
- [ ] Configurar emails
- [ ] Personalizar diseño y textos
- [ ] Probar una reserva completa
- [ ] Verificar email de confirmación
- [ ] Comprobar que se guarda en base de datos
- [ ] Integrar con tu sitio web principal

### **8.2. Hacer Una Reserva de Prueba**

1. Ve a `www.pgkhiszpanii.com/reservas.html`
2. Completa el formulario con datos reales
3. Verifica que recibes el email de confirmación
4. Comprueba que aparece en la base de datos

---

## 🔧 **PASO 9: Mantenimiento**

### **9.1. Monitoreo de Reservas**

Crea un dashboard simple para ver las reservas:

```php
// admin-reservas.php (panel simple de administración)
<?php
// Conectar a BD y mostrar reservas recientes
$pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_username, $db_password);
$appointments = $pdo->query("SELECT * FROM appointments ORDER BY created_at DESC")->fetchAll();

foreach($appointments as $appointment) {
    echo "<div>Cita: {$appointment['client_name']} - {$appointment['appointment_date']}</div>";
}
?>
```

### **9.2. Copias de Seguridad**

```bash
# Hacer backup semanal de la tabla appointments
mysqldump -u usuario -p base_de_datos appointments > backup_appointments_$(date +%Y%m%d).sql
```

---

## ❓ **Resolución de Problemas Comunes**

### **Error: "No se puede conectar a la base de datos"**
- Verifica credenciales en `reservas.php`
- Comprueba que la base de datos existe
- Asegúrate de que el usuario tiene permisos

### **Error: "No se envían emails"**
- Verifica configuración del hosting
- Comprueba que `mail()` está habilitado
- Considera usar SMTP externo (Gmail, SendGrid)

### **Error: "CORS policy"**
- Añade el dominio a los headers CORS en `reservas.php`
- Verifica que la URL de API sea correcta

### **Las citas no aparecen en el CRM**
- Comprueba que la tabla `appointments` se creó correctamente
- Verifica que el CRM lee de la misma base de datos
- Implementa sincronización automática

---

## 📞 **Soporte**

Si necesitas ayuda con la implementación:

1. **Revisa la consola del navegador** para errores JavaScript
2. **Verifica logs del servidor** para errores PHP
3. **Comprueba la base de datos** para ver si se guardan los datos
4. **Prueba la API directamente** con Postman o similar

---

**¡Tu sistema de reservas está listo para funcionar! 🎉**

Recuerda hacer pruebas completas antes de lanzarlo oficialmente y mantener copias de seguridad regulares de tu base de datos.