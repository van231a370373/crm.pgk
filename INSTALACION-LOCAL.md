# 🏠 Instalación Local - CRM Polska Grupa Konsultingowa

## 📋 Requisitos Previos

### 1. **Node.js** (Obligatorio)
- **Descargar:** https://nodejs.org/
- **Versión recomendada:** 18.x o superior
- **Verificar instalación:**
  ```bash
  node --version
  npm --version
  ```

### 2. **Git** (Recomendado)
- **Descargar:** https://git-scm.com/
- **Para clonar y gestionar el código**

## 🚀 Pasos de Instalación

### **Paso 1: Descargar el Código**

#### Opción A: Descargar ZIP
1. Descargar todos los archivos del proyecto
2. Crear una carpeta llamada `crm-polska-grupa`
3. Extraer todos los archivos en esa carpeta

#### Opción B: Usar Git (Recomendado)
```bash
# Si tienes el código en un repositorio
git clone [URL_DEL_REPOSITORIO] crm-polska-grupa
cd crm-polska-grupa
```

### **Paso 2: Instalar Dependencias**
```bash
# Abrir terminal en la carpeta del proyecto
cd crm-polska-grupa

# Instalar todas las dependencias
npm install
```

### **Paso 3: Configurar Variables de Entorno (Opcional)**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones (opcional)
# Para uso local básico, no es necesario modificar nada
```

### **Paso 4: Ejecutar la Aplicación**
```bash
# Iniciar servidor de desarrollo
npm run dev
```

### **Paso 5: Acceder a la Aplicación**
- **URL:** http://localhost:5173
- **Se abrirá automáticamente en tu navegador**
- **¡Ya puedes usar tu CRM!**

## 📁 Estructura de Archivos Creada

```
crm-polska-grupa/
├── src/
│   ├── components/     # Componentes de la interfaz
│   ├── hooks/         # Lógica de estado
│   ├── types/         # Definiciones de tipos
│   ├── utils/         # Utilidades y exportación
│   └── App.tsx        # Aplicación principal
├── public/            # Archivos estáticos
├── package.json       # Dependencias del proyecto
└── README.md         # Documentación
```

## 💾 Almacenamiento de Datos

### **🔒 Datos Locales (Privados)**
- **Ubicación:** Navegador web (localStorage)
- **Seguridad:** Solo accesible desde tu ordenador
- **Persistencia:** Los datos se mantienen entre sesiones
- **Backup:** Se puede exportar a Excel/CSV

### **📊 Datos Incluidos:**
- ✅ **Clientes:** Información completa de contactos
- ✅ **Tareas:** Agenda y seguimiento
- ✅ **Mensajes WhatsApp:** Historial de comunicaciones
- ✅ **Categorías:** Servicios personalizables

## 🛠️ Comandos Útiles

### **Desarrollo Diario:**
```bash
# Iniciar la aplicación
npm run dev

# Parar la aplicación
Ctrl + C (en terminal)
```

### **Mantenimiento:**
```bash
# Actualizar dependencias
npm update

# Limpiar caché
npm run build
```

### **Exportar Datos:**
- **Desde la aplicación:** Botón "Exportar" → Excel/CSV
- **Backup completo:** Copiar carpeta del proyecto

## 🔧 Solución de Problemas

### **❌ Error: "npm no reconocido"**
**Solución:** Instalar Node.js desde https://nodejs.org/

### **❌ Error: "Puerto 5173 ocupado"**
**Solución:** 
```bash
# Usar otro puerto
npm run dev -- --port 3000
```

### **❌ Error: "Dependencias faltantes"**
**Solución:**
```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### **❌ Datos perdidos**
**Solución:** Los datos están en localStorage del navegador
- **Backup regular:** Exportar a Excel/CSV
- **Cambio de navegador:** Exportar/importar datos

## 🌐 Acceso desde Otros Dispositivos

### **En la Misma Red WiFi:**
```bash
# Iniciar con acceso de red
npm run dev -- --host

# Acceder desde otros dispositivos:
# http://[IP_DE_TU_ORDENADOR]:5173
```

### **Encontrar tu IP:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

## 🔒 Seguridad y Privacidad

### **✅ Ventajas del Uso Local:**
- **Datos privados:** Solo en tu ordenador
- **Sin internet:** Funciona offline
- **Control total:** Tú gestionas todo
- **Sin costes:** Completamente gratuito
- **Personalizable:** Puedes modificar el código

### **🛡️ Recomendaciones:**
- **Backup regular:** Exportar datos semanalmente
- **Antivirus activo:** Proteger tu ordenador
- **Actualizaciones:** Mantener Node.js actualizado

## 📞 Soporte Técnico

### **🆘 Si Necesitas Ayuda:**
1. **Verificar requisitos:** Node.js instalado correctamente
2. **Revisar terminal:** Leer mensajes de error
3. **Reiniciar:** Cerrar terminal y volver a ejecutar
4. **Documentación:** Consultar este archivo

### **📧 Contacto:**
- **Para dudas técnicas:** Consultar documentación online
- **Para personalización:** Modificar código fuente
- **Para backup:** Usar función de exportación

---

## 🎉 ¡Listo para Usar!

Una vez completados estos pasos, tendrás tu **CRM Polska Grupa Konsultingowa** funcionando completamente en tu ordenador de forma privada y segura.

**Características disponibles:**
- ✅ Gestión completa de clientes
- ✅ Agenda de tareas
- ✅ Mensajería WhatsApp
- ✅ Exportación de datos
- ✅ Modo oscuro/claro
- ✅ Filtros avanzados
- ✅ Estadísticas en tiempo real

¡Disfruta de tu CRM personal! 🚀