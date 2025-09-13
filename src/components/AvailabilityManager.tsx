import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  ToggleLeft,
  ToggleRight,
  Download,
  Upload,
  RefreshCw,
  Info
} from 'lucide-react';
import { AvailabilityRule, AvailabilityException, AvailabilitySettings } from '../types';
import { useAvailability } from '../hooks/useAvailability';

interface AvailabilityManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
  isOpen,
  onClose
}) => {
  const {
    rules,
    exceptions,
    settings,
    loading,
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    addException,
    updateException,
    deleteException,
    saveSettings,
    resetToDefault,
    exportConfig,
    importConfig,
    getAvailableDates,
    getNextAvailableSlot
  } = useAvailability();

  const [activeTab, setActiveTab] = useState<'rules' | 'exceptions' | 'settings'>('rules');
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [editingException, setEditingException] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<Partial<AvailabilityRule>>({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '18:00',
    slotDuration: 60,
    breakTime: 0,
    isActive: true
  });
  const [newException, setNewException] = useState<Partial<AvailabilityException>>({
    date: new Date().toISOString().split('T')[0],
    type: 'unavailable',
    reason: '',
    isActive: true
  });

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const handleAddRule = () => {
    if (newRule.dayOfWeek !== undefined && newRule.startTime && newRule.endTime) {
      addRule(newRule as Omit<AvailabilityRule, 'id' | 'createdAt' | 'updatedAt'>);
      setNewRule({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '18:00',
        slotDuration: 60,
        breakTime: 0,
        isActive: true
      });
    }
  };

  const handleAddException = () => {
    if (newException.date && newException.reason) {
      addException(newException as Omit<AvailabilityException, 'id' | 'createdAt' | 'updatedAt'>);
      setNewException({
        date: new Date().toISOString().split('T')[0],
        type: 'unavailable',
        reason: '',
        isActive: true
      });
    }
  };

  const handleExportConfig = () => {
    const config = exportConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `availability-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          importConfig(config);
          alert('Configuración importada correctamente');
        } catch (error) {
          alert('Error al importar configuración');
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-6xl h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gestión de Disponibilidad
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportConfig}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Exportar configuración"
            >
              <Download className="w-5 h-5" />
            </button>
            <label className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-5 h-5" />
              <input
                type="file"
                accept=".json"
                onChange={handleImportConfig}
                className="hidden"
              />
            </label>
            <button
              onClick={resetToDefault}
              className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
              title="Resetear configuración"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'rules', label: 'Horarios Semanales', icon: Clock },
            { id: 'exceptions', label: 'Excepciones', icon: Calendar },
            { id: 'settings', label: 'Configuración', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === id
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'rules' && (
            <div className="space-y-6">
              {/* Info Panel */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Horarios Semanales</p>
                    <p>Define tus horarios de trabajo para cada día de la semana. Los clientes solo podrán reservar citas en estos horarios.</p>
                  </div>
                </div>
              </div>

              {/* Add New Rule */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Agregar Nuevo Horario</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Día</label>
                    <select
                      value={newRule.dayOfWeek}
                      onChange={(e) => setNewRule({ ...newRule, dayOfWeek: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    >
                      {dayNames.map((day, index) => (
                        <option key={index} value={index}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora Inicio</label>
                    <input
                      type="time"
                      value={newRule.startTime}
                      onChange={(e) => setNewRule({ ...newRule, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora Fin</label>
                    <input
                      type="time"
                      value={newRule.endTime}
                      onChange={(e) => setNewRule({ ...newRule, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duración (min)</label>
                    <select
                      value={newRule.slotDuration}
                      onChange={(e) => setNewRule({ ...newRule, slotDuration: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    >
                      <option value={30}>30 min</option>
                      <option value={60}>60 min</option>
                      <option value={90}>90 min</option>
                      <option value={120}>120 min</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descanso (min)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={newRule.breakTime}
                      onChange={(e) => setNewRule({ ...newRule, breakTime: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddRule}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Rules List */}
              <div className="space-y-3">
                {rules
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  .map((rule) => (
                  <div key={rule.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className="text-gray-600 hover:text-blue-600"
                        >
                          {rule.isActive ? (
                            <ToggleRight className="w-6 h-6 text-blue-600" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-gray-400" />
                          )}
                        </button>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {dayNames[rule.dayOfWeek]}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {rule.startTime} - {rule.endTime} • {rule.slotDuration}min
                            {rule.breakTime > 0 && ` • ${rule.breakTime}min descanso`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingRule(editingRule === rule.id ? null : rule.id)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {editingRule === rule.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora Inicio</label>
                            <input
                              type="time"
                              value={rule.startTime}
                              onChange={(e) => updateRule(rule.id, { startTime: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora Fin</label>
                            <input
                              type="time"
                              value={rule.endTime}
                              onChange={(e) => updateRule(rule.id, { endTime: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duración (min)</label>
                            <select
                              value={rule.slotDuration}
                              onChange={(e) => updateRule(rule.id, { slotDuration: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                            >
                              <option value={30}>30 min</option>
                              <option value={60}>60 min</option>
                              <option value={90}>90 min</option>
                              <option value={120}>120 min</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descanso (min)</label>
                            <input
                              type="number"
                              min="0"
                              max="60"
                              value={rule.breakTime}
                              onChange={(e) => updateRule(rule.id, { breakTime: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                            />
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => setEditingRule(null)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>Guardar</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'exceptions' && (
            <div className="space-y-6">
              {/* Info Panel */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="text-sm text-orange-800 dark:text-orange-200">
                    <p className="font-medium mb-1">Excepciones de Horario</p>
                    <p>Define días específicos donde no estarás disponible o tendrás horarios diferentes a los habituales.</p>
                  </div>
                </div>
              </div>

              {/* Add New Exception */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Agregar Nueva Excepción</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={newException.date}
                      onChange={(e) => setNewException({ ...newException, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                    <select
                      value={newException.type}
                      onChange={(e) => setNewException({ ...newException, type: e.target.value as 'unavailable' | 'custom-hours' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    >
                      <option value="unavailable">No disponible</option>
                      <option value="custom-hours">Horario personalizado</option>
                    </select>
                  </div>
                  {newException.type === 'custom-hours' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora Inicio</label>
                        <input
                          type="time"
                          value={newException.startTime || ''}
                          onChange={(e) => setNewException({ ...newException, startTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora Fin</label>
                        <input
                          type="time"
                          value={newException.endTime || ''}
                          onChange={(e) => setNewException({ ...newException, endTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        />
                      </div>
                    </>
                  )}
                  <div className={newException.type === 'custom-hours' ? '' : 'md:col-span-2'}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motivo</label>
                    <input
                      type="text"
                      value={newException.reason}
                      onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
                      placeholder="Vacaciones, reunión, etc."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddException}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Exceptions List */}
              <div className="space-y-3">
                {exceptions
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((exception) => (
                  <div key={exception.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${exception.type === 'unavailable' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {new Date(exception.date + 'T00:00:00').toLocaleDateString('es-ES', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {exception.type === 'unavailable' ? 'No disponible' : `${exception.startTime} - ${exception.endTime}`} • {exception.reason}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateException(exception.id, { isActive: !exception.isActive })}
                          className="text-gray-600 hover:text-blue-600"
                        >
                          {exception.isActive ? (
                            <ToggleRight className="w-6 h-6 text-blue-600" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteException(exception.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {exceptions.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay excepciones configuradas</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Info Panel */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800 dark:text-green-200">
                    <p className="font-medium mb-1">Configuración General</p>
                    <p>Define las reglas generales para el sistema de reservas y cómo interactúan los clientes con tu calendario.</p>
                  </div>
                </div>
              </div>

              {/* Settings Form */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-6">Configuración de Reservas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Días de anticipación máxima
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={settings.advanceBookingDays}
                      onChange={(e) => saveSettings({ ...settings, advanceBookingDays: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <p className="text-xs text-gray-500 mt-1">Cuántos días en el futuro pueden reservar los clientes</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tiempo mínimo de anticipación (horas)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="72"
                      value={settings.bufferTime}
                      onChange={(e) => saveSettings({ ...settings, bufferTime: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tiempo mínimo entre la reserva y la cita</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Máximo de citas por día
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={settings.maxDailyAppointments || 8}
                      onChange={(e) => saveSettings({ ...settings, maxDailyAppointments: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <p className="text-xs text-gray-500 mt-1">Límite de citas que puedes tener por día</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Permitir reservas el mismo día
                        </label>
                        <p className="text-xs text-gray-500">Los clientes pueden reservar citas para hoy</p>
                      </div>
                      <button
                        onClick={() => saveSettings({ ...settings, sameDayBooking: !settings.sameDayBooking })}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        {settings.sameDayBooking ? (
                          <ToggleRight className="w-8 h-8 text-blue-600" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Auto-confirmar citas web
                        </label>
                        <p className="text-xs text-gray-500">Las citas se confirman automáticamente sin revisión manual</p>
                      </div>
                      <button
                        onClick={() => saveSettings({ ...settings, autoConfirm: !settings.autoConfirm })}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        {settings.autoConfirm ? (
                          <ToggleRight className="w-8 h-8 text-blue-600" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">Vista Previa de Disponibilidad</h4>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                  <p>• Próximas fechas disponibles: <strong>{getAvailableDates().slice(0, 3).join(', ')}</strong></p>
                  <p>• Próximo slot disponible: <strong>
                    {(() => {
                      const next = getNextAvailableSlot();
                      return next ? `${next.date} a las ${next.time}` : 'No hay slots disponibles';
                    })()}
                  </strong></p>
                  <p>• Total de fechas disponibles en los próximos {settings.advanceBookingDays} días: <strong>{getAvailableDates().length}</strong></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};