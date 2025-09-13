import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  MessageCircle, 
  Bot, 
  Copy, 
  RefreshCw,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Client, WhatsAppMessage } from '../types';
import { useGeminiAI } from '../hooks/useGeminiAI';

interface WhatsAppMessengerProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (clientId: string, message: string, aiGenerated: boolean, context?: string) => void;
  messages: WhatsAppMessage[];
}

export const WhatsAppMessenger: React.FC<WhatsAppMessengerProps> = ({
  client,
  isOpen,
  onClose,
  onSendMessage,
  messages,
}) => {
  const [message, setMessage] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [selectedContext, setSelectedContext] = useState('general');

  const { generateWhatsAppResponse } = useGeminiAI();

  const clientMessages = messages.filter(m => m.clientId === client.id).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  useEffect(() => {
    if (isOpen && client) {
      generateAISuggestions();
    }
  }, [isOpen, client, selectedContext]);

  const generateAISuggestions = async () => {
    setIsGeneratingAI(true);
    try {
      const conversationHistory = clientMessages.map(m => m.message);
      
      const contextPrompt = "Genera exactamente 3 opciones de mensajes profesionales de WhatsApp para el cliente " + client.name + ". Contexto: " + selectedContext + ". Cada mensaje en una linea separada, sin numeracion, sin vinetas.";
      
      const baseMessage = await generateWhatsAppResponse(client, contextPrompt, conversationHistory);
      
      const options = baseMessage.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 10 && !line.match(/^\d+[\.\)]/))
        .slice(0, 3);
      
      if (options.length >= 3) {
        setAiSuggestions(options);
      } else {
        throw new Error('Insufficient AI responses');
      }
      
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      
      const fallbackSuggestions = {
        general: [
          "Hola " + client.name + ", como va todo con su consulta de " + client.consultationType + "?",
          "Buenos dias " + client.name + ", queria saber si necesita alguna actualizacion sobre su tramite.",
          "Estimado/a " + client.name + ", podriamos coordinar una llamada para revisar su caso?"
        ],
        followup: [
          "Hola " + client.name + ", le escribo para darle seguimiento a su consulta. Tiene alguna pregunta?",
          "Buenos dias " + client.name + ", su tramite avanza segun lo previsto. Necesita algun documento?",
          "Estimado/a " + client.name + ", cuando le vendria bien que conversemos sobre los proximos pasos?"
        ],
        payment: [
          "Hola " + client.name + ", le escribo para recordarle sobre el pago pendiente. Podriamos coordinarlo?",
          "Buenos dias " + client.name + ", podriamos regularizar el tema del pago de su consulta?",
          "Estimado/a " + client.name + ", si necesita facilidades de pago, podemos conversarlo."
        ]
      };
      
      setAiSuggestions(fallbackSuggestions[selectedContext as keyof typeof fallbackSuggestions] || fallbackSuggestions.general);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Registrar el mensaje en el historial del CRM
    onSendMessage(client.id, message, false);
    
    // Preparar el teléfono del cliente (quitar espacios y caracteres especiales)
    let clientPhone = client.phones?.[0]?.value?.replace(/\D/g, '') || '';
    
    // Asegurar formato internacional correcto
    if (clientPhone.startsWith('34')) {
      clientPhone = clientPhone; // Ya tiene código de país
    } else if (clientPhone.startsWith('6') || clientPhone.startsWith('9')) {
      clientPhone = '34' + clientPhone; // Agregar código de España
    }
    
    // Abrir WhatsApp Web con el mensaje preparado
    if (clientPhone && clientPhone.length >= 9) {
      const whatsappUrl = `https://web.whatsapp.com/send?phone=${clientPhone}&text=${encodeURIComponent(message)}`;
      console.log('🚀 Abriendo WhatsApp:', whatsappUrl);
      window.open(whatsappUrl, '_blank');
      
      // Mostrar confirmación
      alert(`✅ WhatsApp abierto para enviar a +${clientPhone}\n\n📱 Asegúrate de tener WhatsApp Web activo en tu navegador`);
    } else {
      alert('❌ Teléfono inválido: ' + (client.phones?.[0]?.value || 'Sin teléfono'));
    }
    
    setMessage('');
  };

  const handleUseSuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  const handleSendAISuggestion = (suggestion: string) => {
    // Registrar en el historial
    onSendMessage(client.id, suggestion, true, selectedContext);
    
    // Preparar el teléfono del cliente
    let clientPhone = client.phones?.[0]?.value?.replace(/\D/g, '') || '';
    
    // Asegurar formato internacional correcto
    if (clientPhone.startsWith('34')) {
      clientPhone = clientPhone; // Ya tiene código de país
    } else if (clientPhone.startsWith('6') || clientPhone.startsWith('9')) {
      clientPhone = '34' + clientPhone; // Agregar código de España
    }
    
    // Abrir WhatsApp Web directamente
    if (clientPhone && clientPhone.length >= 9) {
      const whatsappUrl = `https://web.whatsapp.com/send?phone=${clientPhone}&text=${encodeURIComponent(suggestion)}`;
      console.log('🚀 Enviando sugerencia IA a WhatsApp:', whatsappUrl);
      window.open(whatsappUrl, '_blank');
      
      // Mostrar confirmación
      alert(`🤖 ✅ Sugerencia IA lista para enviar a +${clientPhone}\n\n"${suggestion.substring(0, 50)}..."`);
    } else {
      alert('❌ Teléfono inválido: ' + (client.phones?.[0]?.value || 'Sin teléfono'));
    }
  };

  const getStatusIcon = (status: WhatsAppMessage['status']) => {
    switch (status) {
      case 'sent': return <Check className="w-3 h-3 text-gray-500" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-gray-500" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'failed': return <AlertCircle className="w-3 h-3 text-red-500" />;
      default: return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-green-600 text-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">WhatsApp a {client.name}</h3>
              <p className="text-xs opacity-90">📱 Para: {client.phones?.[0]?.value || 'Sin teléfono'}</p>
              <p className="text-xs opacity-75">📤 Desde: +34 644 10 62 22 (Polska Grupa)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-green-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900 dark:text-white">Sugerencias IA</span>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedContext}
                onChange={(e) => setSelectedContext(e.target.value)}
                className="text-xs px-2 py-1 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="general">General</option>
                <option value="followup">Seguimiento</option>
                <option value="payment">Pago</option>
              </select>
              <button
                onClick={generateAISuggestions}
                disabled={isGeneratingAI}
                className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded"
              >
                <RefreshCw className={isGeneratingAI ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            {isGeneratingAI ? (
              <div className="text-center py-4">
                <Bot className="w-8 h-8 animate-pulse text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Generando sugerencias inteligentes...</p>
              </div>
            ) : (
              aiSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-white dark:bg-gray-700 rounded-lg border">
                  <Sparkles className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                  <p className="text-sm flex-1">{suggestion}</p>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleUseSuggestion(suggestion)}
                      className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded"
                      title="Editar mensaje"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleSendAISuggestion(suggestion)}
                      className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/40 rounded"
                      title="🚀 Abrir WhatsApp y enviar directamente"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {clientMessages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No hay mensajes aun</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Usa las sugerencias IA o escribe tu propio mensaje</p>
            </div>
          ) : (
            clientMessages.map((msg) => (
              <div
                key={msg.id}
                className={msg.type === 'sent' ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={msg.type === 'sent'
                    ? "max-w-[80%] p-3 rounded-2xl bg-green-600 text-white rounded-br-md"
                    : "max-w-[80%] p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md"
                  }
                >
                  <p className="text-sm">{msg.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                    <div className="flex items-center space-x-1">
                      {msg.aiGenerated && (
                        <Bot className="w-3 h-3 opacity-70" />
                      )}
                      {msg.type === 'sent' && getStatusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {/* Información del envío */}
          <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                <MessageCircle className="w-4 h-4" />
                <span><strong>De:</strong> +34 644 10 62 22 (Tú - Polska Grupa)</span>
              </div>
              <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                <span><strong>Para:</strong> {client.phones?.[0]?.value || 'Sin teléfono'} ({client.name})</span>
              </div>
            </div>
          </div>

          <div className="flex items-stretch space-x-3 bg-gray-50 dark:bg-gray-700 p-2 rounded-xl border border-gray-200 dark:border-gray-600">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && message.trim()) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="💬 Escribe tu mensaje profesional para el cliente..."
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
            <button
              onClick={() => {
                if (message.trim()) {
                  handleSendMessage();
                }
              }}
              disabled={!message.trim()}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center space-x-2 font-medium shadow-lg"
              title="Abrir WhatsApp Web y enviar mensaje"
            >
              <Send className="w-4 h-4" />
              <span>📱 Enviar WhatsApp</span>
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 Al hacer clic en "Enviar" se abrirá WhatsApp Web con tu mensaje preparado
          </div>
        </div>
      </div>
    </div>
  );
};
