import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, AlertCircle, Repeat, MessageSquare } from 'lucide-react';
import { Task, Client } from '../types';

interface TaskFormProps {
  task?: Task;
  clients: Client[];
  preselectedClientId?: string;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  clients,
  preselectedClientId,
  onSave,
  onCancel,
  isOpen,
}) => {
  const [formData, setFormData] = useState({
    clientId: preselectedClientId || '',
    clientName: '',
    title: '',
    description: '',
    assignee: 'Nati' as 'Nati' | 'Kenyi',
    dueDate: '',
    dueTime: '09:00',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    hasRecurrence: false,
    recurrence: {
      type: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'custom',
      interval: 1,
      endDate: '',
    },
    comments: [] as Task['comments'],
    createdBy: 'Nati', // This would come from auth context in real app
  });

  useEffect(() => {
    if (task) {
      const client = clients.find(c => c.id === task.clientId);
      setFormData({
        clientId: task.clientId,
        clientName: client?.name || task.clientName,
        title: task.title,
        description: task.description,
        assignee: task.assignee,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        status: task.status,
        priority: task.priority,
        hasRecurrence: !!task.recurrence,
        recurrence: task.recurrence || {
          type: 'weekly',
          interval: 1,
          endDate: '',
        },
        comments: task.comments,
        createdBy: task.createdBy,
      });
    } else {
      const selectedClient = preselectedClientId ? clients.find(c => c.id === preselectedClientId) : null;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setFormData({
        clientId: preselectedClientId || '',
        clientName: selectedClient?.name || '',
        title: '',
        description: '',
        assignee: 'Nati',
        dueDate: tomorrow.toISOString().split('T')[0],
        dueTime: '09:00',
        status: 'pending',
        priority: 'medium',
        hasRecurrence: false,
        recurrence: {
          type: 'weekly',
          interval: 1,
          endDate: '',
        },
        comments: [],
        createdBy: 'Nati',
      });
    }
  }, [task, clients, preselectedClientId, isOpen]);

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setFormData(prev => ({
      ...prev,
      clientId,
      clientName: client?.name || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      clientId: formData.clientId,
      clientName: formData.clientName,
      title: formData.title,
      description: formData.description,
      assignee: formData.assignee,
      dueDate: formData.dueDate,
      dueTime: formData.dueTime,
      status: formData.status,
      priority: formData.priority,
      recurrence: formData.hasRecurrence ? formData.recurrence : undefined,
      comments: formData.comments,
      createdBy: formData.createdBy,
    };

    onSave(taskData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {task ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cliente *
            </label>
            <select
              required
              value={formData.clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.category}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título de la tarea *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Revisar documentación, Llamar cliente, etc."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Detalles adicionales sobre la tarea..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Assignee and Priority */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <User className="w-4 h-4 mr-1" />
                Responsable *
              </label>
              <select
                required
                value={formData.assignee}
                onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value as 'Nati' | 'Kenyi' }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Nati">Nati</option>
                <option value="Kenyi">Kenyi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          {/* Due Date and Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Fecha de vencimiento *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Hora
              </label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Status (only for editing) */}
          {task && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Task['status'] }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="pending">Pendiente</option>
                <option value="in-progress">En Proceso</option>
                <option value="completed">Completada</option>
              </select>
            </div>
          )}

          {/* Recurrence */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                id="hasRecurrence"
                checked={formData.hasRecurrence}
                onChange={(e) => setFormData(prev => ({ ...prev, hasRecurrence: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="hasRecurrence" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Repeat className="w-4 h-4 mr-1" />
                Tarea recurrente
              </label>
            </div>

            {formData.hasRecurrence && (
              <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Repetir cada
                  </label>
                  <select
                    value={formData.recurrence.type}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recurrence: { ...prev.recurrence, type: e.target.value as any }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="daily">Día</option>
                    <option value="weekly">Semana</option>
                    <option value="monthly">Mes</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Intervalo
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.recurrence.interval}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recurrence: { ...prev.recurrence, interval: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={formData.recurrence.endDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recurrence: { ...prev.recurrence, endDate: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {task ? 'Guardar Cambios' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};