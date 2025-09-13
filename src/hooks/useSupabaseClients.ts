import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './useAuth';
import { Client, FilterState, SortField, SortDirection, WhatsAppMessage } from '../types';
import { Database } from '../utils/supabase';

type SupabaseClient = Database['public']['Tables']['clients']['Row'];
type SupabaseWhatsAppMessage = Database['public']['Tables']['whatsapp_messages']['Row'];

const STORAGE_KEY = 'pgk-crm-migration-done';

export const useSupabaseClients = () => {
  const { user, profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
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

  // Convert Supabase client to our Client type
  const convertSupabaseClient = useCallback((dbClient: SupabaseClient): Client => {
    return {
      id: dbClient.id,
      name: dbClient.name,
      emails: dbClient.emails as Client['emails'] || [],
      phones: dbClient.phones as Client['phones'] || [],
      company: dbClient.company || undefined,
      category: dbClient.category,
      status: dbClient.status as Client['status'],
      consultationType: dbClient.consultation_type,
      notes: dbClient.notes || '',
      aiSuggestions: dbClient.ai_suggestions || '',
      driveLinks: dbClient.drive_links || [],
      keyDates: dbClient.key_dates as Client['keyDates'] || {},
      priority: dbClient.priority as Client['priority'],
      source: dbClient.source,
      paidInCash: dbClient.paid_in_cash,
      createdAt: dbClient.created_at,
      updatedAt: dbClient.updated_at,
      whatsappHistory: [], // Will be populated separately
    };
  }, []);

  // Convert our Client type to Supabase format
  const convertToSupabaseClient = useCallback((client: Partial<Client>) => {
    return {
      user_id: user?.id,
      name: client.name,
      emails: client.emails,
      phones: client.phones,
      company: client.company,
      category: client.category,
      status: client.status,
      consultation_type: client.consultationType,
      notes: client.notes,
      ai_suggestions: client.aiSuggestions,
      drive_links: client.driveLinks,
      key_dates: client.keyDates,
      priority: client.priority,
      source: client.source,
      paid_in_cash: client.paidInCash,
    };
  }, [user?.id]);

  // Load clients from Supabase
  const loadClients = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      // Load WhatsApp messages for all clients
      const { data: messagesData, error: messagesError } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (messagesError) throw messagesError;

      // Convert Supabase data to our format
      const convertedClients = clientsData.map(convertSupabaseClient);

      // Group WhatsApp messages by client
      const messagesMap = new Map<string, WhatsAppMessage[]>();
      messagesData.forEach((msg: SupabaseWhatsAppMessage) => {
        const message: WhatsAppMessage = {
          id: msg.id,
          clientId: msg.client_id,
          message: msg.message,
          timestamp: msg.timestamp,
          type: msg.type as WhatsAppMessage['type'],
          status: msg.status as WhatsAppMessage['status'],
          aiGenerated: msg.ai_generated,
          context: msg.context || undefined,
        };

        if (!messagesMap.has(msg.client_id)) {
          messagesMap.set(msg.client_id, []);
        }
        messagesMap.get(msg.client_id)!.push(message);
      });

      // Add WhatsApp history to clients
      const clientsWithMessages = convertedClients.map(client => ({
        ...client,
        whatsappHistory: messagesMap.get(client.id) || [],
      }));

      setClients(clientsWithMessages);
      setWhatsappMessages(messagesData.map((msg: SupabaseWhatsAppMessage) => ({
        id: msg.id,
        clientId: msg.client_id,
        message: msg.message,
        timestamp: msg.timestamp,
        type: msg.type as WhatsAppMessage['type'],
        status: msg.status as WhatsAppMessage['status'],
        aiGenerated: msg.ai_generated,
        context: msg.context || undefined,
      })));

    } catch (err) {
      console.error('Error loading clients:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [user, convertSupabaseClient]);

  // Migrate existing localStorage data to Supabase
  const migrateLocalStorageData = useCallback(async () => {
    if (!user) return;

    const migrationDone = localStorage.getItem(STORAGE_KEY);
    if (migrationDone) return;

    try {
      const storedClients = localStorage.getItem('pgk-crm-clients');
      if (!storedClients) return;

      const parsedClients = JSON.parse(storedClients);

      console.log('Migrating', parsedClients.length, 'clients from localStorage...');

      for (const client of parsedClients) {
        const supabaseClient = convertToSupabaseClient(client);

        const { data, error } = await supabase
          .from('clients')
          .insert(supabaseClient)
          .select()
          .single();

        if (error) {
          console.error('Error migrating client:', client.name, error);
          continue;
        }

        // Migrate WhatsApp messages
        if (client.whatsappHistory && client.whatsappHistory.length > 0) {
          const messagesToInsert = client.whatsappHistory.map((msg: WhatsAppMessage) => ({
            user_id: user.id,
            client_id: data.id,
            message: msg.message,
            timestamp: msg.timestamp,
            type: msg.type,
            status: msg.status,
            ai_generated: msg.aiGenerated,
            context: msg.context,
          }));

          const { error: msgError } = await supabase
            .from('whatsapp_messages')
            .insert(messagesToInsert);

          if (msgError) {
            console.error('Error migrating WhatsApp messages for client:', client.name, msgError);
          }
        }
      }

      // Mark migration as done
      localStorage.setItem(STORAGE_KEY, 'true');
      console.log('Migration completed successfully!');

      // Reload clients after migration
      await loadClients();

    } catch (err) {
      console.error('Error during migration:', err);
    }
  }, [user, convertToSupabaseClient, loadClients]);

  // Load data on mount and when user changes
  useEffect(() => {
    if (user) {
      loadClients();
      migrateLocalStorageData();
    } else {
      setClients([]);
      setWhatsappMessages([]);
      setLoading(false);
    }
  }, [user, loadClients, migrateLocalStorageData]);

  // Add client
  const addClient = useCallback(async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'whatsappHistory'>) => {
    if (!user) return;

    try {
      const supabaseClient = convertToSupabaseClient(clientData);

      const { data, error } = await supabase
        .from('clients')
        .insert(supabaseClient)
        .select()
        .single();

      if (error) throw error;

      const newClient: Client = {
        ...convertSupabaseClient(data),
        whatsappHistory: [],
      };

      setClients(prev => [newClient, ...prev]);
      return newClient;
    } catch (err) {
      console.error('Error adding client:', err);
      setError('Error al crear cliente');
    }
  }, [user, convertToSupabaseClient, convertSupabaseClient]);

  // Update client
  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    if (!user) return;

    try {
      const supabaseUpdates = convertToSupabaseClient(updates);

      const { data, error } = await supabase
        .from('clients')
        .update({ ...supabaseUpdates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setClients(prev =>
        prev.map(client =>
          client.id === id
            ? { ...client, ...updates, updatedAt: data.updated_at }
            : client
        )
      );
    } catch (err) {
      console.error('Error updating client:', err);
      setError('Error al actualizar cliente');
    }
  }, [user, convertToSupabaseClient]);

  // Delete client
  const deleteClient = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setClients(prev => prev.filter(client => client.id !== id));
      setWhatsappMessages(prev => prev.filter(msg => msg.clientId !== id));
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Error al eliminar cliente');
    }
  }, [user]);

  // Add WhatsApp message
  const addWhatsAppMessage = useCallback(async (
    clientId: string,
    message: string,
    aiGenerated: boolean,
    context?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .insert({
          user_id: user.id,
          client_id: clientId,
          message,
          timestamp: new Date().toISOString(),
          type: 'sent',
          status: 'sent',
          ai_generated: aiGenerated,
          context,
        })
        .select()
        .single();

      if (error) throw error;

      const newMessage: WhatsAppMessage = {
        id: data.id,
        clientId: data.client_id,
        message: data.message,
        timestamp: data.timestamp,
        type: data.type as WhatsAppMessage['type'],
        status: data.status as WhatsAppMessage['status'],
        aiGenerated: data.ai_generated,
        context: data.context || undefined,
      };

      setWhatsappMessages(prev => [...prev, newMessage]);

      // Update client's WhatsApp history
      setClients(prev =>
        prev.map(client =>
          client.id === clientId
            ? { ...client, whatsappHistory: [...client.whatsappHistory, newMessage] }
            : client
        )
      );

      return newMessage;
    } catch (err) {
      console.error('Error adding WhatsApp message:', err);
      setError('Error al enviar mensaje');
    }
  }, [user]);

  // Filtered and sorted clients
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
    loading,
    error,
  };
};