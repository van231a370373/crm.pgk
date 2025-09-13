import React from 'react';
import {
  Users,
  CheckSquare,
  Plus,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  MessageSquare,
  Phone
} from 'lucide-react';

interface SimpleDashboardProps {
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

export const SimpleDashboard: React.FC<SimpleDashboardProps> = ({
  stats,
  clients,
  tasks,
  onAddClient,
  onViewTasks,
  onViewClients,
}) => {
  // Obtener clientes que necesitan atención
  const urgentClients = clients.filter(c => 
    c.priority === 'high' || 
    c.status === 'pending' ||
    (c.keyDates.paymentDue && new Date(c.keyDates.paymentDue) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  ).slice(0, 3);

  // Obtener tareas urgentes
  const urgentTasks = tasks.filter(t => 
    t.status === 'pending' && 
    new Date(`${t.dueDate}T${t.dueTime}`) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
  ).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Bienvenida simple */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ¡Hola! 👋
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Aquí tienes un resumen de tu día
        </p>
      </div>

      {/* Estadísticas principales en tarjetas grandes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={onViewClients}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-12 h-12 text-blue-600" />
            <span className="text-3xl font-bold text-blue-600">{stats.totalClients}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Clientes Totales
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Haz clic para ver todos tus clientes
          </p>
        </div>

        <div 
          onClick={onViewTasks}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <CheckSquare className="w-12 h-12 text-purple-600" />
            <span className="text-3xl font-bold text-purple-600">{stats.activeTasks}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Tareas Activas
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Haz clic para gestionar tus tareas
          </p>
        </div>

        <div 
          onClick={onAddClient}
          className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Plus className="w-12 h-12 text-white" />
            <span className="text-2xl font-bold">Nuevo</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Agregar Cliente
          </h3>
          <p className="text-blue-100 text-sm">
            Comienza una nueva consulta
          </p>
        </div>
      </div>

      {/* Alertas importantes */}
      {(stats.overdueTasks > 0 || urgentClients.length > 0) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="flex items-center text-lg font-semibold text-red-800 dark:text-red-200 mb-4">
            <AlertTriangle className="w-5 h-5 mr-2" />
            ⚠️ Requiere Atención
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.overdueTasks > 0 && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {stats.overdueTasks} tareas vencidas
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Necesitan completarse urgentemente
                    </p>
                  </div>
                </div>
              </div>
            )}
            {urgentClients.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {urgentClients.length} clientes urgentes
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Requieren seguimiento prioritario
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Próximas tareas - Solo las más importantes */}
      {urgentTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-600" />
            ⏰ Tareas para Hoy
          </h3>
          <div className="space-y-3">
            {urgentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    📅 {new Date(`${task.dueDate}T${task.dueTime}`).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} • 👤 {task.assignee} • 👥 {task.clientName}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600 cursor-pointer hover:text-green-700" />
              </div>
            ))}
          </div>
          {urgentTasks.length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              🎉 ¡No tienes tareas urgentes para hoy!
            </div>
          )}
        </div>
      )}

      {/* Clientes que necesitan atención */}
      {urgentClients.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            👥 Clientes Prioritarios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {urgentClients.map((client) => (
              <div key={client.id} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{client.name}</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{client.consultationType}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.priority === 'high' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : client.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {client.priority === 'high' ? '🔴 Alta' : client.status === 'pending' ? '⏳ Pendiente' : '💰 Pago'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>Contactar</span>
                  </button>
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado positivo cuando todo está bien */}
      {stats.overdueTasks === 0 && urgentClients.length === 0 && urgentTasks.length === 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
            🎉 ¡Todo en orden!
          </h3>
          <p className="text-green-700 dark:text-green-300 mb-4">
            No tienes tareas vencidas ni clientes urgentes. ¡Buen trabajo!
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.totalClients}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Clientes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.activeTasks}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Tareas Activas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Completadas Hoy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.pendingTasks}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Pendientes</div>
            </div>
          </div>
        </div>
      )}

      {/* Acciones rápidas al final */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={onAddClient}
          className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
        >
          <Plus className="w-6 h-6 mx-auto mb-2" />
          <div className="font-medium">Nuevo Cliente</div>
        </button>
        
        <button 
          onClick={onViewClients}
          className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
        >
          <Users className="w-6 h-6 mx-auto mb-2" />
          <div className="font-medium">Ver Clientes</div>
        </button>
        
        <button 
          onClick={onViewTasks}
          className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
        >
          <CheckSquare className="w-6 h-6 mx-auto mb-2" />
          <div className="font-medium">Mis Tareas</div>
        </button>
        
        <button 
          onClick={() => {
            // Función para cargar datos demo - solo resetear clientes
            localStorage.removeItem('pgk-crm-clients');
            localStorage.removeItem('pgk-crm-whatsapp-messages');
            window.location.reload();
          }}
          className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
        >
          <TrendingUp className="w-6 h-6 mx-auto mb-2" />
          <div className="font-medium">Datos Demo</div>
        </button>
      </div>
    </div>
  );
};