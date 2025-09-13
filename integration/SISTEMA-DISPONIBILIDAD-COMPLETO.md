# 📅 Sistema de Gestión de Disponibilidad - Guía Completa

## 🎯 **¿Qué puedes hacer ahora?**

Tienes un **sistema completo de gestión de disponibilidad** que te permite controlar exactamente cuándo los clientes pueden reservar citas desde tu página web.

---

## 🚀 **Cómo Funciona el Sistema**

### **1. Desde tu CRM - Gestión de Horarios**
En el calendario de tu CRM, ahora tienes un botón **"Gestionar Horarios"** que abre una interfaz completa donde puedes:

#### **📅 Configurar Horarios Semanales**
- **Lunes a Domingo**: Define qué días trabajas y tus horarios
- **Horario personalizado**: Cada día puede tener horarios diferentes (ej: Lunes 9:00-18:00, Viernes 9:00-14:00)
- **Duración de citas**: 30, 60, 90 o 120 minutos por cita
- **Tiempo de descanso**: Tiempo entre citas (0-60 minutos)
- **Activar/Desactivar**: Puedes desactivar días temporalmente

#### **🚫 Gestionar Excepciones**
- **Días no disponibles**: Vacaciones, días festivos, etc.
- **Horarios especiales**: Días con horarios diferentes a lo normal
- **Razón**: Puedes especificar el motivo (vacaciones, reunión, etc.)

#### **⚙️ Configuración General**
- **Días de anticipación**: Cuántos días en el futuro pueden reservar (máximo 30 días recomendado)
- **Reservas mismo día**: Permitir o no reservas para hoy
- **Tiempo mínimo**: Horas mínimas entre la reserva y la cita (ej: 2 horas)
- **Máximo citas por día**: Límite de citas diarias
- **Auto-confirmar**: Si las citas web se confirman automáticamente

---

## 📱 **Desde tu Página Web - Reservas Inteligentes**

### **Lo que ven tus clientes:**
1. **Formulario de 3 pasos** con información personal, fecha/hora y confirmación
2. **Solo fechas disponibles**: El sistema solo muestra días donde realmente trabajas
3. **Horarios reales**: Los slots se generan según tus reglas de disponibilidad
4. **Tiempo real**: Si alguien reserva un horario, inmediatamente desaparece para otros

### **Integración automática:**
- Las reservas web **SE GUARDAN AUTOMÁTICAMENTE** en tu base de datos
- Recibes **email de notificación** de cada nueva cita
- El cliente recibe **confirmación automática por email**
- Los horarios ocupados **desaparecen automáticamente** del formulario web

---

## 🔧 **Configuración Paso a Paso**

### **Paso 1: Configura tus Horarios Base**
1. Ve al **Calendario** en tu CRM
2. Haz clic en **"Gestionar Horarios"**
3. En la pestaña **"Horarios Semanales"**:
   - Agrega tus días de trabajo (ej: Lunes 9:00-18:00)
   - Define la duración de cada cita (recomendado: 60 minutos)
   - Establece descansos si necesitas (ej: 15 minutos entre citas)

### **Ejemplo de configuración típica:**
```
Lunes:    09:00 - 18:00 (citas de 60 min, 0 min descanso)
Martes:   09:00 - 18:00 (citas de 60 min, 0 min descanso)  
Miércoles: 09:00 - 18:00 (citas de 60 min, 0 min descanso)
Jueves:   09:00 - 18:00 (citas de 60 min, 0 min descanso)
Viernes:  09:00 - 14:00 (citas de 60 min, 0 min descanso)
```

### **Paso 2: Configura Excepciones**
Cuando tengas días especiales:
1. Ve a la pestaña **"Excepciones"**
2. **Para vacaciones**: Tipo "No disponible" + fecha + motivo
3. **Para horarios especiales**: Tipo "Horario personalizado" + horarios diferentes

### **Paso 3: Ajusta Configuración General**
1. Ve a la pestaña **"Configuración"**
2. **Días de anticipación**: 30 días (recomendado)
3. **Reservas mismo día**: Desactivado (recomendado)
4. **Tiempo mínimo**: 2-4 horas (para que tengas tiempo de prepararte)
5. **Máximo citas por día**: Según tu capacidad (ej: 8 citas)

---

## 📊 **Vista en el Calendario CRM**

### **Información visual mejorada:**
- **Días disponibles**: Punto verde + número de slots disponibles
- **Días ocupados**: Punto rojo con número de citas
- **Días no disponibles**: Punto gris
- **Panel de disponibilidad**: Muestra horarios disponibles del día seleccionado

