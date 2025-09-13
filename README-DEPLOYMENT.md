# 🚀 Guía de Despliegue - CRM Polska Grupa Konsultingowa

## 📋 Checklist Pre-Despliegue

### 1. 🔧 Configuración de Producción

#### Variables de Entorno (.env.production)
```bash
# Supabase (si lo usas)
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_publica_de_supabase

# Configuración de producción
VITE_APP_ENV=production
VITE_APP_URL=https://tu-dominio.com
```

### 2. 🏗️ Build de Producción
```bash
# Instalar dependencias
npm install

# Crear build optimizado
npm run build

# El contenido estará en la carpeta 'dist/'
```

### 3. 🌐 Opciones de Hosting

#### A) **Netlify** (Recomendado - Gratis)
1. Conecta tu repositorio GitHub
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Variables de entorno en Netlify Dashboard

#### B) **Vercel** (Gratis)
1. Conecta GitHub
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

#### C) **Hosting Tradicional** (cPanel, etc.)
1. Sube el contenido de `dist/` a `public_html/`
2. Configura redirects para SPA

### 4. 📱 Configuración WhatsApp

#### Para WhatsApp Business API (Producción):
```javascript
// En producción, reemplaza en WhatsAppMessenger.tsx
const sendToWhatsApp = (phone, message) => {
  // Opción 1: WhatsApp Business API
  const businessApiUrl = `https://graph.facebook.com/v17.0/YOUR_PHONE_ID/messages`;
  
  // Opción 2: Twilio WhatsApp
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/YOUR_SID/Messages.json`;
  
  // Opción 3: Mantener WhatsApp Web (actual)
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
};
```

### 5. 🤖 Integración IA (Opcional)

#### OpenAI API:
```bash
# Añadir a .env.production
VITE_OPENAI_API_KEY=tu_clave_openai
```

#### Implementación:
```javascript
// src/services/aiService.js
export const generateAIMessage = async (clientData, context) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'system',
        content: `Eres un asistente de Polska Grupa Konsultingowa...`
      }]
    })
  });
  return response.json();
};
```

### 6. 📊 Base de Datos

#### Opción A: Supabase (Recomendado)
- ✅ Ya configurado
- ✅ Gratis hasta 500MB
- ✅ Backup automático

#### Opción B: Firebase
```bash
npm install firebase
```

#### Opción C: Base de datos propia
- MySQL/PostgreSQL en tu hosting
- Crear API backend (Node.js/PHP)

### 7. 🔒 Seguridad

#### Headers de Seguridad:
```javascript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react']
        }
      }
    }
  },
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff'
    }
  }
});
```

### 8. 📈 Analytics (Opcional)

#### Google Analytics:
```html
<!-- En index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🎯 Pasos Específicos por Hosting

### Para Netlify:
1. `git push` tu código
2. Conectar repo en netlify.com
3. Deploy automático
4. Configurar dominio personalizado

### Para cPanel/Hosting Tradicional:
1. `npm run build`
2. Subir contenido de `dist/` vía FTP
3. Configurar `.htaccess`:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## 🔧 Troubleshooting

### Problema: Rutas no funcionan
**Solución:** Configurar redirects para SPA

### Problema: Variables de entorno no cargan
**Solución:** Verificar prefijo `VITE_`

### Problema: WhatsApp no abre
**Solución:** Verificar formato de teléfono (+34...)

## 📞 Soporte Post-Despliegue

1. **Monitoreo:** Configurar alertas de errores
2. **Backups:** Exportar datos regularmente
3. **Updates:** Mantener dependencias actualizadas
4. **SSL:** Certificado HTTPS obligatorio

---

¿Necesitas ayuda con algún paso específico? ¡Estoy aquí para ayudarte! 🚀