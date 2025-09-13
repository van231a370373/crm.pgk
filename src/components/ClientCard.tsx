import React from 'react';
import { 
  MessageCircle, 
  AlertCircle,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  CheckSquare
} from 'lucide-react';
import { Client } from '../types';

interface ClientCardProps {
  client: Client;
  onClick: () => void;
  onEdit: () => void;
  onWhatsApp: () => void;
  onAddTask: () => void;
  onAIAnalyze?: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onClick, onWhatsApp, onAddTask }) => {
  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: Client['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Pause className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: Client['status']) => {
    switch (status) {
      case 'paid': return 'Pagada';
      case 'in-progress': return 'En Proceso';
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getPriorityColor = (priority: Client['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWhatsApp();
  };

  const handleAddTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddTask();
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 border-l-4 ${getPriorityColor(client.priority)} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700`}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Header con nombre y estado */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate mb-2">
              {client.name}
            </h3>
            
            {/* Estado */}
            <div className="flex items-center mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getStatusColor(client.status)}`}>
                {getStatusIcon(client.status)}
                <span>{getStatusText(client.status)}</span>
              </span>
            </div>
            
            {/* Empresa */}
            {client.company && (
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                <Building2 className="w-4 h-4 mr-2" />
                <span className="text-sm truncate">{client.company}</span>
              </div>
            )}
            
            {/* Categoría */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm font-medium">
                {client.category}
              </span>
            </div>
            
            {/* Tipo de consulta */}
            <div className="text-gray-700 dark:text-gray-300 text-sm">
              {client.consultationType}
            </div>
          </div>
        </div>

        {/* Botones de acción compactos */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            {client.phones.length > 0 && (
              <button
                onClick={handleWhatsApp}
                className="flex items-center space-x-1 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Mensaje</span>
              </button>
            )}
            <button
              onClick={handleAddTask}
              className="flex items-center space-x-1 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors text-sm"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tarea</span>
            </button>
          </div>
          
          {/* Indicador de prioridad */}
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${client.priority === 'high' ? 'bg-red-500' : client.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {client.priority === 'high' ? 'Alta' : client.priority === 'medium' ? 'Media' : 'Baja'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};