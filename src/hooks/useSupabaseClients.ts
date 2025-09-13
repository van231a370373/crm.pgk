import { useState, useEffect } from 'react';
import { Client, FilterState, SortField, SortDirection, WhatsAppMessage } from '../types';

const STORAGE_KEY = 'pgk-crm-clients';
const WHATSAPP_STORAGE_KEY = 'pgk-crm-whatsapp-messages';
const API_URL = 'https://www.pgkhiszpanii.com/reservas/api/reservas.php';

// Sample clients for demonstration (mantener como respaldo)
const SAMPLE_CLIENTS: Client[] = [
  {
    id: 'sample-1',
    name: 'María González Rodríguez',
    emails: [
      { id: '1', value: 'maria.gonzalez@email.com', label: 'Personal', isPrimary: true },
    ],
    phones: [
      { id: '1', value: '+34 644 10 62 22', label: 'Móvil', isPrimary: true },
    ],
    company: 'Consultora MG S.L.',
    category: 'IRNR',
    status: 'in-progress',
    consultationType: 'Declaración IRNR 2024',
    notes: 'Cliente de ejemplo',
    aiSuggestions: '',
    driveLinks: [],
    keyDates: {
      birthday: '1985-03-15',
      paymentDue: '2025-02-15',
      renewal: '2026-01-15',
      closing: '2025-03-30'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    priority: 'high',
    source: 'referencia',
    whatsappHistory: [],
    paidInCash: true
  }
];

export const useSupabaseClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Cargar clientes al iniciar
  useEffect(() => {
    loadClients();
  }, []);

  // Función para cargar clientes (API + localStorage)
  const loadClients = async () => {
    console.log('📊 Cargando clientes...');
    setLoading(true);
    setError(null);

    try {
      // Intentar cargar desde la API
      const response = await fetch(`${API_URL}?action=clients`);
      const data = await response.json();

      if (data.success && data.clients) {
        console.log(`✅ ${data.clients.length} clientes cargados desde la API`);
        setClients(data.clients);
        setIsOnlineMode(true);
        setLastSyncTime(new Date().toISOString());

        // Guardar en localStorage como respaldo
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.clients));
        setLoading(false);
        return;
      }
    } catch (error) {
      console.log('🔌 API no disponible, usando localStorage:', error);
    }

    // Si la API no funciona, usar localStorage
    const storedClients = localStorage.getItem(STORAGE_KEY);
    if (storedClients) {
      const parsedClients = JSON.parse(storedClients);
      setClients(parsedClients);
      setIsOnlineMode(false);
      console.log(`💾 ${parsedClients.length} clientes cargados desde localStorage`);
    } else {
      // Si no hay nada, usar clientes de ejemplo
      setClients(SAMPLE_CLIENTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_CLIENTS));
      setIsOnlineMode(false);
      console.log('📝 Usando clientes de ejemplo');
    }
    setLoading(false);
  };

  // Función para guardar un cliente
  const saveClient = async (client: Client) => {
    try {
      if (isOnlineMode) {
        const response = await fetch(`${API_URL}?action=save-client`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(client)
        });
        
        const result = await response.json();
        if (result.success) {
          console.log('✅ Cliente guardado en la base de datos');
        } else {
          throw new Error(result.error || 'Error al guardar en API');
        }
      }
    } catch (error) {
      console.log('⚠️ Error en API, guardando solo en localStorage:', error);
    }

    // Siempre guardar en localStorage como respaldo
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  };

  // Función para sincronizar todos los clientes con la API
  const syncClients = async () => {
    if (!isOnlineMode) return false;

    try {
      const response = await fetch(`${API_URL}?action=sync-clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients })
      });
      
      const result = await response.json();
      if (result.success) {
        setLastSyncTime(new Date().toISOString());
        console.log('🔄 Clientes sincronizados con éxito');
        return true;
      }
    } catch (error) {
      console.log('❌ Error al sincronizar:', error);
    }
    return false;
  };

  // Agregar cliente (con persistencia automática)
  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      whatsappHistory: [],
      paidInCash: false,
    };
    
    const updatedClients = [newClient, ...clients];
    setClients(updatedClients);
    
    // Guardar automáticamente
    await saveClient(newClient);
    return newClient;
  };

  // Actualizar cliente
  const updateClient = async (id: string, updates: Partial<Client>) => {
    const updatedClients = clients.map(client =>
      client.id === id
        ? { ...client, ...updates, updatedAt: new Date().toISOString() }
        : client
    );
    
    setClients(updatedClients);
    
    // Guardar automáticamente
    const updatedClient = updatedClients.find(c => c.id === id);
    if (updatedClient) {
      await saveClient(updatedClient);
    }
  };

  // Eliminar cliente
  const deleteClient = (id: string) => {
    const updatedClients = clients.filter(client => client.id !== id);
    setClients(updatedClients);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClients));
    
    // TODO: Agregar eliminación en API si es necesario
  };

  // Agregar mensaje de WhatsApp
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
    
    // Agregar al historial del cliente
    updateClient(clientId, {
      whatsappHistory: [...(clients.find(c => c.id === clientId)?.whatsappHistory || []), newMessage]
    });
    
    return newMessage;
  };

  // Filtrar y ordenar clientes
  const filteredAndSortedClients = clients.filter(client => {
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

    if (filters.status && client.status !== filters.status) return false;
    if (filters.category && client.category !== filters.category) return false;
    if (filters.priority && client.priority !== filters.priority) return false;
    if (filters.paidInCash && !client.paidInCash) return false;

    return true;
  }).sort((a, b) => {
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
    // Funciones específicas de sincronización
    isOnlineMode,
    lastSyncTime,
    syncClients,
    loadClients,
    saveClient,
    loading,
    error,
  };
};