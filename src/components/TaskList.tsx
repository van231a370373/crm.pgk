import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  MessageSquare,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  PlayCircle,
  Repeat
} from 'lucide-react';
import { Task, TaskFilter, Client } from '../types';

interface TaskListProps {
  tasks: Task[];
  clients: Client[];
  filters: TaskFilter;
  onFiltersChange: (filters: TaskFilter) => void;
  onTaskComplete: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onAddComment: (taskId: string, text: string, author: string) => void;
  onAddTask: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  clients,
  filters,
  onFiltersChange,
  onTaskComplete,
  onTaskEdit,
  onTaskDelete,
  onAddComment,
  onAddTask,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const isOverdue = (task: Task) => {
    const dueDate = new Date(`${task.dueDate}T${task.dueTime}`);
    const now = new Date();
    return dueDate < now && task.status !== 'completed';
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddComment = (taskId: string) => {
    const comment = newComment[taskId]?.trim();
    if (comment) {
      onAddComment(taskId, comment, 'Nati'); // This would come from auth context
      setNewComment(prev => ({ ...prev, [taskId]: '' }));
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search) ||
        task.clientName.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agenda de Tareas</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onAddTask}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Tarea</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <select
              value={filters.assignee}
              onChange={(e) => onFiltersChange({ ...filters, assignee: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos los responsables</option>
              <option value="Nati">Nati</option>
              <option value="Kenyi">Kenyi</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="in-progress">En Proceso</option>
              <option value="completed">Completada</option>
            </select>

            <select
              value={filters.client}
              onChange={(e) => onFiltersChange({ ...filters, client: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos los clientes</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todas las prioridades</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => onFiltersChange({ ...filters, dateRange: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="overdue">Vencidas</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay tareas
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No se encontraron tareas con los filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white dark:bg-gray-700 rounded-lg border-l-4 shadow-sm ${
                    isOverdue(task) ? 'border-l-red-500' : 
                    task.priority === 'high' ? 'border-l-red-400' :
                    task.priority === 'medium' ? 'border-l-yellow-400' : 'border-l-green-400'
                  } ${task.status === 'completed' ? 'opacity-75' : ''}`}
                >
                  <div className="p-4">
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status === 'pending' ? 'Pendiente' : 
                             task.status === 'in-progress' ? 'En Proceso' : 'Completada'}
                          </span>
                          {task.recurrence && (
                            <Repeat className="w-4 h-4 text-blue-500" title="Tarea recurrente" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.clientName}</p>
                        {task.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => onTaskComplete(task.id)}
                            className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                            title="Marcar como completada"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => onTaskEdit(task)}
                          className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Editar tarea"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onTaskDelete(task.id)}
                          className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Eliminar tarea"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Task Details */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">{task.assignee}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className={`${isOverdue(task) ? 'text-red-600 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                            {formatDateTime(task.dueDate, task.dueTime)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <AlertCircle className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
                          <span className={getPriorityColor(task.priority)}>
                            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Comentarios ({task.comments.length})</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {expandedTask === task.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        {/* Existing Comments */}
                        {task.comments.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {task.comments.map((comment) => (
                              <div key={comment.id} className="p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                                    {comment.author}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(comment.timestamp).toLocaleString('es-ES')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Comment */}
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newComment[task.id] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [task.id]: e.target.value }))}
                            placeholder="Añadir comentario..."
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(task.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(task.id)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Añadir
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};