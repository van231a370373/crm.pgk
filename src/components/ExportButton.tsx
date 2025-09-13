import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown, Users, Filter } from 'lucide-react';
import { Client, FilterState } from '../types';
import { exportToExcel, exportToCSV, getExportStats } from '../utils/exportUtils';

interface ExportButtonProps {
  clients: Client[];
  filters: FilterState;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ clients, filters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'excel' | 'csv') => {
    setIsExporting(true);
    setIsOpen(false);
    
    try {
      if (format === 'excel') {
        exportToExcel(clients, filters);
      } else {
        exportToCSV(clients, filters);
      }
      
      // Simular delay para mostrar estado de carga
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar los datos. Por favor, inténtalo de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  const stats = getExportStats(clients);
  
  const hasActiveFilters = !!(
    filters.search ||
    filters.status ||
    filters.category ||
    filters.priority ||
    filters.dateRange ||
    filters.paidInCash
  );
  
  const getFilterDescription = () => {
    const activeFilters = [];
    
    if (filters.category) activeFilters.push(`Categoría: ${filters.category}`);
    if (filters.status) {
      const statusMap = {
        'pending': 'Pendiente',
        'in-progress': 'En Proceso',
        'paid': 'Pagada',
        'completed': 'Completada',
        'cancelled': 'Cancelada'
      };
      activeFilters.push(`Estado: ${statusMap[filters.status as keyof typeof statusMap] || filters.status}`);
    }
    if (filters.priority) {
      const priorityMap = {
        'high': 'Alta',
        'medium': 'Media',
        'low': 'Baja'
      };
      activeFilters.push(`Prioridad: ${priorityMap[filters.priority as keyof typeof priorityMap] || filters.priority}`);
    }
    if (filters.paidInCash) activeFilters.push('Pagado en mano');
    if (filters.search) activeFilters.push(`Búsqueda: "${filters.search}"`);
    if (filters.dateRange) {
      const dateMap = {
        'today': 'Hoy',
        'week': 'Esta semana',
        'month': 'Este mes',
        'overdue': 'Vencidas'
      };
      activeFilters.push(`Fechas: ${dateMap[filters.dateRange as keyof typeof dateMap] || filters.dateRange}`);
    }
    
    return activeFilters.length > 0 ? activeFilters.join(', ') : 'Sin filtros activos';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center space-x-1 md:space-x-2 px-2 py-1.5 md:px-4 md:py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
      >
        {isExporting ? (
          <>
            <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs md:text-sm">Exportando...</span>
          </>
        ) : (
          <>
            <Download className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm">Exportar</span>
            <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Exportar Clientes Filtrados
            </h3>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
              Se exportarán los {stats.total} clientes mostrados actualmente
            </p>
          </div>

          <div className="p-4 space-y-4">
            {/* Información de filtros activos */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">
                  Filtros Activos
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {getFilterDescription()}
              </p>
            </div>
            
            {/* Estadísticas de exportación */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 mb-1">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Clientes a Exportar
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-bold text-xl">
                  {stats.total}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="font-medium text-red-600">Pendientes</p>
                  <p className="text-gray-600 dark:text-gray-400">{stats.byStatus.pending}</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-blue-600">En Proceso</p>
                  <p className="text-gray-600 dark:text-gray-400">{stats.byStatus.inProgress}</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-green-600">Pagadas</p>
                  <p className="text-gray-600 dark:text-gray-400">{stats.byStatus.paid}</p>
                </div>
              </div>
            </div>

            {/* Opciones de exportación */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white text-center">
                Selecciona el formato de exportación
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExport('excel')}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300 rounded-lg transition-colors text-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel</span>
                </button>
                
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>CSV</span>
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                📊 <strong>Incluye:</strong> Todos los campos, contactos múltiples, fechas, apuntes, enlaces Drive y estadísticas de WhatsApp
              </p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Overlay para cerrar el dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};