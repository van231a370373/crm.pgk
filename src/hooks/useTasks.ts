import { useState, useEffect, useMemo } from 'react';
import { Task, TaskFilter, Client } from '../types';

const TASKS_STORAGE_KEY = 'pgk-crm-tasks';

// Sample tasks for demonstration
const SAMPLE_TASKS: Task[] = [
  {
    id: 'task-1',
    clientId: 'sample-1',
    clientName: 'María González Rodríguez',
    title: 'Revisar documentación IRNR',
    description: 'Verificar que todos los certificados de retenciones estén completos y actualizados para la declaración IRNR 2024.',
    assignee: 'Nati',
    dueDate: '2025-01-25',
    dueTime: '10:00',
    status: 'pending',
    priority: 'high',
    comments: [
      {
        id: 'comment-1',
        text: 'Cliente ha enviado documentación parcial, falta certificado de Barcelona',
        author: 'Nati',
        timestamp: '2025-01-20T09:30:00.000Z'
      }
    ],
    createdAt: '2025-01-20T08:00:00.000Z',
    updatedAt: '2025-01-20T09:30:00.000Z',
    createdBy: 'Nati'
  },
  {
    id: 'task-2',
    clientId: 'sample-2',
    clientName: 'Carlos Martín López',
    title: 'Seguimiento alta autónomo',
    description: 'Contactar con el cliente para obtener DNI y justificante de domicilio pendientes.',
    assignee: 'Kenyi',
    dueDate: '2025-01-22',
    dueTime: '14:30',
    status: 'in-progress',
    priority: 'medium',
    recurrence: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-02-28'
    },
    comments: [],
    createdAt: '2025-01-18T16:45:00.000Z',
    updatedAt: '2025-01-20T11:15:00.000Z',
    createdBy: 'Kenyi'
  }
];

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilter>({
    assignee: '',
    status: '',
    client: '',
    dateRange: '',
    priority: '',
  });

  // Load tasks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    if (stored) {
      setTasks(JSON.parse(stored));
    } else {
      // Initialize with sample tasks
      setTasks(SAMPLE_TASKS);
    }
  }, []);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const completeTask = (id: string) => {
    updateTask(id, { 
      status: 'completed', 
      completedAt: new Date().toISOString() 
    });
  };

  const addTaskComment = (taskId: string, text: string, author: string) => {
    const newComment = {
      id: crypto.randomUUID(),
      text,
      author,
      timestamp: new Date().toISOString(),
    };

    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { 
              ...task, 
              comments: [...task.comments, newComment],
              updatedAt: new Date().toISOString()
            }
          : task
      )
    );
  };

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      if (filters.assignee && task.assignee !== filters.assignee) {
        return false;
      }

      if (filters.status && task.status !== filters.status) {
        return false;
      }

      if (filters.client && task.clientId !== filters.client) {
        return false;
      }

      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      if (filters.dateRange) {
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filters.dateRange) {
          case 'today':
            const todayEnd = new Date(today);
            todayEnd.setDate(today.getDate() + 1);
            if (taskDate < today || taskDate >= todayEnd) return false;
            break;
          case 'week':
            const weekEnd = new Date(today);
            weekEnd.setDate(today.getDate() + 7);
            if (taskDate < today || taskDate >= weekEnd) return false;
            break;
          case 'overdue':
            if (taskDate >= today || task.status === 'completed') return false;
            break;
        }
      }

      return true;
    });

    // Sort by due date and priority
    filtered.sort((a, b) => {
      // Completed tasks go to bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;

      // Then by due date
      const dateA = new Date(`${a.dueDate}T${a.dueTime}`);
      const dateB = new Date(`${b.dueDate}T${b.dueTime}`);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }

      // Then by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return filtered;
  }, [tasks, filters]);

  const getTaskStats = () => {
    const now = new Date();
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => {
        const dueDate = new Date(`${t.dueDate}T${t.dueTime}`);
        return dueDate < now && t.status !== 'completed';
      }).length,
      dueToday: tasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        const today = new Date();
        return dueDate.toDateString() === today.toDateString() && t.status !== 'completed';
      }).length,
    };
  };

  const getClientTasks = (clientId: string) => {
    return tasks.filter(task => task.clientId === clientId);
  };

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    filters,
    setFilters,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    addTaskComment,
    getTaskStats,
    getClientTasks,
  };
};