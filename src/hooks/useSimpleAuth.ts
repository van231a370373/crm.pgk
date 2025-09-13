import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'user';
}

// Credenciales para los usuarios del CRM Polska
const HARDCODED_USERS = [
  {
    id: '1',
    email: 'info@bizneswhiszpanii.com',
    password: 'Kocham647',
    name: 'Nati',
    role: 'admin' as const
  },
  {
    id: '2',
    email: 'admin@pgkhiszpanii.com',
    password: 'Kocham647',
    name: 'Kenyi',
    role: 'superadmin' as const
  }
];

const AUTH_STORAGE_KEY = 'polska_crm_auth';

export const useSimpleAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 useEffect ejecutándose...');
    // Check if user is already logged in
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    console.log('💾 Datos guardados en localStorage:', storedAuth);
    
    if (storedAuth) {
      try {
        const userData = JSON.parse(storedAuth);
        console.log('👤 Usuario recuperado del localStorage:', userData);
        setUser(userData);
      } catch (error) {
        console.log('❌ Error al parsear datos del localStorage:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
    console.log('✅ useEffect completado');
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Intentando login con:', { email, password });
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = HARDCODED_USERS.find(
      u => u.email === email && u.password === password
    );

    console.log('👤 Usuario encontrado:', foundUser);

    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role
      };
      
      console.log('✅ Login exitoso, guardando usuario:', userData);
      setUser(userData);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setLoading(false);
      return { error: null };
    } else {
      console.log('❌ Login fallido - credenciales incorrectas');
      setLoading(false);
      return { error: { message: 'Credenciales incorrectas' } };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // En modo desarrollo, no permitimos registro
    return { error: { message: 'Registro no disponible en modo desarrollo' } };
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const resetPassword = async (email: string) => {
    return { error: { message: 'Función no disponible en modo desarrollo' } };
  };

  return {
    user,
    profile: user, // Para compatibilidad con el hook original
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};