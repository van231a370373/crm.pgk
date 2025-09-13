import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  FileText, 
  Clock, 
  CheckSquare, 
  ArrowRight,
  Bot,
  Calendar,
  AlertTriangle,
  Download,
  Eye,
  Trash2,
  Plus
} from 'lucide-react';
import { useNotionAI } from '../hooks/useNotionAI';
import { Client, WhatsAppMessage } from '../types';

interface InteractionSummary {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  summary: string;
  keyDecisions: string[];
  actionItems: string[];
  followUpNeeded: boolean;
  followUpDate?: string;
  messageCount: number;
  duration: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  rawMessages: string[];
}

interface InteractionSummarizerProps {
  clients: Client[];
  messages: WhatsAppMessage[];
  onCreateTask?: (clientId: string, title: string, description: string, dueDate?: string) => void;
}

export const InteractionSummarizer: React.FC<InteractionSummarizerProps> = ({
  clients,
  messages,
  onCreateTask
}) => {
  const [summaries, setSummaries] = useState<InteractionSummary[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedSummary, setExpandedSummary] = useState<string>('');
  const [autoSummarize, setAutoSummarize] = useState(false);

  const { summarizeInteraction, isProcessing: notionProcessing } = useNotionAI();

  // Agrupar mensajes por cliente y fecha
  const groupMessagesByInteraction = (clientId: string, dateRange: string) => {
    const clientMessages = messages.filter(msg => msg.clientId === clientId);
    
    if (clientMessages.length === 0) return [];

    // Filtrar por rango de fecha
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setFullYear(2020); // Todos los mensajes
    }

    const filteredMessages = clientMessages.filter(msg => 
      new Date(msg.timestamp) >= startDate
    );

    // Agrupar mensajes por sesiones (gaps de más de 2 horas)
    const sessions: WhatsAppMessage[][] = [];
    let currentSession: WhatsAppMessage[] = [];
    
    filteredMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    filteredMessages.forEach((msg, index) => {
      if (index === 0) {
        currentSession = [msg];
      } else {
        const timeDiff = new Date(msg.timestamp).getTime() - new Date(filteredMessages[index - 1].timestamp).getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff > 2) {
          // Nueva sesión
          sessions.push([...currentSession]);
          currentSession = [msg];
        } else {
          currentSession.push(msg);
        }
      }
    });

    if (currentSession.length > 0) {
      sessions.push(currentSession);
    }

    return sessions.filter(session => session.length >= 3); // Solo sesiones con al menos 3 mensajes
  };

  // Generar resumen de una interacción
  const generateSummary = async (clientId: string, sessionMessages: WhatsAppMessage[]): Promise<InteractionSummary> => {
    const client = clients.find(c => c.id === clientId);
    if (!client) throw new Error('Cliente no encontrado');

    const messageTexts = sessionMessages.map(msg => 
      `${msg.type === 'sent' ? 'Nosotros' : client.name}: ${msg.message}`
    );

    const startTime = new Date(sessionMessages[0].timestamp);
    const endTime = new Date(sessionMessages[sessionMessages.length - 1].timestamp);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutos

    try {
      const aiSummary = await summarizeInteraction(client, messageTexts);
      
      return {
        id: `summary-${clientId}-${startTime.getTime()}`,
        clientId,
        clientName: client.name,
        date: startTime.toLocaleString(),
        summary: aiSummary.summary,
        keyDecisions: aiSummary.keyDecisions,
        actionItems: aiSummary.actionItems,
        followUpNeeded: aiSummary.followUpNeeded,
        followUpDate: aiSummary.followUpDate,
        messageCount: sessionMessages.length,
        duration: duration > 60 ? `${Math.floor(duration/60)}h ${duration%60}m` : `${duration}m`,
        sentiment: 'neutral', // Se puede implementar análisis de sentimiento
        confidence: 85,
        rawMessages: messageTexts
      };
    } catch (error) {
      console.error('Error generating summary:', error);
      
      // Fallback manual
      return {
        id: `summary-${clientId}-${startTime.getTime()}`,
        clientId,
        clientName: client.name,
        date: startTime.toLocaleString(),
        summary: `Conversación con ${client.name} sobre ${client.consultationType}. ${sessionMessages.length} mensajes intercambiados.`,
        keyDecisions: [],
        actionItems: ['Revisar conversación manualmente'],
        followUpNeeded: true,
        messageCount: sessionMessages.length,
        duration: duration > 60 ? `${Math.floor(duration/60)}h ${duration%60}m` : `${duration}m`,
        sentiment: 'neutral',
        confidence: 50,
        rawMessages: messageTexts
      };
    }
  };

  // Procesar interacciones seleccionadas
  const processInteractions = async () => {
    if (!selectedClient) return;

    setIsProcessing(true);
    
    try {
      const sessions = groupMessagesByInteraction(selectedClient, selectedDateRange);
      const newSummaries: InteractionSummary[] = [];
      
      for (const session of sessions) {
        const summary = await generateSummary(selectedClient, session);
        newSummaries.push(summary);
        
        // Pausa para evitar saturar la API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setSummaries(prev => [...prev.filter(s => s.clientId !== selectedClient), ...newSummaries]);
    } catch (error) {
      console.error('Error processing interactions:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Crear tarea desde acción pendiente
  const createTaskFromAction = (summary: InteractionSummary, actionItem: string) => {
    if (onCreateTask) {
      const dueDate = summary.followUpDate || 
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      onCreateTask(
        summary.clientId,
        `Seguimiento: ${actionItem}`,
        `Tarea generada automáticamente del resumen de interacción del ${summary.date}.\n\nContexto: ${summary.summary}`,
        dueDate
      );
    }
  };

  // Exportar resumen a texto
  const exportSummary = (summary: InteractionSummary) => {
    const content = `
RESUMEN DE INTERACCIÓN - ${summary.clientName}
Fecha: ${summary.date}
Duración: ${summary.duration}
Mensajes: ${summary.messageCount}

RESUMEN:
${summary.summary}

DECISIONES CLAVE:
${summary.keyDecisions.map(decision => `• ${decision}`).join('\n')}

ACCIONES PENDIENTES:
${summary.actionItems.map(action => `• ${action}`).join('\n')}

SEGUIMIENTO REQUERIDO: ${summary.followUpNeeded ? 'Sí' : 'No'}
${summary.followUpDate ? `Fecha de seguimiento: ${summary.followUpDate}` : ''}

Generado automáticamente por IA - Confianza: ${summary.confidence}%
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumen-${summary.clientName}-${new Date(summary.date).toLocaleDateString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Obtener color según sentimiento
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Procesar automáticamente nuevas interacciones
  useEffect(() => {
    if (autoSummarize && clients.length > 0) {
      const clientsWithRecentMessages = clients.filter(client => {
        const recentMessages = messages.filter(msg => 
          msg.clientId === client.id && 
          new Date(msg.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        return recentMessages.length >= 3;
      });

      clientsWithRecentMessages.forEach(client => {
        const existingSummary = summaries.find(s => 
          s.clientId === client.id && 
          new Date(s.date) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        
        if (!existingSummary) {
          setSelectedClient(client.id);
          setSelectedDateRange('today');
          // Se procesará automáticamente
        }
      });
    }
  }, [autoSummarize, clients, messages]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Resumidor de Interacciones
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Resume automáticamente conversaciones de WhatsApp usando IA
            </p>
          </div>
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoSummarize}
            onChange={(e) => setAutoSummarize(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Auto-resumir</span>
        </label>
      </div>

      {/* Controles de filtro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cliente
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Seleccionar cliente</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name} ({messages.filter(m => m.clientId === client.id).length} mensajes)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Período
          </label>
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="today">Hoy</option>
            <option value="yesterday">Ayer</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="all">Todo</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={processInteractions}
            disabled={!selectedClient || isProcessing || notionProcessing}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {(isProcessing || notionProcessing) ? (
              <>
                <Bot className="w-4 h-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Generar Resumen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lista de resúmenes */}
      {summaries.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Resúmenes Generados ({summaries.length})
          </h3>

          {summaries.map((summary) => (
            <div
              key={summary.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {summary.clientName}
                    </h4>
                    <span className="text-sm text-gray-500">{summary.date}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getSentimentColor(summary.sentiment)}`}>
                      {summary.sentiment}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{summary.messageCount} mensajes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{summary.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Bot className="w-4 h-4" />
                      <span>{summary.confidence}% confianza</span>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-3 bg-white dark:bg-gray-800 p-3 rounded-md">
                    {summary.summary}
                  </p>

                  {summary.keyDecisions.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                        <CheckSquare className="w-4 h-4" />
                        <span>Decisiones Clave</span>
                      </h5>
                      <ul className="space-y-1">
                        {summary.keyDecisions.map((decision, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <ArrowRight className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{decision}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summary.actionItems.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Acciones Pendientes</span>
                      </h5>
                      <ul className="space-y-2">
                        {summary.actionItems.map((action, index) => (
                          <li key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-md">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{action}</span>
                            {onCreateTask && (
                              <button
                                onClick={() => createTaskFromAction(summary, action)}
                                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/60"
                              >
                                Crear Tarea
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summary.followUpNeeded && (
                    <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 p-2 rounded-md">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Seguimiento requerido
                        {summary.followUpDate && ` para el ${new Date(summary.followUpDate).toLocaleDateString()}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setExpandedSummary(expandedSummary === summary.id ? '' : summary.id)}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center space-x-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Ver Conversación</span>
                  </button>

                  <button
                    onClick={() => exportSummary(summary)}
                    className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/60 flex items-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Exportar</span>
                  </button>
                </div>

                <button
                  onClick={() => setSummaries(summaries.filter(s => s.id !== summary.id))}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Eliminar</span>
                </button>
              </div>

              {/* Conversación expandida */}
              {expandedSummary === summary.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <h6 className="font-medium text-gray-900 dark:text-white mb-2">Conversación Completa</h6>
                  <div className="max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3 space-y-2">
                    {summary.rawMessages.map((msg, index) => (
                      <div key={index} className="text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {summaries.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay resúmenes generados
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Selecciona un cliente y período para generar resúmenes automáticos de las conversaciones
          </p>
        </div>
      )}
    </div>
  );
};