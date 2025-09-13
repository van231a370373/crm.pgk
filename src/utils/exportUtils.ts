import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Client, FilterState } from '../types';

export interface ExportData {
  'Nombre': string;
  'Empresa': string;
  'Emails': string;
  'Teléfonos': string;
  'Categoría': string;
  'Estado': string;
  'Tipo de Consulta': string;
  'Prioridad': string;
  'Origen': string;
  'Cumpleaños': string;
  'Fecha de Pago': string;
  'Renovación': string;
  'Cierre': string;
  'Apuntes': string;
  'Sugerencias IA': string;
  'Enlaces Drive': string;
  'Fecha Creación': string;
  'Última Actualización': string;
  'Mensajes WhatsApp': string;
  'Pagado en Mano': string;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-ES');
};

const formatContacts = (contacts: Array<{ value: string; label: string; isPrimary: boolean }>): string => {
  return contacts
    .map(contact => `${contact.value} (${contact.label})${contact.isPrimary ? ' [Principal]' : ''}`)
    .join('; ');
};

const getStatusText = (status: Client['status']): string => {
  const statusMap = {
    'pending': 'Pendiente',
    'in-progress': 'En Proceso',
    'paid': 'Pagada',
    'completed': 'Completada',
    'cancelled': 'Cancelada'
  };
  return statusMap[status] || status;
};

const getPriorityText = (priority: Client['priority']): string => {
  const priorityMap = {
    'high': 'Alta',
    'medium': 'Media',
    'low': 'Baja'
  };
  return priorityMap[priority] || priority;
};

const generateFileName = (filters: FilterState, format: 'xlsx' | 'csv'): string => {
  const today = new Date().toISOString().split('T')[0];
  let filterSuffix = '';
  
  // Build filter description for filename
  const activeFilters = [];
  
  if (filters.category) {
    activeFilters.push(filters.category.replace(/\s+/g, '_'));
  }
  
  if (filters.status) {
    const statusMap = {
      'pending': 'Pendiente',
      'in-progress': 'EnProceso',
      'paid': 'Pagada',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    activeFilters.push(statusMap[filters.status as keyof typeof statusMap] || filters.status);
  }
  
  if (filters.priority) {
    const priorityMap = {
      'high': 'PrioridadAlta',
      'medium': 'PrioridadMedia',
      'low': 'PrioridadBaja'
    };
    activeFilters.push(priorityMap[filters.priority as keyof typeof priorityMap] || filters.priority);
  }
  
  if (filters.paidInCash) {
    activeFilters.push('PagadoEnMano');
  }
  
  if (filters.search) {
    activeFilters.push('Busqueda');
  }
  
  if (filters.dateRange) {
    const dateMap = {
      'today': 'Hoy',
      'week': 'EstaSemana',
      'month': 'EsteMes',
      'overdue': 'Vencidas'
    };
    activeFilters.push(dateMap[filters.dateRange as keyof typeof dateMap] || filters.dateRange);
  }
  
  if (activeFilters.length > 0) {
    filterSuffix = `_${activeFilters.join('_')}`;
  }
  
  return `CRM_clientes${filterSuffix}_${today}.${format}`;
};

export const prepareExportData = (clients: Client[]): ExportData[] => {
  return clients.map(client => ({
    'Nombre': client.name,
    'Empresa': client.company || '',
    'Emails': formatContacts(client.emails),
    'Teléfonos': formatContacts(client.phones),
    'Categoría': client.category,
    'Estado': getStatusText(client.status),
    'Tipo de Consulta': client.consultationType,
    'Prioridad': getPriorityText(client.priority),
    'Origen': client.source,
    'Cumpleaños': formatDate(client.keyDates.birthday),
    'Fecha de Pago': formatDate(client.keyDates.paymentDue),
    'Renovación': formatDate(client.keyDates.renewal),
    'Cierre': formatDate(client.keyDates.closing),
    'Apuntes': client.notes,
    'Sugerencias IA': client.aiSuggestions,
    'Enlaces Drive': client.driveLinks.join('; '),
    'Fecha Creación': formatDate(client.createdAt),
    'Última Actualización': formatDate(client.updatedAt),
    'Mensajes WhatsApp': `${client.whatsappHistory?.length || 0} mensajes`,
    'Pagado en Mano': client.paidInCash ? 'Sí' : 'No'
  }));
};

export const exportToExcel = (clients: Client[], filters: FilterState, filename?: string): void => {
  const exportData = prepareExportData(clients);
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  // Ajustar ancho de columnas
  const columnWidths = [
    { wch: 25 }, // Nombre
    { wch: 25 }, // Empresa
    { wch: 40 }, // Emails
    { wch: 30 }, // Teléfonos
    { wch: 15 }, // Categoría
    { wch: 12 }, // Estado
    { wch: 30 }, // Tipo de Consulta
    { wch: 10 }, // Prioridad
    { wch: 12 }, // Origen
    { wch: 12 }, // Cumpleaños
    { wch: 12 }, // Fecha de Pago
    { wch: 12 }, // Renovación
    { wch: 12 }, // Cierre
    { wch: 50 }, // Apuntes
    { wch: 40 }, // Sugerencias IA
    { wch: 50 }, // Enlaces Drive
    { wch: 15 }, // Fecha Creación
    { wch: 15 }, // Última Actualización
    { wch: 15 }, // Mensajes WhatsApp
    { wch: 12 }  // Pagado en Mano
  ];
  
  worksheet['!cols'] = columnWidths;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
  
  const finalFilename = filename || generateFileName(filters, 'xlsx');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(blob, finalFilename);
};

export const exportToCSV = (clients: Client[], filters: FilterState, filename?: string): void => {
  const exportData = prepareExportData(clients);
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);
  
  const finalFilename = filename || generateFileName(filters, 'csv');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, finalFilename);
};

export const getExportStats = (clients: Client[]) => {
  return {
    total: clients.length,
    byStatus: {
      pending: clients.filter(c => c.status === 'pending').length,
      inProgress: clients.filter(c => c.status === 'in-progress').length,
      paid: clients.filter(c => c.status === 'paid').length,
      completed: clients.filter(c => c.status === 'completed').length,
      cancelled: clients.filter(c => c.status === 'cancelled').length,
    },
    byPriority: {
      high: clients.filter(c => c.priority === 'high').length,
      medium: clients.filter(c => c.priority === 'medium').length,
      low: clients.filter(c => c.priority === 'low').length,
    }
  };
};