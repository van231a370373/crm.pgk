import { useState } from 'react';
import { useClients } from './hooks/useClients';
import { useTasks } from './hooks/useTasks';
import { useServiceCategories } from './hooks/useServiceCategories';
import { useDarkMode } from './hooks/useDarkMode';
import { useSimpleAuth } from './hooks/useSimpleAuth';
import { FilterBar } from './components/FilterBar';
import { ClientCard } from './components/ClientCard';
import { ClientForm } from './components/ClientForm';
import { ClientDetails } from './components/ClientDetails';
import { WhatsAppMessenger } from './components/WhatsAppMessenger';
import { CategoryManager } from './components/CategoryManager';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { TaskReminders } from './components/TaskReminders';
import { Login } from './components/Login';
import { NavigationMenu } from './components/NavigationMenu';
import { Dashboard } from './components/Dashboard';
import { AIAssistant } from './components/AIAssistant';
import { PerplexityAssistant } from './components/PerplexityAssistant';
import { AutonomousAnalyzer } from './components/AutonomousAnalyzer';
import { WhatsAppSetup } from './components/WhatsAppSetup';
import { Client } from './types';
import { Users, Calendar, TrendingUp, AlertCircle, HandCoins, CheckSquare, Plus, User, CheckCircle, LogOut, MessageSquare, Settings, Bot } from 'lucide-react';

