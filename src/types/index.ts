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