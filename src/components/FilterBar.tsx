import React from 'react';
import { Search, Filter, Calendar, AlertCircle, Moon, Sun, Plus, Settings, Building2, HandCoins, CheckSquare, Users } from 'lucide-react';
import { FilterState } from '../types';
import { ServiceCategory } from '../types';
import { ExportButton } from './ExportButton';
import { NavigationMenu } from './NavigationMenu';
import { Client } from '../types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
  onAddClient: () => void;
  categories: ServiceCategory[];
  onManageCategories: () => void;
  clients: Client[];
  allClients: Client[];
  onOpenTasks: () => void;
  showClientsList: boolean;
  onToggleClientsList: () => void;
  onSignOut: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  isDark,
  toggleDarkMode,
  onAddClient,
  categories,
  onManageCategories,
  clients,
  allClients,
  onOpenTasks,
  showClientsList,
  onToggleClientsList,
  onSignOut,
}) => {
  const updateFilter = (key: keyof FilterState, value: string | boolean) => {
    setFilters({ ...filters, [key]: value });
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.status ||
    filters.category ||
    filters.priority ||
    filters.dateRange ||
    filters.paidInCash
  );
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {/* Header with title and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center justify-center p-2">
            <img 
              src="/logo.png" 
              alt="Polska Grupa Konsultingowa" 
              className="w-full h-full object-contain" 
              onError={(e) => {
                // Fallback si no carga la imagen
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center"><span class="text-white font-bold text-sm">PGK</span></div>';
              }}
            />
          </div>
          
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">Polska Grupa Konsultingowa</h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Sistema de Gestión de Clientes</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
          <button
            onClick={toggleDarkMode}
            className="p-1.5 md:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" /> : <Moon className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />}
          </button>
          <button
            onClick={onManageCategories}
            title="Gestionar categorías"
            className="p-1.5 md:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors hidden sm:flex"
          >
            <Settings className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={onOpenTasks}
            title="Gestionar tareas"
            className="p-1.5 md:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors hidden sm:flex"
          >
            <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={onToggleClientsList}
            title={showClientsList ? "Ocultar lista de clientes" : "Mostrar lista de clientes"}
            className={`p-1.5 md:p-2 rounded-lg transition-colors ${
              showClientsList 
                ? 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800' 
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
          >
            <Users className={`w-4 h-4 md:w-5 md:h-5 ${
              showClientsList 
                ? 'text-blue-600 dark:text-blue-300' 
                : 'text-gray-600 dark:text-gray-300'
            }`} />
          </button>
          <ExportButton
            clients={clients}
            filters={filters}
          />

          {/* Navigation Menu */}
          <NavigationMenu
            onAddClient={onAddClient}
            onManageCategories={onManageCategories}
            onOpenTasks={onOpenTasks}
            onToggleClientsList={onToggleClientsList}
            showClientsList={showClientsList}
            onSignOut={onSignOut}
          />
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nombre, email, empresa o apuntes..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-4">
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="px-2 py-1.5 md:px-3 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="in-progress">En Proceso</option>
          <option value="paid">Pagada</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="px-2 py-1.5 md:px-3 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => updateFilter('priority', e.target.value)}
          className="px-2 py-1.5 md:px-3 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="">Todas las prioridades</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>

        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <select
            value={filters.dateRange}
            onChange={(e) => updateFilter('dateRange', e.target.value)}
            className="flex-1 px-2 py-1.5 md:px-3 md:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="overdue">Vencidas</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 col-span-1 sm:col-span-2 lg:col-span-1">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.paidInCash}
              onChange={(e) => updateFilter('paidInCash', e.target.checked)}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <HandCoins className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
            <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">Pagado en mano</span>
          </label>
        </div>
      </div>
    </div>
  );
};