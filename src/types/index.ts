export interface Client {
  id: string;
  name: string;
  emails: ContactInfo[];
  phones: ContactInfo[];
  company?: string;
  category: string;
  status: 'pending' | 'in-progress' | 'paid' | 'completed' | 'cancelled';
  consultationType: string;
  notes: string;
  aiSuggestions: string;
  driveLinks: string[];
  keyDates: {
    birthday?: string;
    paymentDue?: string;
    renewal?: string;
    closing?: string;
    firstContact?: string;
  };
  // Nuevos campos para documentos de identidad
  documentNumber?: string;
  documentType?: string;
  nationality?: string;
  address?: string;
  gender?: string;
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high';
  source: string;
  whatsappHistory: WhatsAppMessage[];
  paidInCash: boolean;
}

export interface ContactInfo {
  id: string;
  value: string;
  label: string;
  isPrimary: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  createdAt: string;
}

export interface WhatsAppMessage {
  id: string;
  clientId: string;
  message: string;
  timestamp: string;
  type: 'sent' | 'received';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  aiGenerated: boolean;
  context?: string;
}

export interface FilterState {
  search: string;
  status: string;
  category: string;
  dateRange: string;
  priority: string;
  paidInCash: boolean;
}

export type SortField = 'name' | 'status' | 'createdAt' | 'paymentDue' | 'priority';
export type SortDirection = 'asc' | 'desc';

export interface Task {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  assignee: string; // Changed from 'Nati' | 'Kenyi' to string for dynamic users
  dueDate: string;
  dueTime: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval?: number;
    endDate?: string;
  };
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  completedAt?: string;
}

export interface TaskComment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

export interface TaskFilter {
  assignee: string;
  status: string;
  client: string;
  dateRange: string;
  priority: string;
}

export interface Appointment {
  id: string;
  clientId?: string; // Puede ser null si es un nuevo cliente
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  title: string;
  description: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number; // en minutos
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: 'consultation' | 'follow-up' | 'document-review' | 'signing' | 'other';
  location: 'office' | 'video-call' | 'phone' | 'client-location';
  notes?: string;
  reminderSent: boolean;
  confirmationSent: boolean;
  source: 'web-booking' | 'manual' | 'phone' | 'email';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface AppointmentFilter {
  status: string;
  type: string;
  dateRange: string;
  source: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

// Sistema de disponibilidad horaria
export interface AvailabilityRule {
  id: string;
  dayOfWeek: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado
  startTime: string; // HH:MM formato 24h
  endTime: string; // HH:MM formato 24h
  isActive: boolean;
  slotDuration: number; // Duración de cada slot en minutos (ej: 30, 60)
  breakTime?: number; // Tiempo de descanso entre citas en minutos
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityException {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'unavailable' | 'custom-hours';
  reason: string;
  startTime?: string; // Solo si type es 'custom-hours'
  endTime?: string; // Solo si type es 'custom-hours'
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySettings {
  id: string;
  name: string;
  advanceBookingDays: number; // Cuántos días de anticipación se puede reservar
  sameDayBooking: boolean; // Permitir reservas el mismo día
  bufferTime: number; // Tiempo mínimo entre la reserva y la cita (en horas)
  maxDailyAppointments?: number; // Límite de citas por día
  autoConfirm: boolean; // Auto-confirmar citas web
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  dayOfWeek: number;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
  rule?: AvailabilityRule;
  exception?: AvailabilityException;
}