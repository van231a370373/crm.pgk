// Configuración de seguridad adicional
export const SECURITY_CONFIG = {
  // Tiempo de sesión en minutos
  SESSION_TIMEOUT: 480, // 8 horas
  
  // Número máximo de intentos de login
  MAX_LOGIN_ATTEMPTS: 5,
  
  // Tiempo de bloqueo tras intentos fallidos (minutos)  
  LOCKOUT_DURATION: 30,
  
  // Requiere confirmación cada X horas
  REQUIRE_REAUTH_HOURS: 24,
  
  // IPs permitidas (agrega las tuyas)
  ALLOWED_IPS: [
    '127.0.0.1',      // Localhost
    '192.168.1.',     // Red local común
    '10.0.0.',        // Otra red local
    // Agrega aquí las IPs específicas:
    // '85.123.45.67', // IP fija de tu oficina
    // '90.87.123.',   // Rango de IP de tu proveedor
  ]
};

// Función para generar token de sesión seguro
export const generateSessionToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Función para verificar si una sesión ha expirado
export const isSessionExpired = (loginTime: string): boolean => {
  const now = new Date().getTime();
  const login = new Date(loginTime).getTime();
  const diffMinutes = (now - login) / (1000 * 60);
  return diffMinutes > SECURITY_CONFIG.SESSION_TIMEOUT;
};

// Función para encriptar datos sensibles (simple)
export const encryptData = (data: string): string => {
  // Implementación básica - en producción usar crypto real
  return btoa(data.split('').reverse().join(''));
};

export const decryptData = (encryptedData: string): string => {
  try {
    return atob(encryptedData).split('').reverse().join('');
  } catch {
    return '';
  }
};