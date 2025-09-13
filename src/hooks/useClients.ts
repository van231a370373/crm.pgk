import { useState, useEffect, useMemo } from 'react';
import { Client, FilterState, SortField, SortDirection, WhatsAppMessage } from '../types';

const STORAGE_KEY = 'pgk-crm-clients';
const WHATSAPP_STORAGE_KEY = 'pgk-crm-whatsapp-messages';

// Sample clients for demonstration
const SAMPLE_CLIENTS: Client[] = [
  {
    id: 'sample-1',
    name: 'María González Rodríguez',
    emails: [
      { id: '1', value: 'maria.gonzalez@email.com', label: 'Personal', isPrimary: true },
      { id: '2', value: 'maria@consultora-mg.com', label: 'Trabajo', isPrimary: false }
    ],
    phones: [
      { id: '1', value: '+34 644 10 62 22', label: 'Móvil', isPrimary: true },
      { id: '2', value: '+34 91 234 5678', label: 'Oficina', isPrimary: false }
    ],
    company: 'Consultora MG S.L.',
    category: 'IRNR',
    status: 'in-progress',
    consultationType: 'Declaración IRNR 2024',
    notes: 'Cliente recurrente desde 2022. Necesita declaración para propiedades en Madrid y Barcelona. Documentación completa recibida el 15/01/2025.',
    aiSuggestions: 'Recordar solicitar certificados de retenciones antes del 28/02. Programar seguimiento semanal.',
    driveLinks: [
      'https://drive.google.com/drive/folders/ejemplo-maria-gonzalez',
      'https://drive.google.com/file/d/documentos-irnr-2024'
    ],
    keyDates: {
      birthday: '1985-03-15',
      paymentDue: '2025-02-15',
      renewal: '2026-01-15',
      closing: '2025-03-30'
    },
    createdAt: '2025-01-10T09:30:00.000Z',
    updatedAt: '2025-01-20T14:22:00.000Z',
    priority: 'high',
    source: 'referencia',
    whatsappHistory: [
      {
        id: 'msg-1',
        clientId: 'sample-1',
        message: 'Hola María, hemos recibido su documentación para la declaración IRNR. Procederemos con la revisión y le contactaremos en 48h con cualquier consulta.',
        timestamp: '2025-01-15T10:30:00.000Z',
        type: 'sent',
        status: 'read',
        aiGenerated: false
      },
      {
        id: 'msg-2',
        clientId: 'sample-1',
        message: 'Buenos días María, necesitamos el certificado de retenciones de la propiedad de Barcelona. ¿Podría enviárnoslo cuando tenga oportunidad?',
        timestamp: '2025-01-18T11:15:00.000Z',
        type: 'sent',
        status: 'delivered',
        aiGenerated: true,
        context: 'followup'
      }
    ],
    paidInCash: true
  },
  {
    id: 'sample-2',
    name: 'Carlos Martín López',
    emails: [
      { id: '1', value: 'carlos.martin@startup.es', label: 'Personal', isPrimary: true },
      { id: '2', value: 'ceo@techstart.es', label: 'CEO', isPrimary: false }
    ],
    phones: [
      { id: '1', value: '+34 638 264 142', label: 'Móvil', isPrimary: true }
    ],
    company: 'TechStart Innovations',
    category: 'Alta autónomo',
    status: 'pending',
    consultationType: 'Alta en régimen de autónomos + constitución SL',
    notes: 'Emprendedor joven que quiere darse de alta como autónomo y posteriormente constituir una SL. Actividad: desarrollo de software. Pendiente de enviar DNI y justificante de domicilio.',
    aiSuggestions: 'Enviar checklist de documentación requerida. Explicar ventajas fiscales del régimen de autónomos para startups tecnológicas.',
    driveLinks: [
      'https://drive.google.com/drive/folders/carlos-martin-autonomo'
    ],
    keyDates: {
      birthday: '1992-07-22',
      paymentDue: '2025-01-30',
      renewal: '',
      closing: '2025-02-28'
    },
    createdAt: '2025-01-18T16:45:00.000Z',
    updatedAt: '2025-01-18T16:45:00.000Z',
    priority: 'medium',
    source: 'web',
    whatsappHistory: [
      {
        id: 'msg-3',
        clientId: 'sample-2',
        message: 'Hola Carlos, gracias por contactarnos para el alta de autónomo. Para proceder necesitamos que nos envíe: DNI, justificante de domicilio y descripción detallada de la actividad.',
        timestamp: '2025-01-18T17:00:00.000Z',
        type: 'sent',
        status: 'sent',
        aiGenerated: true,
        context: 'general'
      }
    ],
    paidInCash: false
  },
  {
    id: 'sample-3',
    name: 'Ana López Martínez',
    emails: [
      { id: '1', value: 'ana.lopez@techsolutions.es', label: 'Empresa', isPrimary: true },
      { id: '2', value: 'ana.personal@gmail.com', label: 'Personal', isPrimary: false }
    ],
    phones: [
      { id: '1', value: '+34 687 654 321', label: 'Móvil', isPrimary: true }
    ],
    company: 'TechSolutions Barcelona',
    category: 'Constitución SL',
    status: 'paid',
    consultationType: 'Constitución de Sociedad Limitada + trámites registro mercantil',
    notes: 'Socia fundadora de startup tecnológica. Ya constituyó la SL y necesita ayuda con los trámites del registro mercantil y alta en Hacienda. Muy organizada con la documentación.',
    aiSuggestions: 'Cliente ejemplar en seguimiento. Proponer servicios de asesoría fiscal continuada.',
    driveLinks: [
      'https://drive.google.com/drive/folders/ana-lopez-sl-constitucion'
    ],
    keyDates: {
      birthday: '1988-11-03',
      paymentDue: '',
      renewal: '2026-01-15',
      closing: '2025-02-10'
    },
    createdAt: '2025-01-05T14:20:00.000Z',
    updatedAt: '2025-01-22T11:15:00.000Z',
    priority: 'low',
    source: 'referencia',
    whatsappHistory: [],
    paidInCash: true
  },
  {
    id: 'sample-4',
    name: 'Pedro Sánchez García',
    emails: [
      { id: '1', value: 'pedro.sanchez@hosteleria.com', label: 'Trabajo', isPrimary: true }
    ],
    phones: [
      { id: '1', value: '+34 600 123 456', label: 'Móvil', isPrimary: true },
      { id: '2', value: '+34 93 456 7890', label: 'Restaurante', isPrimary: false }
    ],
    company: 'Restaurante El Buen Comer',
    category: 'Laboral',
    status: 'in-progress',
    consultationType: 'Asesoría laboral - contratación de empleados y nóminas',
    notes: 'Dueño de restaurante familiar. Necesita ayuda con contratos laborales para 3 nuevos empleados y gestión de nóminas. Primera vez que contrata personal.',
    aiSuggestions: 'Explicar obligaciones como empleador. Proporcionar templates de contratos. Seguimiento mensual de nóminas.',
    driveLinks: [
      'https://drive.google.com/drive/folders/pedro-sanchez-laboral'
    ],
    keyDates: {
      birthday: '1975-06-18',
      paymentDue: '2025-02-05',
      renewal: '',
      closing: '2025-03-15'
    },
    createdAt: '2025-01-12T09:45:00.000Z',
    updatedAt: '2025-01-21T16:30:00.000Z',
    priority: 'high',
    source: 'llamada',
    whatsappHistory: [],
    paidInCash: false
  },
  {
    id: 'sample-5',
    name: 'Laura Fernández Ruiz',
    emails: [
      { id: '1', value: 'laura.fernandez@consulting.eu', label: 'Profesional', isPrimary: true }
    ],
    phones: [
      { id: '1', value: '+34 695 432 198', label: 'Móvil', isPrimary: true }
    ],
    company: 'Fernández Consulting',
    category: 'Fiscal',
    status: 'completed',
    consultationType: 'Planificación fiscal anual y optimización tributaria',
    notes: 'Consultora independiente con ingresos altos. Completamos su planificación fiscal para 2024. Cliente muy satisfecha, ha recomendado nuestros servicios a otros colegas.',
    aiSuggestions: 'Contactar para renovación anual. Pedir referencias de otros consultores que menciona.',
    driveLinks: [
      'https://drive.google.com/drive/folders/laura-fernandez-fiscal'
    ],
    keyDates: {
      birthday: '1982-09-25',
      paymentDue: '',
      renewal: '2026-01-01',
      closing: '2025-01-30'
    },
    createdAt: '2024-12-15T10:30:00.000Z',
    updatedAt: '2025-01-30T17:45:00.000Z',
    priority: 'medium',
    source: 'web',
    whatsappHistory: [],
    paidInCash: true
  }
];

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    category: '',
    dateRange: '',
    priority: '',
    paidInCash: false,
  });
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Load clients from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedClients = JSON.parse(stored);
      // Migrate old clients to include whatsappHistory
      const migratedClients = parsedClients.map((client: any) => ({
        ...client,
        whatsappHistory: client.whatsappHistory || [],
        paidInCash: client.paidInCash !== undefined ? client.paidInCash : false
      }));
      
      // Si no hay clientes o son muy pocos, agregar los de ejemplo
      if (migratedClients.length < 3) {
        const combinedClients = [...SAMPLE_CLIENTS, ...migratedClients];
        setClients(combinedClients);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(combinedClients));
      } else {
        setClients(migratedClients);
      }
    } else {
      // If no clients exist, add sample clients
      setClients(SAMPLE_CLIENTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_CLIENTS));
    }

    const storedMessages = localStorage.getItem(WHATSAPP_STORAGE_KEY);
    if (storedMessages) {
      setWhatsappMessages(JSON.parse(storedMessages));
    } else {
      // Add sample WhatsApp messages
      const sampleMessages = SAMPLE_CLIENTS.flatMap(client => client.whatsappHistory);
      setWhatsappMessages(sampleMessages);
      localStorage.setItem(WHATSAPP_STORAGE_KEY, JSON.stringify(sampleMessages));
    }
  }, []);

  // Save to localStorage whenever clients change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }, [clients]);

  // Save WhatsApp messages to localStorage
  useEffect(() => {
    localStorage.setItem(WHATSAPP_STORAGE_KEY, JSON.stringify(whatsappMessages));
  }, [whatsappMessages]);

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      whatsappHistory: [],
      paidInCash: false,
    };
    setClients(prev => [newClient, ...prev]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev =>
      prev.map(client =>
        client.id === id
          ? { ...client, ...updates, updatedAt: new Date().toISOString() }
          : client
      )
    );
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
  };

  const addWhatsAppMessage = (clientId: string, message: string, aiGenerated: boolean, context?: string) => {
    const newMessage: WhatsAppMessage = {
      id: crypto.randomUUID(),
      clientId,
      message,
      timestamp: new Date().toISOString(),
      type: 'sent',
      status: 'sent',
      aiGenerated,
      context,
    };
    
    setWhatsappMessages(prev => [...prev, newMessage]);
    
    // Also add to client's history
    setClients(prev =>
      prev.map(client =>
        client.id === clientId
          ? { ...client, whatsappHistory: [...client.whatsappHistory, newMessage] }
          : client
      )
    );
  };

  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients.filter(client => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !client.name.toLowerCase().includes(searchLower) &&
          !client.emails.some(email => email.value.toLowerCase().includes(searchLower)) &&
          !client.notes.toLowerCase().includes(searchLower) &&
          !client.company?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      if (filters.status && client.status !== filters.status) {
        return false;
      }

      if (filters.category && client.category !== filters.category) {
        return false;
      }

      if (filters.priority && client.priority !== filters.priority) {
        return false;
      }

      if (filters.paidInCash && !client.paidInCash) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'paymentDue':
          aValue = new Date(a.keyDates.paymentDue || '9999-12-31');
          bValue = new Date(b.keyDates.paymentDue || '9999-12-31');
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [clients, filters, sortField, sortDirection]);

  return {
    clients: filteredAndSortedClients,
    allClients: clients,
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
  };
};