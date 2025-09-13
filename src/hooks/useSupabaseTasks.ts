import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './useAuth';
import { Task, TaskFilter } from '../types';
import { Database } from '../utils/supabase';

type SupabaseTask = Database['public']['Tables']['tasks']['Row'];
type SupabaseUser = Database['public']['Tables']['users']['Row'];

const TASKS_STORAGE_KEY = 'pgk-crm-tasks-migration-done';

export const useSupabaseTasks = () => {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilter>({
    assignee: '',
    status: '',
    client: '',
    dateRange: '',
    priority: '',
  });

  // Convert Supabase task to our Task type
  const convertSupabaseTask = useCallback(async (dbTask: SupabaseTask): Promise<Task> => {
    // Get assignee name
    let assigneeName = '';
    if (dbTask.assignee_id) {
      try {
        const { data: assigneeData } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', dbTask.assignee_id)
          .single();

        assigneeName = assigneeData?.full_name || dbTask.assignee_id;
      } catch (err) {
        console.error('Error getting assignee name:', err);
        assigneeName = dbTask.assignee_id;
      }
    }

    return {
      id: dbTask.id,
      clientId: dbTask.client_id,
      clientName: dbTask.client_name,
      title: dbTask.title,
      description: dbTask.description,
      assignee: assigneeName,
      dueDate: dbTask.due_date,
      dueTime: dbTask.due_time,
      status: dbTask.status as Task['status'],
      priority: dbTask.priority as Task['priority'],
      recurrence: dbTask.recurrence as Task['recurrence'],
      comments: dbTask.comments as Task['comments'] || [],
      createdAt: dbTask.created_at,
      updatedAt: dbTask.updated_at,
      createdBy: dbTask.created_by,
      completedAt: dbTask.completed_at || undefined,
    };
  }, []);

  // Convert our Task type to Supabase format
  const convertToSupabaseTask = useCallback((task: Partial<Task>) => {
    return {
      user_id: user?.id,
      client_id: task.clientId,
      client_name: task.clientName,
      title: task.title,
      description: task.description,
      assignee_id: task.assignee, // This should be the user ID, not name
      due_date: task.dueDate,
      due_time: task.dueTime,
      status: task.status,
      priority: task.priority,
      recurrence: task.recurrence,
      comments: task.comments,
      created_by: user?.id,
    };
  }, [user?.id]);

  // Load tasks from Supabase
  const loadTasks = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Build query based on user role
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (profile?.role === 'user') {
        // Users only see tasks they created or are assigned to
        query = query.or(`user_id.eq.${user.id},assignee_id.eq.${user.id}`);
      } else if (profile?.role === 'manager') {
        // Managers see all tasks
        // No additional filter needed
      } else if (profile?.role === 'admin') {
        // Admins see all tasks
        // No additional filter needed
      }

      const { data: tasksData, error: tasksError } = await query;

      if (tasksError) throw tasksError;

      // Convert Supabase data to our format
      const convertedTasks = await Promise.all(
        tasksData.map(convertSupabaseTask)
      );

      setTasks(convertedTasks);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  }, [user, profile, convertSupabaseTask]);

  // Migrate existing localStorage data to Supabase
  const migrateLocalStorageData = useCallback(async () => {
    if (!user) return;

    const migrationDone = localStorage.getItem(TASKS_STORAGE_KEY);
    if (migrationDone) return;

    try {
      const storedTasks = localStorage.getItem('pgk-crm-tasks');
      if (!storedTasks) return;

      const parsedTasks = JSON.parse(storedTasks);

      console.log('Migrating', parsedTasks.length, 'tasks from localStorage...');

      for (const task of parsedTasks) {
        // Convert assignee name to user ID if needed
        let assigneeId = task.assignee;
        if (typeof task.assignee === 'string' && task.assignee !== 'Nati' && task.assignee !== 'Kenyi') {
          // Try to find user by name
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('id')
              .ilike('full_name', `%${task.assignee}%`)
              .single();

            if (userData) {
              assigneeId = userData.id;
            }
          } catch (err) {
            console.error('Could not find user for assignee:', task.assignee);
          }
        }

        const supabaseTask = {
          user_id: user.id,
          client_id: task.clientId,
          client_name: task.clientName,
          title: task.title,
          description: task.description,
          assignee_id: assigneeId === 'Nati' || assigneeId === 'Kenyi' ? null : assigneeId,
          due_date: task.dueDate,
          due_time: task.dueTime,
          status: task.status,
          priority: task.priority,
          recurrence: task.recurrence,
          comments: task.comments,
          created_by: user.id,
        };

        const { error } = await supabase
          .from('tasks')
          .insert(supabaseTask);

        if (error) {
          console.error('Error migrating task:', task.title, error);
        }
      }

      // Mark migration as done
      localStorage.setItem(TASKS_STORAGE_KEY, 'true');
      console.log('Tasks migration completed successfully!');

      // Reload tasks after migration
      await loadTasks();

    } catch (err) {
      console.error('Error during tasks migration:', err);
    }
  }, [user, loadTasks]);

  // Load data on mount and when user changes
  useEffect(() => {
    if (user) {
      loadTasks();
      migrateLocalStorageData();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user, loadTasks, migrateLocalStorageData]);

  // Add task
  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const supabaseTask = convertToSupabaseTask(taskData);

      const { data, error } = await supabase
        .from('tasks')
        .insert(supabaseTask)
        .select()
        .single();

      if (error) throw error;

      const newTask = await convertSupabaseTask(data);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Error al crear tarea');
    }
  }, [user, convertToSupabaseTask, convertSupabaseTask]);

  // Update task
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!user) return;

    try {
      const supabaseUpdates = convertToSupabaseTask(updates);

      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...supabaseUpdates,
          updated_at: new Date().toISOString(),
          completed_at: updates.status === 'completed' ? new Date().toISOString() : undefined
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTasks(prev =>
        prev.map(task =>
          task.id === id
            ? { ...task, ...updates, updatedAt: data.updated_at }
            : task
        )
      );
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Error al actualizar tarea');
    }
  }, [user, convertToSupabaseTask]);

  // Delete task
  const deleteTask = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Error al eliminar tarea');
    }
  }, [user]);

  // Complete task
  const completeTask = useCallback(async (id: string) => {
    await updateTask(id, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });
  }, [updateTask]);

  // Add task comment
  const addTaskComment = useCallback(async (taskId: string, text: string, author: string) => {
    if (!user) return;

    try {
      const newComment = {
        id: crypto.randomUUID(),
        text,
        author,
        timestamp: new Date().toISOString(),
      };

      // Get current task
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedComments = [...task.comments, newComment];

      const { error } = await supabase
        .from('tasks')
        .update({
          comments: updatedComments,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, comments: updatedComments, updatedAt: new Date().toISOString() }
            : task
        )
      );
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Error al agregar comentario');
    }
  }, [user, tasks]);

  // Filtered tasks
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
        const taskDate = new Date(`${task.dueDate}T${task.dueTime}`);
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

  // Get task stats
  const getTaskStats = useCallback(() => {
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
  }, [tasks]);

  // Get client tasks
  const getClientTasks = useCallback((clientId: string) => {
    return tasks.filter(task => task.clientId === clientId);
  }, [tasks]);

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
    loading,
    error,
  };
};