### **Estadísticas en tiempo real:**
Al seleccionar un día, verás:
- **Horarios disponibles**: Lista de slots libres
- **Horarios ocupados**: Cuántos están reservados
- **Configuración activa**: Qué reglas se están aplicando

---

## 🌐 **Integración con tu Sitio Web**

### **API actualizada automáticamente:**
- **`/api/reservas.php?action=available-dates`**: Obtiene fechas disponibles
- **`/api/reservas.php?action=time-slots&date=2024-01-15`**: Obtiene horarios de un día específico
- **`/api/reservas.php`** (POST): Crea nueva cita (verificando disponibilidad)

### **Formulario web inteligente:**
- Consulta tu configuración en **tiempo real**
- Solo muestra fechas donde realmente trabajas
- Horarios se actualizan automáticamente según ocupación
- Validación automática de disponibilidad antes de confirmar

---

## 💡 **Casos de Uso Típicos**

### **Caso 1: Día normal de trabajo**
```
Configuración: Lunes 9:00-18:00, citas de 60 min
Resultado web: 9:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00
Si alguien reserva 10:00 → ese horario desaparece para otros
```

### **Caso 2: Día de vacaciones**
```
Configuración: Excepción "No disponible" el 25-12-2024
Resultado web: Esa fecha ni siquiera aparece en el calendario
```

### **Caso 3: Día con horario especial**
```
Configuración: Excepción "Horario personalizado" 9:00-14:00 el 24-12-2024
Resultado web: Solo aparecen horarios 9:00, 10:00, 11:00, 12:00, 13:00
```

### **Caso 4: Limitar citas por día**
```
Configuración: Máximo 4 citas por día
Resultado: Cuando se reservan 4 citas, ese día desaparece del formulario web
```

---

## 🔄 **Flujo Completo de Reserva**

### **1. Cliente ve tu web:**
- Formulario muestra solo TUS fechas disponibles
- Horarios se generan según TUS reglas
- Sistema verifica disponibilidad en tiempo real

### **2. Cliente reserva:**
- Sistema valida que el slot siga disponible
- Crea cita en tu base de datos
- Envía emails de confirmación (cliente + tú)

### **3. En tu CRM:**
- La cita aparece automáticamente en tu calendario
- Ves toda la información del cliente
- Puedes gestionar, confirmar o cancelar la cita

---

## 🛠️ **Mantenimiento y Gestión**

### **Actualizaciones frecuentes:**
- **Cambiar horarios**: Modifica las reglas y se aplican automáticamente al web
- **Agregar excepciones**: Para días especiales o vacaciones
- **Exportar/Importar**: Backup de tu configuración
- **Resetear**: Volver a configuración por defecto

### **Monitoreo:**
- **Vista previa**: Ve cómo ven tu disponibilidad los clientes
- **Próximas fechas**: Lista de fechas disponibles
- **Próximo slot**: Cuándo es tu próxima cita disponible

---

## 📈 **Beneficios del Sistema**

### **Para ti:**
✅ **Control total** sobre cuándo pueden reservar  
✅ **Automatización completa** - no más coordinación manual  
✅ **Información centralizada** - todo en tu CRM  
✅ **Flexibilidad** - cambios se aplican instantáneamente  
✅ **Profesionalismo** - sistema integrado y automático  

### **Para tus clientes:**
✅ **Reservas 24/7** sin esperar respuesta  
✅ **Solo fechas reales** - no pierden tiempo con días no disponibles  
✅ **Confirmación inmediata** por email  
✅ **Experiencia fluida** - proceso de 3 pasos simple  

---

## 🚨 **Importante: Configuración Inicial**

### **Antes de activar en tu web:**
1. **Configura tus horarios base** en el CRM
2. **Prueba el sistema** con reservas de prueba
3. **Verifica que recibes los emails** de notificación
4. **Actualiza las URLs** en el formulario web
5. **Configura las credenciales** de base de datos en la API

### **URLs actualizadas en reservas.html:**
```javascript
// Línea 66: URL configurada para tu dominio
const API_URL = 'https://www.pgkhiszpanii.com/reservas/api/reservas.php';
```

---

## 🎉 **¡Ya tienes el control completo!**

Ahora puedes:
- 📅 **Definir exactamente cuándo trabajas**
- 🚫 **Bloquear días de vacaciones o reuniones**  
- ⏰ **Configurar la duración perfecta para cada tipo de consulta**
- 📱 **Que los clientes reserven automáticamente 24/7**
- 📊 **Ver todo integrado en tu calendario CRM**

**¡Tu sistema de citas ahora es completamente profesional y automatizado!** 🚀