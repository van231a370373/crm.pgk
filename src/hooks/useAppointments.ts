import { useState, useEffect } from 'react';
import { Appointment, AppointmentFilter, TimeSlot } from '../types';

// Datos simulados para desarrollo
const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientId: 'client-1',
    clientName: 'María García',
    clientEmail: 'maria.garcia@email.com',
    clientPhone: '+34 600 123 456',
    title: 'Consulta inicial',
    description: 'Primera consulta sobre trámites de residencia',
    appointmentDate: '2024-12-20',
    appointmentTime: '10:00',
    duration: 60,
    status: 'confirmed',
    type: 'consultation',
    location: 'office',
    notes: 'Cliente solicita información sobre NIE',
    reminderSent: false,
    confirmationSent: true,
    source: 'web-booking',
    createdAt: '2024-12-19T14:30:00Z',
    updatedAt: '2024-12-19T14:30:00Z',
    createdBy: 'system'
  },
  {
    id: '2',
    clientId: 'client-2',
    clientName: 'Juan Pérez',
    clientEmail: 'juan.perez@email.com',
    clientPhone: '+34 655 987 654',
    title: 'Revisión documentos',
    description: 'Revisar documentación para reagrupación familiar',
    appointmentDate: '2024-12-21',
    appointmentTime: '15:30',
    duration: 90,
    status: 'scheduled',
    type: 'document-review',
    location: 'office',
    notes: '',
    reminderSent: false,
    confirmationSent: false,
    source: 'manual',
    createdAt: '2024-12-18T09:15:00Z',
    updatedAt: '2024-12-18T09:15:00Z',
    createdBy: 'nati'
  }
];

// Horarios disponibles (de 9:00 a 18:00 cada 30 minutos)
const generateTimeSlots = (date: string, existingAppointments: Appointment[]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const dayAppointments = existingAppointments.filter(apt => apt.appointmentDate === date);
  
  for (let hour = 9; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const existingAppointment = dayAppointments.find(apt => apt.appointmentTime === time);
      
      slots.push({
        time,
        available: !existingAppointment,
        appointmentId: existingAppointment?.id
      });
    }
  }
  
  return slots;
};

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AppointmentFilter>({
    status: '',
    type: '',
    dateRange: '',
    source: ''
  });

  // Cargar citas desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('crm_appointments');
    if (saved) {
      try {
        setAppointments(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading appointments:', e);
        setAppointments(mockAppointments);
      }
    } else {
      setAppointments(mockAppointments);
    }
  }, []);

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    if (appointments.length > 0) {
      localStorage.setItem('crm_appointments', JSON.stringify(appointments));
    }
  }, [appointments]);

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newAppointment: Appointment = {
        ...appointmentData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      setError('Error al crear la cita');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    setLoading(true);
    setError(null);
    
    try {
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === id 
            ? { ...apt, ...updates, updatedAt: new Date().toISOString() }
            : apt
        )
      );
    } catch (err) {
      setError('Error al actualizar la cita');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      setAppointments(prev => prev.filter(apt => apt.id !== id));
    } catch (err) {
      setError('Error al eliminar la cita');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTimeSlots = (date: string): TimeSlot[] => {
    return generateTimeSlots(date, appointments);
  };

  const getAppointmentsByDate = (date: string): Appointment[] => {
    return appointments.filter(apt => apt.appointmentDate === date);
  };

  const getUpcomingAppointments = (limit = 5): Appointment[] => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return appointments
      .filter(apt => {
        if (apt.appointmentDate > today) return true;
        if (apt.appointmentDate === today && apt.appointmentTime > currentTime) return true;
        return false;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
        const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, limit);
  };

  const sendReminder = async (appointmentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await updateAppointment(appointmentId, { reminderSent: true });
      // Aquí integrarías con WhatsApp/Email API
      console.log(`Recordatorio enviado para cita ${appointmentId}`);
    } catch (err) {
      setError('Error al enviar recordatorio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmAppointment = async (appointmentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await updateAppointment(appointmentId, { 
        status: 'confirmed', 
        confirmationSent: true 
      });
    } catch (err) {
      setError('Error al confirmar la cita');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Filtrar citas
  const filteredAppointments = appointments.filter(apt => {
    if (filter.status && apt.status !== filter.status) return false;
    if (filter.type && apt.type !== filter.type) return false;
    if (filter.source && apt.source !== filter.source) return false;
    
    if (filter.dateRange) {
      const today = new Date().toISOString().split('T')[0];
      const aptDate = apt.appointmentDate;
      
      switch (filter.dateRange) {
        case 'today':
          if (aptDate !== today) return false;
          break;
        case 'week':
          const weekFromNow = new Date();
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          if (aptDate > weekFromNow.toISOString().split('T')[0]) return false;
          break;
        case 'month':
          const monthFromNow = new Date();
          monthFromNow.setMonth(monthFromNow.getMonth() + 1);
          if (aptDate > monthFromNow.toISOString().split('T')[0]) return false;
          break;
      }
    }
    
    return true;
  });

  return {
    appointments: filteredAppointments,
    loading,
    error,
    filter,
    setFilter,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAvailableTimeSlots,
    getAppointmentsByDate,
    getUpcomingAppointments,
    sendReminder,
    confirmAppointment
  };
};