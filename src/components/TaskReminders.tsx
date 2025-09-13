import React from 'react';
import { Bell, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { Task } from '../types';

interface TaskRemindersProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const TaskReminders: React.FC<TaskRemindersProps> = ({ tasks, onTaskClick }) => {
  const now = new Date();
  
  // Get overdue tasks
  const overdueTasks = tasks.filter(task => {
    const dueDate = new Date(`${task.dueDate}T${task.dueTime}`);
    return dueDate < now && task.status !== 'completed';
  });

  // Get tasks due today
  const todayTasks = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString() && task.status !== 'completed';
  });

  // Get tasks due this week
  const weekTasks = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);
    return dueDate > now && dueDate <= weekFromNow && task.status !== 'completed';
  });

  if (overdueTasks.length === 0 && todayTasks.length === 0 && weekTasks.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Bell className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recordatorios de Tareas</h3>
      </div>

      <div className="space-y-4">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-800 dark:text-red-200">
                Tareas Vencidas ({overdueTasks.length})
              </span>
            </div>
            <div className="space-y-1">
              {overdueTasks.slice(0, 3).map((task) => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="block w-full text-left p-2 hover:bg-red-100 dark:hover:bg-red-900/40 rounded text-sm"
                >
                  <div className="font-medium text-red-900 dark:text-red-100">{task.title}</div>
                  <div className="text-red-700 dark:text-red-300">{task.clientName} - {task.assignee}</div>
                </button>
              ))}
              {overdueTasks.length > 3 && (
                <p className="text-xs text-red-600 dark:text-red-400 pl-2">
                  +{overdueTasks.length - 3} más...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Today's Tasks */}
        {todayTasks.length > 0 && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800 dark:text-yellow-200">
                Para Hoy ({todayTasks.length})
              </span>
            </div>
            <div className="space-y-1">
              {todayTasks.slice(0, 3).map((task) => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="block w-full text-left p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded text-sm"
                >
                  <div className="font-medium text-yellow-900 dark:text-yellow-100">{task.title}</div>
                  <div className="text-yellow-700 dark:text-yellow-300">
                    {task.clientName} - {task.assignee} - {task.dueTime}
                  </div>
                </button>
              ))}
              {todayTasks.length > 3 && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 pl-2">
                  +{todayTasks.length - 3} más...
                </p>
              )}
            </div>
          </div>
        )}

        {/* This Week's Tasks */}
        {weekTasks.length > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800 dark:text-blue-200">
                Esta Semana ({weekTasks.length})
              </span>
            </div>
            <div className="space-y-1">
              {weekTasks.slice(0, 3).map((task) => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="block w-full text-left p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded text-sm"
                >
                  <div className="font-medium text-blue-900 dark:text-blue-100">{task.title}</div>
                  <div className="text-blue-700 dark:text-blue-300">
                    {task.clientName} - {task.assignee} - {new Date(task.dueDate).toLocaleDateString('es-ES')}
                  </div>
                </button>
              ))}
              {weekTasks.length > 3 && (
                <p className="text-xs text-blue-600 dark:text-blue-400 pl-2">
                  +{weekTasks.length - 3} más...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};