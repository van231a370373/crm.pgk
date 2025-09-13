import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  FileText, 
  Filter, 
  Tag, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Brain,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useNotionAI } from '../hooks/useNotionAI';
import { Client } from '../types';

interface ClassificationResult {
  clientId: string;
  originalCategory: string;
  suggestedCategory: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  confidence: number;
  reasoning: string;
}

interface NotesClassifier {
  note: string;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  summary: string;
  confidence: number;
}

interface ClientClassifierProps {
  clients: Client[];
  onClientUpdate: (clientId: string, updates: Partial<Client>) => void;
  onNotesUpdate: (clientId: string, classifiedNote: string) => void;
}

export const ClientClassifier: React.FC<ClientClassifierProps> = ({
  clients,
  onClientUpdate,
  onNotesUpdate
}) => {
  const [classifications, setClassifications] = useState<ClassificationResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [autoMode, setAutoMode] = useState(false);

  const { 
    analyzeClient, 
    classifyNote, 
    isProcessing 
  } = useNotionAI();

  // Clasificación automática de un cliente
  const classifyClient = async (client: Client): Promise<ClassificationResult> => {
    try {
      const analysis = await analyzeClient(client);
      
      return {
        clientId: client.id,
        originalCategory: client.category,
        suggestedCategory: analysis.category,
        urgency: analysis.urgency,
        tags: analysis.keyPoints,
        confidence: 85, // Valor base, se puede ajustar con ML
        reasoning: analysis.summary
      };
    } catch (error) {
      console.error('Error classifying client:', error);
      return {
        clientId: client.id,
        originalCategory: client.category,
        suggestedCategory: client.category,
        urgency: 'medium',
        tags: ['sin_clasificar'],
        confidence: 50,
        reasoning: 'No se pudo clasificar automáticamente'
      };
    }
  };

  // Clasificación masiva de clientes seleccionados
  const classifySelectedClients = async () => {
    setProcessing(true);
    const results: ClassificationResult[] = [];
    
    try {
      for (const clientId of selectedClients) {
        const client = clients.find(c => c.id === clientId);
        if (client) {
          const result = await classifyClient(client);
          results.push(result);
          
          // Pequeña pausa para evitar saturar la API
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setClassifications(results);
    } catch (error) {
      console.error('Error in batch classification:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Aplicar clasificación a un cliente
  const applyClassification = (result: ClassificationResult) => {
    const client = clients.find(c => c.id === result.clientId);
    if (client) {
      onClientUpdate(result.clientId, {
        category: result.suggestedCategory,
        priority: result.urgency === 'critical' ? 'high' : 
                 result.urgency === 'high' ? 'high' :
                 result.urgency === 'medium' ? 'medium' : 'low',
        aiSuggestions: `IA Clasificación: ${result.reasoning}. Confianza: ${result.confidence}%`
      });
    }
  };

  // Clasificación automática de notas
  const classifyClientNotes = async (client: Client) => {
    if (!client.notes || client.notes.trim().length === 0) return;

    try {
      const noteClassification = await classifyNote(client.notes, `Cliente: ${client.name}, Tipo: ${client.consultationType}`);
      
      const enhancedNote = `
📋 NOTAS CLASIFICADAS POR IA:
${client.notes}

🏷️ CLASIFICACIÓN AUTOMÁTICA:
• Categoría: ${noteClassification.category}
• Urgencia: ${noteClassification.urgency}
• Tags: ${noteClassification.tags.join(', ')}
• Resumen: ${noteClassification.summary}

Generado automáticamente el ${new Date().toLocaleDateString()}
`;

      onNotesUpdate(client.id, enhancedNote);
    } catch (error) {
      console.error('Error classifying notes:', error);
    }
  };

  // Obtener color para nivel de urgencia
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Obtener ícono para nivel de confianza
  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (confidence >= 60) return <Clock className="w-4 h-4 text-yellow-500" />;
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  // Modo automático para nuevos clientes
  useEffect(() => {
    if (autoMode) {
      const unclassifiedClients = clients.filter(c => 
        !c.aiSuggestions || c.aiSuggestions === '' || 
        !c.aiSuggestions.includes('IA Clasificación')
      );
      
      if (unclassifiedClients.length > 0) {
        setSelectedClients(unclassifiedClients.map(c => c.id));
      }
    }
  }, [clients, autoMode]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Clasificador Inteligente
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Clasificación automática de clientes y notas usando IA
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoMode}
              onChange={(e) => setAutoMode(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Modo Automático</span>
          </label>
          
          {selectedClients.length > 0 && (
            <button
              onClick={classifySelectedClients}
              disabled={processing || isProcessing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {processing ? (
                <>
                  <Bot className="w-4 h-4 animate-spin" />
                  <span>Clasificando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Clasificar ({selectedClients.length})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Selector de clientes */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Seleccionar Clientes para Clasificar
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {clients.map((client) => (
            <label
              key={client.id}
              className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedClients.includes(client.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedClients([...selectedClients, client.id]);
                  } else {
                    setSelectedClients(selectedClients.filter(id => id !== client.id));
                  }
                }}
                className="rounded border-gray-300"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {client.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {client.consultationType}
                </p>
              </div>
              
              <div className="flex items-center space-x-1">
                <span className={`px-2 py-1 text-xs rounded-full ${getUrgencyColor(client.priority)}`}>
                  {client.priority}
                </span>
                {client.aiSuggestions && client.aiSuggestions.includes('IA Clasificación') && (
                  <Bot className="w-4 h-4 text-purple-500" />
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Resultados de clasificación */}
      {classifications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Resultados de Clasificación</span>
          </h3>
          
          {classifications.map((result) => {
            const client = clients.find(c => c.id === result.clientId);
            if (!client) return null;
            
            return (
              <div
                key={result.clientId}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {client.name}
                      </h4>
                      {getConfidenceIcon(result.confidence)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Confianza: {result.confidence}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría Actual:</p>
                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md text-sm">
                          {result.originalCategory}
                        </span>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría Sugerida:</p>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 rounded-md text-sm">
                          {result.suggestedCategory}
                        </span>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Urgencia:</p>
                        <span className={`px-2 py-1 rounded-md text-sm ${getUrgencyColor(result.urgency)}`}>
                          {result.urgency}
                        </span>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-md text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Análisis IA:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-md border">
                        {result.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => applyClassification(result)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Aplicar Cambios</span>
                    </button>
                    
                    <button
                      onClick={() => classifyClientNotes(client)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Clasificar Notas</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setClassifications(classifications.filter(c => c.clientId !== result.clientId))}
                    className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Estadísticas de clasificación */}
      {classifications.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Estadísticas de Clasificación</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-600">{classifications.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Clasificados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {classifications.filter(c => c.confidence >= 80).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alta Confianza</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {classifications.filter(c => c.urgency === 'high' || c.urgency === 'critical').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alta Urgencia</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(classifications.reduce((acc, c) => acc + c.confidence, 0) / classifications.length)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Confianza Promedio</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};