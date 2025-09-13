import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, MapPin, Plus, Edit2, Trash2, Phone, Mail, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';
import { useAvailability } from '../hooks/useAvailability';
import { Appointment } from '../types';
import { AvailabilityManager } from './AvailabilityManager';

interface CalendarProps {
  onAppointmentSelect?: (appointment: Appointment) => void;
  onAddAppointment?: () => void;
}

const AppointmentCalendar: React.FC<CalendarProps> = ({ onAppointmentSelect, onAddAppointment }) => {
  const { 
    appointments, 
    error, 
    filter, 
    setFilter,
    getAppointmentsByDate,
    getUpcomingAppointments,
    deleteAppointment,
    confirmAppointment,
    sendReminder
  } = useAppointments();

  const {
    getDayAvailability,
    getAvailableDates
  } = useAvailability();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [showAvailabilityManager, setShowAvailabilityManager] = useState(false);

  const dayAppointments = getAppointmentsByDate(selectedDate);
  const upcomingAppointments = getUpcomingAppointments();

  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startCalendar = new Date(firstDay);
    startCalendar.setDate(startCalendar.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startCalendar);
    
    for (let i = 0; i < 42; i++) {
      const dateString = current.toISOString().split('T')[0];
      const dayAppointments = getAppointmentsByDate(dateString);
      const dayAvailability = getDayAvailability(dateString, dayAppointments.map(a => a.appointmentTime));
      const isToday = dateString === today.toISOString().split('T')[0];
      const isCurrentMonth = current.getMonth() === currentMonth;
      const isSelected = dateString === selectedDate;
      
      days.push({
        date: current.getDate(),
        dateString,
        isToday,
        isCurrentMonth,
        isSelected,
        appointmentCount: dayAppointments.length,
        hasAppointments: dayAppointments.length > 0,
        isAvailable: dayAvailability.isAvailable,
        availableSlots: dayAvailability.timeSlots.filter(slot => slot.available).length,
        totalSlots: dayAvailability.timeSlots.length
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const currentMonth = monthNames[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Calendario de Citas
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona las citas y horarios disponibles
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowAvailabilityManager(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Gestionar Horarios
          </button>
          <button
            onClick={() => setView(view === 'calendar' ? 'list' : 'calendar')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {view === 'calendar' ? 'Vista Lista' : 'Vista Calendario'}
          </button>
          <button
            onClick={() => onAddAppointment?.()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Todos los estados</option>
          <option value="scheduled">Programada</option>
          <option value="confirmed">Confirmada</option>
          <option value="completed">Completada</option>
          <option value="cancelled">Cancelada</option>
          <option value="no-show">No asistió</option>
        </select>

        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Todos los tipos</option>
          <option value="consultation">Consulta</option>
          <option value="follow-up">Seguimiento</option>
          <option value="document-review">Revisión documentos</option>
          <option value="signing">Firma</option>
          <option value="other">Otro</option>
        </select>

        <select
          value={filter.dateRange}
          onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Todas las fechas</option>
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar/List View */}
        <div className="lg:col-span-2">
          {view === 'calendar' ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentMonth} {currentYear}
                </h3>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
                
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day.dateString)}
                    className={`
                      p-2 text-sm relative hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded min-h-[60px] border
                      ${day.isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'}
                      ${day.isToday ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold border-blue-300' : 'border-transparent'}
                      ${day.isSelected ? 'bg-blue-600 text-white border-blue-600' : ''}
                      ${!day.isAvailable && day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' : ''}
                    `}
                  >
                    <div className="flex flex-col items-center justify-start h-full">
                      <span className="font-medium">{day.date}</span>
                      
                      {/* Indicadores de disponibilidad */}
                      <div className="flex flex-col items-center mt-1 space-y-0.5">
                        {day.hasAppointments && (
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" title={`${day.appointmentCount} citas`}></div>
                        )}
                        
                        {day.isAvailable && day.isCurrentMonth && (
                          <div className="flex items-center space-x-0.5">
                            <div className="w-1 h-1 bg-green-500 rounded-full" title="Día disponible"></div>
                            {day.availableSlots > 0 && (
                              <span className="text-xs text-green-600 dark:text-green-400" title={`${day.availableSlots} slots disponibles`}>
                                {day.availableSlots}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {!day.isAvailable && day.isCurrentMonth && (
                          <div className="w-1 h-1 bg-gray-400 rounded-full" title="Día no disponible"></div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Lista de Citas
              </h3>
              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No hay citas programadas
                  </p>
                ) : (
                  appointments.map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onDelete={deleteAppointment}
                      onConfirm={confirmAppointment}
                      onSendReminder={sendReminder}
                      onSelect={onAppointmentSelect}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Appointments for Selected Date */}
        <div className="space-y-6">
          {/* Selected Date Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Citas del {new Date(selectedDate).toLocaleDateString('es-ES')}
            </h3>
            <div className="space-y-3">
              {dayAppointments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No hay citas para esta fecha
                </p>
              ) : (
                dayAppointments.map(appointment => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    compact={true}
                    onDelete={deleteAppointment}
                    onConfirm={confirmAppointment}
                    onSendReminder={sendReminder}
                    onSelect={onAppointmentSelect}
                  />
                ))
              )}
            </div>
          </div>

          {/* Day Availability Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Disponibilidad del Día
            </h3>
            {(() => {
              const dayAvailability = getDayAvailability(selectedDate, dayAppointments.map(a => a.appointmentTime));
              
              if (!dayAvailability.isAvailable) {
                return (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {dayAvailability.exception?.reason || 'Día no disponible para citas'}
                    </p>
                  </div>
                );
              }

              const availableSlots = dayAvailability.timeSlots.filter(slot => slot.available);
              const bookedSlots = dayAvailability.timeSlots.filter(slot => !slot.available);

              return (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{availableSlots.length}</div>
                      <div className="text-xs text-gray-500">Disponibles</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{bookedSlots.length}</div>
                      <div className="text-xs text-gray-500">Ocupados</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{dayAvailability.timeSlots.length}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>

                  {/* Available Time Slots */}
                  {availableSlots.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Horarios Disponibles
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {availableSlots.map(slot => (
                          <div 
                            key={slot.time}
                            className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-center"
                          >
                            {slot.time}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Working Hours Info */}
                  {dayAvailability.rule && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <p>Horario: {dayAvailability.rule.startTime} - {dayAvailability.rule.endTime}</p>
                      <p>Duración por cita: {dayAvailability.rule.slotDuration} minutos</p>
                      {dayAvailability.rule.breakTime && dayAvailability.rule.breakTime > 0 && (
                        <p>Descanso entre citas: {dayAvailability.rule.breakTime} minutos</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Próximas Citas
            </h3>
            <div className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No hay citas próximas
                </p>
              ) : (
                upcomingAppointments.map(appointment => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    compact={true}
                    onDelete={deleteAppointment}
                    onConfirm={confirmAppointment}
                    onSendReminder={sendReminder}
                    onSelect={onAppointmentSelect}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Availability Manager Modal */}
      <AvailabilityManager 
        isOpen={showAvailabilityManager}
        onClose={() => setShowAvailabilityManager(false)}
      />
    </div>
  );
};

interface AppointmentCardProps {
  appointment: Appointment;
  compact?: boolean;
  onDelete: (id: string) => void;
  onConfirm: (id: string) => void;
  onSendReminder: (id: string) => void;
  onSelect?: (appointment: Appointment) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  compact = false,
  onDelete,
  onConfirm,
  onSendReminder,
  onSelect
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <User className="w-4 h-4" />;
      case 'document-review': return <Edit2 className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  return (
    <div 
      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      onClick={() => onSelect?.(appointment)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getTypeIcon(appointment.type)}
            <h4 className="font-medium text-gray-900 dark:text-white">
              {appointment.title}
            </h4>
            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{appointment.appointmentTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{appointment.clientName}</span>
            </div>
            {!compact && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{appointment.location}</span>
              </div>
            )}
          </div>
          
          {!compact && appointment.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {appointment.description}
            </p>
          )}
        </div>
        
        {!compact && (
          <div className="flex gap-1 ml-4">
            {appointment.status === 'scheduled' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirm(appointment.id);
                }}
                className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                title="Confirmar cita"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
            
            {!appointment.reminderSent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSendReminder(appointment.id);
                }}
                className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                title="Enviar recordatorio"
              >
                <Phone className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(appointment.id);
              }}
              className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
              title="Eliminar cita"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {!compact && (
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span>{appointment.clientPhone}</span>
          </div>
          <div className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            <span>{appointment.clientEmail}</span>
          </div>
          <span>Duración: {appointment.duration}min</span>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;