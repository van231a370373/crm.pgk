// Script para verificar configuración antes del despliegue
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración para producción...\n');

// Leer archivo .env
const envPath = path.join(__dirname, '..', '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ No se encontró el archivo .env');
  process.exit(1);
}

// Verificar variables críticas
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_NATI_EMAIL',
  'VITE_NATI_PASSWORD',
  'VITE_KENYI_EMAIL',
  'VITE_KENYI_PASSWORD'
];

const missingVars = [];
const defaultVars = [];

requiredVars.forEach(varName => {
  const regex = new RegExp(`${varName}=(.+)`);
  const match = envContent.match(regex);
  
  if (!match) {
    missingVars.push(varName);
  } else {
    const value = match[1].trim();
    if (value.includes('tu-') || value.includes('fallback') || value === '') {
      defaultVars.push(varName);
    }
  }
});

// Resultados
let hasErrors = false;

if (missingVars.length > 0) {
  console.error('❌ Variables faltantes:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  hasErrors = true;
}

if (defaultVars.length > 0) {
  console.warn('⚠️ Variables con valores por defecto:');
  defaultVars.forEach(v => console.warn(`   - ${v}`));
  hasErrors = true;
}

if (hasErrors) {
  console.log('\n📝 Para solucionarlo:');
  console.log('1. Crear proyecto en https://supabase.com');
  console.log('2. Ejecutar el script SQL: supabase-setup.sql');
  console.log('3. Actualizar .env con las URLs y claves reales');
  console.log('4. Cambiar las contraseñas por unas seguras');
  process.exit(1);
} else {
  console.log('✅ Configuración lista para producción!');
  console.log('🚀 Construyendo aplicación...\n');
}