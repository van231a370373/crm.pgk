import React, { useState } from 'react';
import { 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Key,
  Globe,
  MessageSquare,
  Copy,
  RefreshCw
} from 'lucide-react';

interface WhatsAppSetupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppSetup: React.FC<WhatsAppSetupProps> = ({ isOpen, onClose }) => {
  const [setupStep, setSetupStep] = useState<'choose' | 'web' | 'api'>('choose');
  const [apiConfig, setApiConfig] = useState({
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
    webhookUrl: ''
  });

  const testWhatsAppWeb = () => {
    const testPhone = '34638264142'; // Teléfono de prueba
    const testMessage = 'Hola, este es un mensaje de prueba desde Polska Grupa Konsultingowa CRM';
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${testPhone}&text=${encodeURIComponent(testMessage)}`;
    
    console.log('🧪 Probando WhatsApp Web:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
    
    setTimeout(() => {
      const confirmed = confirm('¿Se abrió WhatsApp Web correctamente con el mensaje preparado?');
      if (confirmed) {
        alert('✅ ¡WhatsApp Web configurado correctamente!\n\nYa puedes usar el CRM para enviar mensajes.');
        localStorage.setItem('whatsapp-web-enabled', 'true');
        onClose();
      } else {
        alert('❌ Parece que hay un problema. Asegúrate de:\n\n1. Tener WhatsApp Web abierto\n2. Estar logueado en web.whatsapp.com\n3. Permitir pop-ups en el navegador');
      }
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('✅ Copiado al portapapeles');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-green-600 text-white">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Configurar WhatsApp</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-green-700 rounded-lg">
            <div className="w-5 h-5">✕</div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {setupStep === 'choose' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <MessageSquare className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Conectar WhatsApp al CRM
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Elige cómo quieres integrar WhatsApp con tu CRM
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                
                {/* WhatsApp Web - Fácil */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Globe className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        WhatsApp Web
                      </h4>
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Recomendado - Fácil</span>
                      </div>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                        <li>✅ Configuración instantánea</li>
                        <li>✅ Usa tu WhatsApp personal</li>
                        <li>✅ Gratis</li>
                        <li>✅ Funciona inmediatamente</li>
                        <li>⚠️ Requiere tener WhatsApp Web abierto</li>
                      </ul>
                      <button
                        onClick={() => setSetupStep('web')}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Configurar WhatsApp Web
                      </button>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Business API - Profesional */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Key className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        WhatsApp Business API
                      </h4>
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-amber-600 font-medium">Avanzado - Requiere configuración</span>
                      </div>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                        <li>✅ Totalmente automático</li>
                        <li>✅ Sin límites de envío</li>
                        <li>✅ Templates oficiales</li>
                        <li>✅ Webhooks y notificaciones</li>
                        <li>⚠️ Requiere cuenta Meta Business</li>
                        <li>⚠️ Proceso de verificación</li>
                      </ul>
                      <button
                        onClick={() => setSetupStep('api')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Configurar Business API
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {setupStep === 'web' && (
            <div className="space-y-6">
              <button 
                onClick={() => setSetupStep('choose')} 
                className="text-gray-600 hover:text-gray-800 mb-4"
              >
                ← Volver a opciones
              </button>
              
              <div className="text-center mb-8">
                <Globe className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Configurar WhatsApp Web
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Configuración rápida usando WhatsApp Web
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">Requisitos previos:</h4>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                      <li>1. Tener WhatsApp instalado en tu móvil (+34 644 10 62 22)</li>
                      <li>2. Abrir WhatsApp Web en tu navegador</li>
                      <li>3. Escanear el código QR para vincular</li>
                      <li>4. Mantener el móvil conectado a internet</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                    <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                    <span>Abrir WhatsApp Web</span>
                  </h4>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => window.open('https://web.whatsapp.com/', '_blank')}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Abrir WhatsApp Web</span>
                    </button>
                    <span className="text-gray-500 text-sm">web.whatsapp.com</span>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                    <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                    <span>Probar conexión</span>
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Una vez que tengas WhatsApp Web activo, haz clic para probar si funciona:
                  </p>
                  <button
                    onClick={testWhatsAppWeb}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>🧪 Probar WhatsApp Web</span>
                  </button>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">¿Cómo funciona?</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• El CRM abrirá WhatsApp Web con el mensaje preparado</li>
                  <li>• Tú solo tienes que hacer clic en "Enviar" en WhatsApp</li>
                  <li>• El historial se guarda automáticamente en el CRM</li>
                  <li>• Funciona desde cualquier navegador</li>
                </ul>
              </div>
            </div>
          )}

          {setupStep === 'api' && (
            <div className="space-y-6">
              <button 
                onClick={() => setSetupStep('choose')} 
                className="text-gray-600 hover:text-gray-800 mb-4"
              >
                ← Volver a opciones
              </button>
              
              <div className="text-center mb-8">
                <Key className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  WhatsApp Business API
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Integración profesional con la API oficial de Meta
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Pasos necesarios:</h4>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                  <li>Crear cuenta Meta Business</li>
                  <li>Configurar WhatsApp Business API</li>
                  <li>Verificar número de teléfono (+34 644 10 62 22)</li>
                  <li>Obtener tokens de acceso</li>
                  <li>Configurar webhook para recibir mensajes</li>
                </ol>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Access Token
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="password"
                        value={apiConfig.accessToken}
                        onChange={(e) => setApiConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                        placeholder="EAAxxxxxxxxxx..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        onClick={() => copyToClipboard(apiConfig.accessToken)}
                        className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number ID
                    </label>
                    <input
                      type="text"
                      value={apiConfig.phoneNumberId}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                      placeholder="123456789012345"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Account ID
                    </label>
                    <input
                      type="text"
                      value={apiConfig.businessAccountId}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, businessAccountId: e.target.value }))}
                      placeholder="987654321098765"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Webhook URL (Opcional)
                    </label>
                    <input
                      type="url"
                      value={apiConfig.webhookUrl}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                      placeholder="https://tu-servidor.com/webhook/whatsapp"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      // Guardar configuración
                      localStorage.setItem('whatsapp-api-config', JSON.stringify(apiConfig));
                      alert('✅ Configuración guardada. Para activar la API, reinicia la aplicación.');
                      onClose();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={!apiConfig.accessToken || !apiConfig.phoneNumberId}
                  >
                    Guardar Configuración
                  </button>
                  
                  <button
                    onClick={() => window.open('https://developers.facebook.com/docs/whatsapp', '_blank')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Ver Documentación</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};