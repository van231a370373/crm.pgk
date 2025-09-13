import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Users,
  Target,
  Lightbulb,
  Brain,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { useNotionAI } from '../hooks/useNotionAI';
import { Client, Task } from '../types';

interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'opportunity' | 'alert' | 'recommendation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  confidence: number;
  actionable: boolean;
  relatedClients: string[];
  suggestedActions: string[];
  priority: number;
}

interface ClientPattern {
  pattern: string;
  frequency: number;
  clients: Client[];
  potential: 'revenue' | 'risk' | 'efficiency';
  description: string;
}

interface BusinessMetrics {
  totalClients: number;
  activeClients: number;
  completionRate: number;
  averageResponseTime: string;
  revenueOpportunity: number;
  satisfactionScore: number;
}

interface AnalyzerPanelProps {
  clients: Client[];
  tasks: Task[];
  messages?: any[];
  onClientUpdate?: (clientId: string, updates: Partial<Client>) => void;
  onTaskCreate?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const AnalyzerPanel: React.FC<AnalyzerPanelProps> = ({
  clients,
  tasks,
  messages = [],
  onClientUpdate,
  onTaskCreate
}) => {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [patterns, setPatterns] = useState<ClientPattern[]>([]);
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedInsightType, setSelectedInsightType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  const { 
    analyzeClient, 
    smartSearch, 
    isProcessing 
  } = useNotionAI();

  // Calcular métricas base del negocio
  const calculateBusinessMetrics = (): BusinessMetrics => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => 
      c.status === 'in-progress' || c.status === 'pending'
    ).length;
    
    const completedClients = clients.filter(c => c.status === 'completed').length;
    const completionRate = totalClients > 0 ? (completedClients / totalClients) * 100 : 0;
    
    const paidClients = clients.filter(c => c.status === 'paid').length;
    const revenueOpportunity = clients.filter(c => 
      c.status === 'pending' || c.status === 'in-progress'
    ).length;
    
    // Calcular puntuación de satisfacción basada en status y prioridad
    const satisfactionScore = clients.length > 0 ? 
      clients.reduce((acc, client) => {
        let score = 5; // Base
        if (client.status === 'completed') score += 2;
        if (client.status === 'paid') score += 3;
        if (client.priority === 'low') score += 1;
        if (client.priority === 'high') score -= 1;
        return acc + Math.min(10, Math.max(1, score));
      }, 0) / clients.length : 0;

