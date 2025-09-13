import React from 'react';
import {
  Users,
  CheckSquare,
  Clock,
  Plus,
  TrendingUp,
  AlertCircle,
  Calendar,
  BarChart3,
  Target,
  Brain,
  MessageSquare,
  Filter,
  Bot,
  Sparkles
} from 'lucide-react';
import { AnalyzerPanel } from './AnalyzerPanel';
import { ClientClassifier } from './ClientClassifier';
import { InteractionSummarizer } from './InteractionSummarizer';

interface DashboardProps {
  stats: {
    totalClients: number;
    activeTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completedToday: number;
  };
  clients: any[];
  tasks: any[];
  messages?: any[];
  onAddClient: () => void;
  onViewTasks: () => void;
  onViewClients: () => void;
  onClientUpdate?: (clientId: string, updates: any) => void;
  onTaskCreate?: (task: any) => void;
  onNotesUpdate?: (clientId: string, notes: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  clients,
  tasks,
  messages = [],
  onAddClient,
  onViewTasks,
  onViewClients,
  onClientUpdate,
  onTaskCreate,
  onNotesUpdate,
}) => {
  const [activeAITab, setActiveAITab] = React.useState<'analyzer' | 'classifier' | 'summarizer'>('analyzer');
  const quickActions = [
    {
      title: 'Nuevo Cliente',
      description: 'Agregar cliente potencial',
      icon: Plus,
      action: onAddClient,
      color: 'bg-blue-500 hover:bg-blue-600',
      shortcut: 'Ctrl+N'
    },
    {
      title: 'Ver Clientes',
      description: 'Gestionar base de clientes',
      icon: Users,
      action: onViewClients,
      color: 'bg-green-500 hover:bg-green-600',
      count: stats.totalClients
    },
    {
      title: 'Mis Tareas',
      description: 'Seguimiento de actividades',
      icon: CheckSquare,
      action: onViewTasks,
      color: 'bg-purple-500 hover:bg-purple-600',
      count: stats.activeTasks
    }
  ];

  const taskSummary = [
    {
      label: 'Pendientes',
      value: stats.pendingTasks,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50',
      description: 'Tareas por hacer'
    },
    {
      label: 'Vencidas',
      value: stats.overdueTasks,
      icon: AlertCircle,
      color: 'text-red-600 bg-red-50',
      description: 'Requieren atención'
    },
    {
      label: 'Completadas Hoy',
      value: stats.completedToday,
      icon: Target,
      color: 'text-green-600 bg-green-50',
      description: 'Logrado hoy'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">¡Bienvenido a tu CRM!</h1>
            <p className="text-blue-100 text-lg">
              Gestiona tus clientes y tareas de forma eficiente
            </p>
          </div>
          <div className="hidden md:block">
            <BarChart3 className="w-16 h-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`relative ${action.color} text-white rounded-lg p-6 transition-all duration-200 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              <div className="flex items-center justify-between mb-4">
                <action.icon className="w-8 h-8" />
                {action.shortcut && (
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                    {action.shortcut}
                  </span>
                )}
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-blue-100 mb-2">{action.description}</p>
                {action.count !== undefined && (
                  <div className="text-2xl font-bold">{action.count}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Task Overview */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <CheckSquare className="w-5 h-5 mr-2 text-purple-600" />
          Resumen de Tareas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {taskSummary.map((item, index) => (
            <div
              key={index}
              className={`${item.color} border border-gray-200 dark:border-gray-700 rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.label}
                  </p>
                </div>
                <item.icon className="w-8 h-8 text-current" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Actividad Reciente
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Actividad del Sistema
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Aquí aparecerán las actualizaciones recientes del sistema
            </p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalClients}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Clientes</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.activeTasks}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tareas Activas</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completadas Hoy</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Vencidas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-indigo-600" />
          Asistente IA Powered by Notion AI
        </h2>
        
        {/* AI Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveAITab('analyzer')}
              className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
                activeAITab === 'analyzer'
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Análisis Inteligente</span>
            </button>
            
            <button
              onClick={() => setActiveAITab('classifier')}
              className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
                activeAITab === 'classifier'
                  ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-b-2 border-purple-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Clasificador Auto</span>
            </button>
            
            <button
              onClick={() => setActiveAITab('summarizer')}
              className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
                activeAITab === 'summarizer'
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Resumidor Chat</span>
            </button>
          </div>
          
          <div className="p-6">
            {activeAITab === 'analyzer' && (
              <AnalyzerPanel 
                clients={clients}
                tasks={tasks}
                messages={messages}
                onClientUpdate={(clientId, updates) => {
                  console.log('Analyzer updating client:', clientId, updates);
                  if (onClientUpdate) {
                    onClientUpdate(clientId, updates);
                  }
                }}
                onTaskCreate={(task) => {
                  console.log('Analyzer creating task:', task);
                  if (onTaskCreate) {
                    onTaskCreate(task);
                  }
                }}
              />
            )}
            
            {activeAITab === 'classifier' && (
              <ClientClassifier 
                clients={clients}
                onClientUpdate={(clientId, updates) => {
                  console.log('Updating client:', clientId, updates);
                  if (onClientUpdate) {
                    onClientUpdate(clientId, updates);
                  }
                }}
                onNotesUpdate={(clientId, notes) => {
                  console.log('Updating notes:', clientId, notes);
                  if (onNotesUpdate) {
                    onNotesUpdate(clientId, notes);
                  }
                }}
              />
            )}
            
            {activeAITab === 'summarizer' && (
              <InteractionSummarizer 
                clients={clients}
                messages={messages}
                onCreateTask={(clientId, title, description, dueDate) => {
                  if (onTaskCreate) {
                    onTaskCreate({
                      clientId,
                      clientName: clients.find(c => c.id === clientId)?.name || 'Cliente',
                      title,
                      description,
                      assignee: 'Sistema',
                      dueDate: dueDate || new Date().toISOString().split('T')[0],
                      dueTime: '09:00',
                      status: 'pending',
                      priority: 'medium',
                      comments: [],
                      createdBy: 'AI Summarizer'
                    });
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* AI Features Showcase */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>Funciones IA Integradas</span>
          </h3>
          <Bot className="w-8 h-8 text-purple-600 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
            <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
            <strong className="text-purple-900 dark:text-purple-100">Análisis Inteligente</strong>
            <p className="text-purple-700 dark:text-purple-200 mt-1">
              Insights automáticos sobre patrones de clientes, oportunidades de negocio y alertas importantes
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
            <Filter className="w-6 h-6 text-blue-600 mb-2" />
            <strong className="text-blue-900 dark:text-blue-100">Clasificación Automática</strong>
            <p className="text-blue-700 dark:text-blue-200 mt-1">
              Organiza automáticamente clientes por tipo, urgencia y categoría usando prompts de Notion AI
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
            <MessageSquare className="w-6 h-6 text-green-600 mb-2" />
            <strong className="text-green-900 dark:text-green-100">Resumen de Conversaciones</strong>
            <p className="text-green-700 dark:text-green-200 mt-1">
              Resume automáticamente chats de WhatsApp, extrae decisiones clave y crea tareas de seguimiento
            </p>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Consejos para usar el CRM con IA
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <strong>1. Análisis IA:</strong> Revisa los insights diarios para identificar oportunidades
          </div>
          <div>
            <strong>2. Clasificación:</strong> Deja que la IA organice tus clientes automáticamente
          </div>
          <div>
            <strong>3. Resúmenes:</strong> Usa el resumidor para extraer puntos clave de conversaciones largas
          </div>
          <div>
            <strong>4. WhatsApp IA:</strong> Aprovecha las sugerencias inteligentes para respuestas profesionales
          </div>
        </div>
      </div>
    </div>
  );
};