function App() {
  const {
    clients,
    allClients: allClients,
    whatsappMessages,
    filters,
    setFilters,
    sortField,
    sortDirection,
    setSortField,
    setSortDirection,
    addClient,
    updateClient,
    deleteClient,
    addWhatsAppMessage,
  } = useClients();

  const {
    tasks,
    allTasks: allTasks,
    filters: taskFilters,
    setFilters: setTaskFilters,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    addTaskComment,
    getTaskStats,
  } = useTasks();

  // Loading states simulados ya que useClients no tiene loading
  const clientsLoading = false;
  const tasksLoading = false;

  const {
    categories,
    addCategory,
    deleteCategory,
    updateCategory,
  } = useServiceCategories();

  const { user, loading: authLoading, signOut } = useSimpleAuth();
  const [isDark, setIsDark] = useDarkMode();

  // Debug logs detallados
  console.log('🔍 Estado de auth:', { 
    user, 
    loading: authLoading, 
    hasUser: !!user,
    userString: JSON.stringify(user),
    localStorage: localStorage.getItem('polska_crm_auth')
  });

  // Handler para análisis de IA de clientes con Perplexity
  const handleAIAnalyze = async (client: Client) => {
    console.log('🤖 Analizando cliente con IA Perplexity:', client.name);
    setPerplexityClient(client);
    setShowPerplexityAssistant(true);
  };
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [whatsappClient, setWhatsappClient] = useState<Client | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskList, setShowTaskList] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [preselectedClientId, setPreselectedClientId] = useState<string | undefined>();
  const [showClientsList, setShowClientsList] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'clients' | 'tasks'>('dashboard');
  const [showLogin, setShowLogin] = useState(true);
  const [showWhatsAppSetup, setShowWhatsAppSetup] = useState(false);
  const [showPerplexityAssistant, setShowPerplexityAssistant] = useState(false);
  const [perplexityClient, setPerplexityClient] = useState<Client | null>(null);

  // Show login if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Login onSwitchToSignup={() => setShowLogin(false)} />
        
        {/* Botones de debug/test rápido */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          <button
            onClick={() => {
              console.log('🚨 BYPASS DE TEST ACTIVADO');
              const testUser = {
                id: '1',
                email: 'admin@polska.com',
                name: 'Superadministrador',
                role: 'superadmin' as const
              };
              // Forzar login
              localStorage.setItem('polska_crm_auth', JSON.stringify(testUser));
              window.location.reload(); // Recargar página
            }}
            className="block w-full px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors text-center"
          >
            🚨 BYPASS LOGIN
          </button>
          <button
            onClick={() => {
              console.log('🧹 LIMPIAR SESIÓN');
              localStorage.removeItem('polska_crm_auth');
              window.location.reload();
            }}
            className="block w-full px-4 py-2 bg-orange-600 text-white rounded-lg shadow-lg hover:bg-orange-700 transition-colors text-center"
          >
            🧹 LIMPIAR SESIÓN
          </button>
        </div>
      </div>
    );
  }

  // Fallback: Show loading if hooks are still loading
  if (clientsLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  const handleAddClient = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
    setShowDetails(false);
  };

  const handleSaveClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingClient) {
      updateClient(editingClient.id, clientData);
    } else {
      addClient(clientData);
    }
    setShowForm(false);
    setEditingClient(null);
  };

  const handleDeleteClient = () => {
    if (selectedClient) {
      deleteClient(selectedClient.id);
      setShowDetails(false);
      setSelectedClient(null);
    }
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setShowDetails(true);
  };

  const handleWhatsAppOpen = (client: Client) => {
    setWhatsappClient(client);
    setShowWhatsApp(true);
    setShowDetails(false);
  };

  const handleSendWhatsAppMessage = (clientId: string, message: string, aiGenerated: boolean, context?: string) => {
    addWhatsAppMessage(clientId, message, aiGenerated, context);
  };

  const handleAddTask = (clientId?: string) => {
    setPreselectedClientId(clientId || undefined);
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleSaveTask = (taskData: any) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setShowTaskForm(false);
    setEditingTask(null);
    setPreselectedClientId(undefined);
  };

  const handleOpenTasks = (clientId?: string) => {
    if (clientId) {
      setTaskFilters({ ...taskFilters, client: clientId });
    }
    setShowTaskList(true);
    setShowDetails(false);
  };

  // Statistics
  const stats = {
    total: allClients.length,
    pending: allClients.filter(c => c.status === 'pending').length,
    inProgress: allClients.filter(c => c.status === 'in-progress').length,
    paid: allClients.filter(c => c.status === 'paid').length,
    highPriority: allClients.filter(c => c.priority === 'high').length,
    paidInCash: allClients.filter(c => c.paidInCash).length,
  };

  const taskStats = getTaskStats();

  // Upcoming payments
  const upcomingPayments = allClients
    .filter(c => c.keyDates.paymentDue)
    .filter(c => {
      const paymentDate = new Date(c.keyDates.paymentDue!);
      const today = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(today.getDate() + 7);
      return paymentDate >= today && paymentDate <= weekFromNow;
    })
    .length;

  const handleLogout = async () => {
    await signOut();
  };

  const handleViewClients = () => {
    setCurrentView('clients');
    setShowClientsList(true);
  };

  const handleViewTasks = () => {
    setCurrentView('tasks');
    setShowTaskList(true);
  };

  // Dashboard stats
  const dashboardStats = {
    totalClients: allClients.length,
    activeTasks: allTasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length,
            pendingTasks: client.status === 'pending' ? 1 : 0,
    overdueTasks: allTasks.filter(t => {
      const dueDate = new Date(`${t.dueDate}T${t.dueTime}`);
      return dueDate < new Date() && t.status !== 'completed';
    }).length,
    completedToday: allTasks.filter(t => {
      const today = new Date();
      const completedDate = t.completedAt ? new Date(t.completedAt) : null;
      return completedDate &&
             completedDate.toDateString() === today.toDateString() &&
             t.status === 'completed';
    }).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">

      {/* Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center justify-center p-2">
              <img
                src="/logo.png"
                alt="Polska Grupa Konsultingowa"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center"><span class="text-white font-bold text-sm">PGK</span></div>';
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Polska Grupa Konsultingowa</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sistema de Gestión de Clientes</p>
            </div>
            
            {/* Botones de configuración */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                title="Cargar 5 clientes de ejemplo"
              >
                🔄 Cargar Clientes Demo
              </button>
              
              <button
                onClick={() => setShowWhatsAppSetup(true)}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                title="Configurar WhatsApp"
              >
                <MessageSquare className="w-3 h-3" />
                <span>📱 WhatsApp</span>
              </button>
            </div>
          </div>
          <NavigationMenu
            onAddClient={() => {
              handleAddClient();
              setCurrentView('dashboard');
            }}
            onManageCategories={() => {
              setShowCategoryManager(true);
              setCurrentView('dashboard');
            }}
            onOpenTasks={() => {
              handleOpenTasks();
              setCurrentView('dashboard');
            }}
            onToggleClientsList={() => {
              handleViewClients();
            }}
            showClientsList={showClientsList}
            onSignOut={handleLogout}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {currentView === 'dashboard' && !showClientsList && !showTaskList ? (
          <Dashboard
            stats={dashboardStats}
            onAddClient={() => {
              handleAddClient();
              setCurrentView('dashboard');
            }}
            onViewTasks={() => {
              handleViewTasks();
            }}
            onViewClients={() => {
              handleViewClients();
            }}
          />
        ) : (
          <div>
            {/* Filter Bar - only show when not in dashboard */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              isDark={isDark}
              toggleDarkMode={() => setIsDark(!isDark)}
              onAddClient={handleAddClient}
              categories={categories}
              onManageCategories={() => setShowCategoryManager(true)}
              clients={clients}
              allClients={allClients}
              onOpenTasks={() => handleOpenTasks()}
              showClientsList={showClientsList}
              onToggleClientsList={() => setShowClientsList(!showClientsList)}
              onSignOut={handleLogout}
            />

            {/* Task Reminders */}
            <div className="pt-6">
              <TaskReminders
                tasks={allTasks.filter(t => t.status !== 'completed')}
                onTaskClick={handleEditTask}
              />
            </div>

            {/* Stats Cards */}
            <div className="py-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2 md:gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Clientes</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-lg md:text-2xl font-bold text-red-600">{stats.pending}</p>
              </div>
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">En Proceso</p>
                <p className="text-lg md:text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Pagadas</p>
                <p className="text-lg md:text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Prioridad Alta</p>
                <p className="text-lg md:text-2xl font-bold text-orange-600">{stats.highPriority}</p>
              </div>
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Pagos Próximos</p>
                <p className="text-lg md:text-2xl font-bold text-purple-600">{upcomingPayments}</p>
              </div>
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Pagado en Mano</p>
                <p className="text-lg md:text-2xl font-bold text-green-600">{stats.paidInCash}</p>
              </div>
              <HandCoins className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Tareas Pendientes</p>
                <p className="text-lg md:text-2xl font-bold text-orange-600">{taskStats.pending + taskStats.inProgress}</p>
              </div>
              <CheckSquare className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Tareas Vencidas</p>
                <p className="text-lg md:text-2xl font-bold text-red-600">{taskStats.overdue}</p>
              </div>
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Agenda de Tareas Principal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <CheckSquare className="w-6 h-6 mr-2 text-blue-600" />
              Agenda de Tareas
            </h2>
            <button
              onClick={() => handleAddTask()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Tarea</span>
            </button>
          </div>

          {/* Filtros rápidos de tareas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6">
            <button
              onClick={() => setTaskFilters({ ...taskFilters, status: '', assignee: '' })}
              className={`p-2 md:p-3 rounded-lg border transition-colors ${
                !taskFilters.status && !taskFilters.assignee
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <div className="text-center">
                <div className="text-base md:text-lg font-bold">{taskStats.total}</div>
                <div className="text-xs md:text-sm">Todas</div>
              </div>
            </button>

            <button
              onClick={() => setTaskFilters({ ...taskFilters, status: 'pending' })}
              className={`p-2 md:p-3 rounded-lg border transition-colors ${
                taskFilters.status === 'pending'
                  ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <div className="text-center">
                <div className="text-base md:text-lg font-bold text-red-600">{taskStats.pending}</div>
                <div className="text-xs md:text-sm">Pendientes</div>
              </div>
            </button>

            <button
              onClick={() => setTaskFilters({ ...taskFilters, assignee: 'Nati' })}
              className={`p-2 md:p-3 rounded-lg border transition-colors ${
                taskFilters.assignee === 'Nati'
                  ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <div className="text-center">
                <div className="text-base md:text-lg font-bold text-purple-600">
                  {allTasks.filter(t => t.assignee === 'Nati' && t.status !== 'completed').length}
                </div>
                <div className="text-xs md:text-sm">Nati</div>
              </div>
            </button>

            <button
              onClick={() => setTaskFilters({ ...taskFilters, assignee: 'Kenyi' })}
              className={`p-2 md:p-3 rounded-lg border transition-colors ${
                taskFilters.assignee === 'Kenyi'
                  ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <div className="text-center">
                <div className="text-base md:text-lg font-bold text-green-600">
                  {allTasks.filter(t => t.assignee === 'Kenyi' && t.status !== 'completed').length}
                </div>
                <div className="text-xs md:text-sm">Kenyi</div>
              </div>
            </button>
          </div>

          {/* Lista de tareas resumida */}
          <div className="space-y-3">
            {tasks.slice(0, 8).map((task) => (
              <div
                key={task.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  task.status === 'completed'
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 opacity-75'
                    : new Date(`${task.dueDate}T${task.dueTime}`) < new Date()
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    : 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                }`}
                onClick={() => handleEditTask(task)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : task.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {task.status === 'completed' ? 'Completada' : task.status === 'in-progress' ? 'En Proceso' : 'Pendiente'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{task.assignee}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{new Date(`${task.dueDate}T${task.dueTime}`).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 truncate max-w-32 md:max-w-none">{task.clientName}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {task.status !== 'completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          completeTask(task.id);
                        }}
                        className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                        title="Marcar como completada"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <div className="text-center py-8">
                <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">No hay tareas que mostrar</p>
                <button
                  onClick={() => handleAddTask()}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear primera tarea
                </button>
              </div>
            )}
            
            {tasks.length > 8 && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setShowTaskList(true)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Ver todas las tareas ({tasks.length})
                </button>
              </div>
            )}
          </div>
        </div>
          </div>

          {/* Lista de Clientes (Colapsable) */}
          {showClientsList && (
            <div>
              {/* Results info */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {clients.length} de {allClients.length} clientes
              </p>
              <div className="flex items-center space-x-2 text-sm">
                <select
                  value={`${sortField}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortField(field as any);
                    setSortDirection(direction as any);
                  }}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="createdAt-desc">Más reciente</option>
                  <option value="createdAt-asc">Más antiguo</option>
                  <option value="name-asc">Nombre A-Z</option>
                  <option value="name-desc">Nombre Z-A</option>
                  <option value="paymentDue-asc">Pago próximo</option>
                  <option value="priority-desc">Prioridad alta</option>
                </select>
              </div>
            </div>

            {/* Client List */}
            {clients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {allClients.length === 0 ? 'No hay clientes aún' : 'No se encontraron clientes'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {allClients.length === 0 
                    ? 'Comienza añadiendo tu primer cliente para gestionar tus consultas.'
                    : 'Intenta ajustar los filtros para encontrar lo que buscas.'
                  }
                </p>
                {allClients.length === 0 && (
                  <button
                    onClick={handleAddClient}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Añadir Primer Cliente
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {clients.map((client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onClick={() => handleClientClick(client)}
                    onEdit={() => handleEditClient(client)}
                    onWhatsApp={() => handleWhatsAppOpen(client)}
                    onAddTask={() => handleAddTask(client.id)}
                    onAIAnalyze={() => handleAIAnalyze(client)}
                  />
                ))}
              </div>
            )}
            </div>
          )}
        </div>
      )}
      </div>

      {/* Botón flotante del Asistente Perplexity */}
      {!showPerplexityAssistant && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="flex flex-col space-y-3">
            {/* Botón principal del asistente */}
            <button
              onClick={() => setShowPerplexityAssistant(true)}
              className="group relative bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              title="Asistente IA Legal con Perplexity"
            >
              <div className="flex items-center justify-center w-6 h-6">
                <Bot className="w-6 h-6" />
              </div>
              
              {/* Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Asistente Legal IA
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
              </div>
            </button>

            {/* Botón de acceso rápido para cliente activo */}
            {selectedClient && (
              <button
                onClick={() => {
                  setPerplexityClient(selectedClient);
                  setShowPerplexityAssistant(true);
                }}
                className="group relative bg-gradient-to-r from-green-600 to-teal-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                title={`Consultar sobre ${selectedClient.name}`}
              >
                <User className="w-4 h-4" />
                
                <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  Consultar: {selectedClient.name}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <ClientForm
        client={editingClient || undefined}
        onSave={handleSaveClient}
        onCancel={() => {
          setShowForm(false);
          setEditingClient(null);
        }}
        isOpen={showForm}
        categories={categories}
      />

      {selectedClient && (
        <ClientDetails
          client={selectedClient}
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedClient(null);
          }}
          onEdit={() => handleEditClient(selectedClient)}
          onDelete={handleDeleteClient}
          onWhatsApp={() => handleWhatsAppOpen(selectedClient)}
          whatsappMessages={whatsappMessages.filter(msg => msg.clientId === selectedClient.id)}
          onUpdateClient={(updates) => {
            updateClient(selectedClient.id, updates);
            setSelectedClient(prev => prev ? { ...prev, ...updates } : null);
          }}
          onOpenTasks={handleOpenTasks}
        />
      )}

      {whatsappClient && (
        <WhatsAppMessenger
          client={whatsappClient}
          isOpen={showWhatsApp}
          onClose={() => {
            setShowWhatsApp(false);
            setWhatsappClient(null);
          }}
          onSendMessage={handleSendWhatsAppMessage}
          messages={whatsappMessages.filter(msg => msg.clientId === whatsappClient.id)}
        />
      )}

      <CategoryManager
        categories={categories}
        onAddCategory={addCategory}
        onDeleteCategory={deleteCategory}
        onUpdateCategory={updateCategory}
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
      />

      <TaskForm
        task={editingTask}
        clients={allClients}
        preselectedClientId={preselectedClientId}
        onSave={handleSaveTask}
        onCancel={() => {
          setShowTaskForm(false);
          setEditingTask(null);
          setPreselectedClientId(undefined);
        }}
        isOpen={showTaskForm}
      />

      <TaskList
        tasks={tasks}
        clients={allClients}
        filters={taskFilters}
        onFiltersChange={setTaskFilters}
        onTaskComplete={completeTask}
        onTaskEdit={handleEditTask}
        onTaskDelete={deleteTask}
        onAddComment={addTaskComment}
        onAddTask={() => handleAddTask()}
        isOpen={showTaskList}
        onClose={() => setShowTaskList(false)}
      />

      {/* Asistente IA flotante - DESHABILITADO TEMPORALMENTE */}
      {false && (
        <AIAssistant 
          currentContext={{
            page: currentView,
            data: { 
              totalClients: allClients.length,
              totalTasks: allTasks.length,
              currentFilters: filters 
            }
          }}
          onAddClient={addClient}
        />
      )}

      {/* Asistente Perplexity AI */}
      <PerplexityAssistant
        isOpen={showPerplexityAssistant}
        onClose={() => {
          setShowPerplexityAssistant(false);
          setPerplexityClient(null);
        }}
        client={perplexityClient || undefined}
      />

      {/* Configuración de WhatsApp */}
      <WhatsAppSetup
        isOpen={showWhatsAppSetup}
        onClose={() => setShowWhatsAppSetup(false)}
      />

      {/* Analizador Autónomo */}
      <AutonomousAnalyzer
        clients={allClients}
        isVisible={!!user && allClients.length > 0}
        onInsightAction={(insight) => {
          console.log('🎯 Acción de insight autónomo:', insight);
          // Aquí podríamos implementar acciones específicas basadas en el tipo de insight
        }}
      />
    </div>
  );
}

export default App;