    return {
      totalClients,
      activeClients,
      completionRate,
      averageResponseTime: '2.3h', // Esto se puede calcular con datos reales
      revenueOpportunity,
      satisfactionScore
    };
  };

  // Detectar patrones en los datos de clientes
  const detectClientPatterns = (): ClientPattern[] => {
    const patterns: ClientPattern[] = [];

    // Patrón por tipo de consulta
    const consultationTypes = clients.reduce((acc, client) => {
      acc[client.consultationType] = (acc[client.consultationType] || []);
      acc[client.consultationType].push(client);
      return acc;
    }, {} as Record<string, Client[]>);

    Object.entries(consultationTypes).forEach(([type, clientList]) => {
      if (clientList.length >= 3) {
        const completionRate = clientList.filter(c => c.status === 'completed').length / clientList.length;
        
        patterns.push({
          pattern: `Consultas de ${type}`,
          frequency: clientList.length,
          clients: clientList,
          potential: completionRate > 0.8 ? 'revenue' : 'efficiency',
          description: `${clientList.length} clientes han solicitado ${type}. Tasa de finalización: ${Math.round(completionRate * 100)}%`
        });
      }
    });

    // Patrón por fuente de cliente
    const sources = clients.reduce((acc, client) => {
      const source = client.source || 'Desconocida';
      acc[source] = (acc[source] || []);
      acc[source].push(client);
      return acc;
    }, {} as Record<string, Client[]>);

    Object.entries(sources).forEach(([source, clientList]) => {
      if (clientList.length >= 2) {
        patterns.push({
          pattern: `Clientes por fuente: ${source}`,
          frequency: clientList.length,
          clients: clientList,
          potential: 'revenue',
          description: `${clientList.length} clientes provienen de ${source}`
        });
      }
    });

    // Patrón por prioridad alta no completados
    const highPriorityPending = clients.filter(c => 
      c.priority === 'high' && (c.status === 'pending' || c.status === 'in-progress')
    );

    if (highPriorityPending.length > 0) {
      patterns.push({
        pattern: 'Clientes alta prioridad pendientes',
        frequency: highPriorityPending.length,
        clients: highPriorityPending,
        potential: 'risk',
        description: `${highPriorityPending.length} clientes de alta prioridad necesitan atención inmediata`
      });
    }

    return patterns.slice(0, 6); // Limitar a 6 patrones más relevantes
  };

  // Generar insights usando IA
  const generateAIInsights = async (): Promise<AnalyticsInsight[]> => {
    const generatedInsights: AnalyticsInsight[] = [];

    try {
      // Analizar clientes de alta prioridad
      const highPriorityClients = clients.filter(c => c.priority === 'high');
      
      for (let i = 0; i < Math.min(3, highPriorityClients.length); i++) {
        const client = highPriorityClients[i];
        try {
          const analysis = await analyzeClient(client);
          
          generatedInsights.push({
            id: `ai-insight-${client.id}`,
            type: analysis.urgency === 'critical' ? 'alert' : 'recommendation',
            title: `Cliente prioritario: ${client.name}`,
            description: analysis.summary,
            impact: analysis.urgency,
            category: analysis.category,
            confidence: 85,
            actionable: true,
            relatedClients: [client.id],
            suggestedActions: analysis.nextActions,
            priority: analysis.urgency === 'critical' ? 1 : 2
          });
        } catch (error) {
          console.error('Error analyzing client:', error);
        }

        // Pausa para evitar saturar la API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Insight sobre tareas atrasadas
      const overdueTasks = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate < new Date() && task.status !== 'completed';
      });

      if (overdueTasks.length > 0) {
        generatedInsights.push({
          id: 'overdue-tasks-alert',
          type: 'alert',
          title: 'Tareas Atrasadas Detectadas',
          description: `Hay ${overdueTasks.length} tareas atrasadas que requieren atención inmediata`,
          impact: 'high',
          category: 'productividad',
          confidence: 100,
          actionable: true,
          relatedClients: [...new Set(overdueTasks.map(t => t.clientId))],
          suggestedActions: [
            'Revisar y reprogramar tareas atrasadas',
            'Contactar clientes afectados',
            'Optimizar flujo de trabajo'
          ],
          priority: 1
        });
      }

      // Insight sobre oportunidades de ingreso
      const pendingClients = clients.filter(c => c.status === 'pending');
      
      if (pendingClients.length > 5) {
        generatedInsights.push({
          id: 'revenue-opportunity',
          type: 'opportunity',
          title: 'Oportunidad de Conversión',
          description: `${pendingClients.length} clientes pendientes representan una oportunidad significativa de ingresos`,
          impact: 'high',
          category: 'ventas',
          confidence: 90,
          actionable: true,
          relatedClients: pendingClients.slice(0, 10).map(c => c.id),
          suggestedActions: [
            'Priorizar seguimiento de clientes pendientes',
            'Implementar campaña de re-engagement',
            'Ofrecer consultas de seguimiento'
          ],
          priority: 2
        });
      }

      // Insight sobre eficiencia operacional
      const inProgressClients = clients.filter(c => c.status === 'in-progress');
      const avgTimeInProgress = inProgressClients.length; // Simplificado
      
      if (avgTimeInProgress > 10) {
        generatedInsights.push({
          id: 'efficiency-insight',
          type: 'recommendation',
          title: 'Oportunidad de Optimización',
          description: `${inProgressClients.length} casos en progreso sugieren posibilidad de optimizar procesos`,
          impact: 'medium',
          category: 'eficiencia',
          confidence: 75,
          actionable: true,
          relatedClients: inProgressClients.slice(0, 5).map(c => c.id),
          suggestedActions: [
            'Revisar tiempos de procesamiento',
            'Estandarizar procedimientos',
            'Automatizar tareas repetitivas'
          ],
          priority: 3
        });
      }

    } catch (error) {
      console.error('Error generating AI insights:', error);
    }

    return generatedInsights.sort((a, b) => a.priority - b.priority);
  };

  // Ejecutar análisis completo
  const runCompleteAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Calcular métricas
      const businessMetrics = calculateBusinessMetrics();
      setMetrics(businessMetrics);
      
      // Detectar patrones
      const detectedPatterns = detectClientPatterns();
      setPatterns(detectedPatterns);
      
      // Generar insights con IA
      const aiInsights = await generateAIInsights();
      setInsights(aiInsights);
      
      setLastAnalysis(new Date());
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Aplicar acción sugerida
  const applyInsightAction = (insight: AnalyticsInsight, actionIndex: number) => {
    const action = insight.suggestedActions[actionIndex];
    
    // Crear tarea automáticamente
    if (onTaskCreate) {
      onTaskCreate({
        clientId: insight.relatedClients[0] || '',
        clientName: insight.relatedClients.length === 1 ? 
          clients.find(c => c.id === insight.relatedClients[0])?.name || 'Cliente' : 
          'Múltiples clientes',
        title: insight.title,
        description: `${action}\n\nGenerado automáticamente desde análisis IA:\n${insight.description}`,
        assignee: 'Sistema',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueTime: '09:00',
        status: 'pending',
        priority: insight.impact === 'critical' ? 'high' : 
                 insight.impact === 'high' ? 'high' : 'medium',
        comments: [],
        createdBy: 'AI Analyzer'
      });
    }
  };

  // Filtrar insights
  const filteredInsights = insights.filter(insight => {
    const matchesType = selectedInsightType === 'all' || insight.type === selectedInsightType;
    const matchesSearch = searchQuery === '' || 
      insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Obtener color del insight según tipo e impacto
  const getInsightColor = (type: string, impact: string) => {
    if (impact === 'critical') return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    if (type === 'alert') return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
    if (type === 'opportunity') return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'recommendation': return <Lightbulb className="w-5 h-5 text-blue-600" />;
      case 'trend': return <BarChart3 className="w-5 h-5 text-purple-600" />;
      default: return <Brain className="w-5 h-5 text-gray-600" />;
    }
  };

  // Análisis inicial al cargar
  useEffect(() => {
    if (clients.length > 0) {
      runCompleteAnalysis();
    }
  }, [clients.length]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
            <Brain className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Panel de Análisis Inteligente
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Insights automáticos powered by Notion AI
              {lastAnalysis && (
                <span className="ml-2">
                  • Último análisis: {lastAnalysis.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={runCompleteAnalysis}
          disabled={isAnalyzing || isProcessing}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analizando...' : 'Actualizar Análisis'}</span>
        </button>
      </div>

      {/* Métricas principales */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{metrics.totalClients}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Total Clientes</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{metrics.activeClients}</p>
                <p className="text-xs text-green-600 dark:text-green-400">Activos</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {Math.round(metrics.completionRate)}%
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Finalización</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{metrics.averageResponseTime}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Tiempo Respuesta</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{metrics.revenueOpportunity}</p>
                <p className="text-xs text-red-600 dark:text-red-400">Oportunidades</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-teal-600" />
              <div>
                <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                  {Math.round(metrics.satisfactionScore * 10) / 10}
                </p>
                <p className="text-xs text-teal-600 dark:text-teal-400">Satisfacción</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros de insights */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar insights..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <select
            value={selectedInsightType}
            onChange={(e) => setSelectedInsightType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Todos los tipos</option>
            <option value="alert">Alertas</option>
            <option value="opportunity">Oportunidades</option>
            <option value="recommendation">Recomendaciones</option>
            <option value="trend">Tendencias</option>
          </select>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredInsights.length} de {insights.length} insights
        </div>
      </div>

      {/* Lista de insights */}
      <div className="space-y-4 mb-8">
        {filteredInsights.map((insight) => (
          <div
            key={insight.id}
            className={`border-l-4 rounded-lg p-4 ${getInsightColor(insight.type, insight.impact)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getInsightIcon(insight.type)}
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {insight.title}
                  </h3>
                  <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
                    {insight.confidence}% confianza
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {insight.description}
                </p>

                {insight.suggestedActions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Acciones sugeridas:
                    </p>
                    {insight.suggestedActions.map((action, index) => (
                      <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-md">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{action}</span>
                        <button
                          onClick={() => applyInsightAction(insight, index)}
                          className="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/60"
                        >
                          Crear Tarea
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Patrones detectados */}
      {patterns.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <PieChart className="w-5 h-5" />
            <span>Patrones Detectados</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((pattern, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {pattern.pattern}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    pattern.potential === 'revenue' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                    pattern.potential === 'risk' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                  }`}>
                    {pattern.potential}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {pattern.description}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Frecuencia: {pattern.frequency} clientes
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.length === 0 && !isAnalyzing && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Análisis en Progreso
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Los insights se generarán automáticamente basados en tus datos de clientes
          </p>
          <button
            onClick={runCompleteAnalysis}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Iniciar Análisis
          </button>
        </div>
      )}
    </div>
  );
};