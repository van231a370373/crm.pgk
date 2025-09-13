import React, { useState } from 'react';
import { useSimpleAuth } from '../hooks/useSimpleAuth';
import { LogIn, UserPlus, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

interface LoginProps {
  onSwitchToSignup: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useSimpleAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Formulario enviado con:', { email, password });
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);

    console.log('🔄 Resultado del signIn:', { error });

    if (error) {
      setError(error.message);
    } else {
      console.log('✅ Login exitoso!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Accede a tu cuenta de CRM
          </p>
          
          {/* Credenciales de desarrollo */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              🔑 Credenciales de Acceso:
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    console.log('🔥 LOGIN DIRECTO NATI');
                    const result = await signIn('info@bizneswhiszpanii.com', 'Kocham647');
                    console.log('🔥 Resultado:', result);
                  }}
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-xs font-medium transition-colors"
                >
                  🚀 Login Directo Nati
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    console.log('🔥 LOGIN DIRECTO KENYI');
                    const result = await signIn('admin@pgkhiszpanii.com', 'Kocham647');
                    console.log('🔥 Resultado:', result);
                  }}
                  className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded text-xs font-medium transition-colors"
                >
                  � Login Directo Kenyi
                </button>
              </div>
              <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                <div>📧 info@bizneswhiszpanii.com / admin@pgkhiszpanii.com</div>
                <div>🔒 Kocham647</div>
              </div>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Correo electrónico
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="tu@email.com"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className=" -ml-1 mr-2 h-5 w-5" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </div>

          {/* Botones de acceso rápido */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@pgkhiszpanii.com');
                setPassword('Kocham647');
              }}
              className="px-3 py-2 text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded border border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
            >
              🚀 Llenar Kenyi
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('info@bizneswhiszpanii.com');
                setPassword('Kocham647');
              }}
              className="px-3 py-2 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded border border-purple-300 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
            >
              👤 Llenar Nati
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              ¿No tienes cuenta? Regístrate aquí
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};