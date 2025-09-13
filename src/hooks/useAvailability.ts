import { useState, useEffect } from 'react';
import { 
  AvailabilityRule, 
  AvailabilityException, 
  AvailabilitySettings, 
  DayAvailability, 
  TimeSlot 
} from '../types';

const STORAGE_KEYS = {
  RULES: 'availability_rules',
  EXCEPTIONS: 'availability_exceptions',  
  SETTINGS: 'availability_settings'
};

// Configuración por defecto
const DEFAULT_SETTINGS: AvailabilitySettings = {
  id: 'default',
  name: 'Configuración por defecto',
  advanceBookingDays: 30,
  sameDayBooking: false,
  bufferTime: 2, // 2 horas mínimo
  maxDailyAppointments: 8,
  autoConfirm: false,
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Reglas por defecto (Lunes a Viernes 9:00-18:00)
const DEFAULT_RULES: AvailabilityRule[] = [
  {
    id: 'monday',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '18:00',
    isActive: true,
    slotDuration: 60,
    breakTime: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tuesday',
    dayOfWeek: 2,
    startTime: '09:00',
    endTime: '18:00',
    isActive: true,
    slotDuration: 60,
    breakTime: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'wednesday',
    dayOfWeek: 3,
    startTime: '09:00',
    endTime: '18:00',
    isActive: true,
    slotDuration: 60,
    breakTime: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'thursday',
    dayOfWeek: 4,
    startTime: '09:00',
    endTime: '18:00',
    isActive: true,
    slotDuration: 60,
    breakTime: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'friday',
    dayOfWeek: 5,
    startTime: '09:00',
    endTime: '18:00',
    isActive: true,
    slotDuration: 60,
    breakTime: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function useAvailability() {
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [settings, setSettings] = useState<AvailabilitySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Cargar datos del localStorage
  useEffect(() => {
    try {
      const storedRules = localStorage.getItem(STORAGE_KEYS.RULES);
      const storedExceptions = localStorage.getItem(STORAGE_KEYS.EXCEPTIONS);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

      setRules(storedRules ? JSON.parse(storedRules) : DEFAULT_RULES);
      setExceptions(storedExceptions ? JSON.parse(storedExceptions) : []);
      setSettings(storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Error loading availability data:', error);
      setRules(DEFAULT_RULES);
      setExceptions([]);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Guardar reglas en localStorage
  const saveRules = (newRules: AvailabilityRule[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(newRules));
      setRules(newRules);
    } catch (error) {
      console.error('Error saving rules:', error);
    }
  };

  // Guardar excepciones en localStorage
  const saveExceptions = (newExceptions: AvailabilityException[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXCEPTIONS, JSON.stringify(newExceptions));
      setExceptions(newExceptions);
    } catch (error) {
      console.error('Error saving exceptions:', error);
    }
  };

  // Guardar configuración en localStorage
  const saveSettings = (newSettings: AvailabilitySettings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // CRUD para Reglas de Disponibilidad
  const addRule = (rule: Omit<AvailabilityRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRule: AvailabilityRule = {
      ...rule,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveRules([...rules, newRule]);
    return newRule;
  };

  const updateRule = (id: string, updates: Partial<AvailabilityRule>) => {
    const updatedRules = rules.map(rule =>
      rule.id === id
        ? { ...rule, ...updates, updatedAt: new Date().toISOString() }
        : rule
    );
    saveRules(updatedRules);
  };

  const deleteRule = (id: string) => {
    saveRules(rules.filter(rule => rule.id !== id));
  };

  const toggleRule = (id: string) => {
    updateRule(id, { isActive: !rules.find(r => r.id === id)?.isActive });
  };

  // CRUD para Excepciones
  const addException = (exception: Omit<AvailabilityException, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newException: AvailabilityException = {
      ...exception,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveExceptions([...exceptions, newException]);
    return newException;
  };

  const updateException = (id: string, updates: Partial<AvailabilityException>) => {
    const updatedExceptions = exceptions.map(exception =>
      exception.id === id
        ? { ...exception, ...updates, updatedAt: new Date().toISOString() }
        : exception
    );
    saveExceptions(updatedExceptions);
  };

  const deleteException = (id: string) => {
    saveExceptions(exceptions.filter(exception => exception.id !== id));
  };

  // Generar slots de tiempo para un día específico
  const generateTimeSlots = (date: string, existingAppointments: string[] = []): TimeSlot[] => {
    const dayOfWeek = new Date(date + 'T00:00:00').getDay();
    
    // Buscar excepción para esta fecha
    const exception = exceptions.find(e => e.date === date && e.isActive);
    if (exception && exception.type === 'unavailable') {
      return [];
    }

    // Buscar regla para este día de la semana
    const rule = rules.find(r => r.dayOfWeek === dayOfWeek && r.isActive);
    if (!rule) {
      return [];
    }

    const slots: TimeSlot[] = [];
    const startTime = exception?.startTime || rule.startTime;
    const endTime = exception?.endTime || rule.endTime;
    
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);
    
    const slotDuration = rule.slotDuration;
    const breakTime = rule.breakTime || 0;
    
    let currentTime = new Date(start);
    
    while (currentTime < end) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      const isBooked = existingAppointments.includes(timeString);
      
      // Verificar si hay suficiente tiempo para una cita completa
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
      if (slotEnd <= end) {
        slots.push({
          time: timeString,
          available: !isBooked,
          appointmentId: isBooked ? 'booked' : undefined
        });
      }
      
      // Avanzar al siguiente slot
      currentTime = new Date(currentTime.getTime() + (slotDuration + breakTime) * 60000);
    }
    
    return slots;
  };

  // Obtener disponibilidad para un rango de fechas
  const getDayAvailability = (date: string, existingAppointments: string[] = []): DayAvailability => {
    const dayOfWeek = new Date(date + 'T00:00:00').getDay();
    const rule = rules.find(r => r.dayOfWeek === dayOfWeek && r.isActive);
    const exception = exceptions.find(e => e.date === date && e.isActive);
    
    const isAvailable = rule && (!exception || exception.type === 'custom-hours');
    const timeSlots = isAvailable ? generateTimeSlots(date, existingAppointments) : [];
    
    return {
      date,
      dayOfWeek,
      isAvailable: Boolean(isAvailable && timeSlots.length > 0),
      timeSlots,
      rule,
      exception
    };
  };

  // Obtener fechas disponibles para reserva (considerando configuración)
  const getAvailableDates = (startDate = new Date()): string[] => {
    const dates: string[] = [];
    const maxDate = new Date(startDate);
    maxDate.setDate(maxDate.getDate() + settings.advanceBookingDays);
    
    let currentDate = new Date(startDate);
    
    // Si no se permiten reservas el mismo día, empezar mañana
    if (!settings.sameDayBooking) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Aplicar buffer time
    if (settings.bufferTime > 0) {
      const now = new Date();
      const minBookingTime = new Date(now.getTime() + settings.bufferTime * 60 * 60 * 1000);
      if (currentDate < minBookingTime) {
        currentDate = new Date(minBookingTime);
        currentDate.setHours(0, 0, 0, 0); // Redondear al día siguiente
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    while (currentDate <= maxDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayAvailability = getDayAvailability(dateString);
      
      if (dayAvailability.isAvailable) {
        dates.push(dateString);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  // Validar si un slot específico está disponible
  const isSlotAvailable = (date: string, time: string): boolean => {
    const dayAvailability = getDayAvailability(date);
    return dayAvailability.timeSlots.some(slot => 
      slot.time === time && slot.available
    );
  };

  // Obtener el próximo slot disponible
  const getNextAvailableSlot = (): { date: string; time: string } | null => {
    const availableDates = getAvailableDates();
    
    for (const date of availableDates) {
      const dayAvailability = getDayAvailability(date);
      const availableSlot = dayAvailability.timeSlots.find(slot => slot.available);
      
      if (availableSlot) {
        return { date, time: availableSlot.time };
      }
    }
    
    return null;
  };

  // Resetear a configuración por defecto
  const resetToDefault = () => {
    saveRules(DEFAULT_RULES);
    saveExceptions([]);
    saveSettings(DEFAULT_SETTINGS);
  };

  // Exportar configuración
  const exportConfig = () => {
    return {
      rules,
      exceptions,
      settings,
      exportedAt: new Date().toISOString()
    };
  };

  // Importar configuración
  const importConfig = (config: any) => {
    try {
      if (config.rules) saveRules(config.rules);
      if (config.exceptions) saveExceptions(config.exceptions);
      if (config.settings) saveSettings(config.settings);
      return true;
    } catch (error) {
      console.error('Error importing config:', error);
      return false;
    }
  };

  return {
    // Estado
    rules,
    exceptions,
    settings,
    loading,
    
    // CRUD Reglas
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    
    // CRUD Excepciones  
    addException,
    updateException,
    deleteException,
    
    // Configuración
    saveSettings,
    
    // Utilidades de disponibilidad
    generateTimeSlots,
    getDayAvailability,
    getAvailableDates,
    isSlotAvailable,
    getNextAvailableSlot,
    
    // Gestión
    resetToDefault,
    exportConfig,
    importConfig
  };
}