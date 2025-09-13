import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

const STORAGE_KEY = 'pgk-crm-auth';

// IPs permitidas (agregar las IPs de tu oficina/casa)
const ALLOWED_IPS = [
  '192.168.1.',  // Red local típica
  '10.0.0.',     // Otra red local común
  '127.0.0.1',   // Localhost
  // Agrega aquí las IPs específicas de tu oficina:
  // '85.123.45.67', // IP de tu oficina (ejemplo)
];

// Función para verificar IP (simplificada para desarrollo)
const isIPAllowed = async (): Promise<boolean> => {
  try {
    // En desarrollo, siempre permitir
    if (import.meta.env.DEV) {
      return true;
    }
    
    // En producción, verificar IP real
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    const userIP = data.ip;
    
    console.log('🌍 IP del usuario:', userIP);
    
    return ALLOWED_IPS.some(allowedIP => userIP.startsWith(allowedIP));
  } catch (error) {
    console.error('Error verificando IP:', error);
    return false; // Si no puede verificar, denegar acceso
  }
};

// Credenciales desde variables de entorno
const VALID_USERS = [
  {
    id: 'nati-001',
    email: import.meta.env.VITE_NATI_EMAIL || 'info@bizneswhiszpanii.com',
    password: import.meta.env.VITE_NATI_PASSWORD || 'fallback123',
    name: 'Nati',
    role: 'admin'
  },
  {
    id: 'kenyi-001', 
    email: import.meta.env.VITE_KENYI_EMAIL || 'admin@pgkhiszpanii.com',
    password: import.meta.env.VITE_KENYI_PASSWORD || 'fallback123',
    name: 'Kenyi',
    role: 'superadmin'
  }
];

export const useSecureAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ipBlocked, setIpBlocked] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      // Verificar IP primero
      const ipAllowed = await isIPAllowed();
      if (!ipAllowed) {
        setIpBlocked(true);
        setLoading(false);
        return;
      }

      // Si la IP está permitida, verificar sesión guardada
      const savedAuth = localStorage.getItem(STORAGE_KEY);
      if (savedAuth) {
        try {
          const parsedAuth = JSON.parse(savedAuth);
          setUser(parsedAuth);
        } catch (error) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setLoading(false);
    };

    checkAccess();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Verificar IP antes de login
    const ipAllowed = await isIPAllowed();
    if (!ipAllowed) {
      return { error: new Error('Acceso no permitido desde esta ubicación') };
    }

    console.log('🔐 Intentando login desde IP permitida...');
    
    const validUser = VALID_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (validUser) {
      const user: User = {
        id: validUser.id,
        email: validUser.email,
        name: validUser.name,
        role: validUser.role
      };
      
      setUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return { error: null };
    } else {
      return { error: new Error('Credenciales incorrectas') };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  // Si IP bloqueada, mostrar mensaje específico
  if (ipBlocked) {
    return {
      user: null,
      profile: null,
      loading: false,
      ipBlocked: true,
      signIn: async () => ({ error: new Error('IP no autorizada') }),
      signUp: async () => ({ error: new Error('IP no autorizada') }),
      signOut: async () => {},
      resetPassword: async () => ({ error: new Error('IP no autorizada') }),
    };
  }

  return {
    user,
    profile: user,
    loading,
    ipBlocked: false,
    signIn,
    signUp: async () => ({ error: new Error('Registro no disponible') }),
    signOut,
    resetPassword: async () => ({ error: new Error('Función no disponible') }),
  };
};