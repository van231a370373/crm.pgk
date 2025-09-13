import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create client only if environment variables are available
let supabase: any = null

// Mock session state for offline mode
let mockSession: any = null;
let authListeners: any[] = [];

if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://tu-proyecto.supabase.co') {
  supabase = createClient(supabaseUrl, supabaseKey)
} else {
  console.warn('Supabase no está configurado. La aplicación funcionará en modo offline.')
  // Create a mock client for development
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: mockSession }, error: null }),
      onAuthStateChange: (callback: any) => {
        authListeners.push(callback);
        return { data: { subscription: { unsubscribe: () => {
          const index = authListeners.indexOf(callback);
          if (index > -1) authListeners.splice(index, 1);
        } } } };
      },
      getUser: () => Promise.resolve({ data: { user: mockSession?.user || null }, error: null }),
      signInWithPassword: (credentials: { email: string; password: string }) => {
        // Credenciales temporales para desarrollo
        if (credentials.email === 'test@test.com' && credentials.password === 'Kocham645') {
          const mockUser = {
            id: '5f32f4c9-659e-4f4a-be5d-dedadbb4f2f0',
            email: 'test@test.com',
            user_metadata: { full_name: 'Administrador' }
          };
          mockSession = { user: mockUser, access_token: 'mock-token' };
          
          // Notify listeners
          setTimeout(() => {
            authListeners.forEach(callback => callback('SIGNED_IN', mockSession));
          }, 100);
          
          return Promise.resolve({ 
            data: { user: mockUser, session: mockSession }, 
            error: null 
          });
        }
        return Promise.resolve({ data: null, error: { message: 'Credenciales incorrectas' } });
      },
      signUp: () => Promise.resolve({ data: null, error: { message: 'Registro no disponible en modo offline' } }),
      signOut: () => {
        mockSession = null;
        setTimeout(() => {
          authListeners.forEach(callback => callback('SIGNED_OUT', null));
        }, 100);
        return Promise.resolve({ error: null });
      },
      resetPasswordForEmail: () => Promise.resolve({ error: { message: 'Supabase no configurado' } }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: (field: string, value: string) => ({
          single: () => {
            if (table === 'users' && field === 'id' && value === '5f32f4c9-659e-4f4a-be5d-dedadbb4f2f0') {
              return Promise.resolve({ 
                data: {
                  id: '5f32f4c9-659e-4f4a-be5d-dedadbb4f2f0',
                  email: 'test@test.com',
                  full_name: 'Administrador',
                  role: 'admin',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }, 
                error: null 
              });
            }
            return Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } });
          },
          order: () => Promise.resolve({ data: [], error: null })
        }),
        order: () => Promise.resolve({ data: [], error: null })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } })
        })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: { message: 'Supabase no configurado' } })
      })
    })
  }
}

export { supabase }

// Tipos de base de datos
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'manager' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role?: 'admin' | 'manager' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'manager' | 'user'
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          emails: any
          phones: any
          company: string | null
          category: string
          status: 'pending' | 'in-progress' | 'paid' | 'completed' | 'cancelled'
          consultation_type: string
          notes: string
          ai_suggestions: string
          drive_links: string[]
          key_dates: any
          priority: 'low' | 'medium' | 'high'
          source: string
          paid_in_cash: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          emails?: any
          phones?: any
          company?: string | null
          category: string
          status?: 'pending' | 'in-progress' | 'paid' | 'completed' | 'cancelled'
          consultation_type: string
          notes?: string
          ai_suggestions?: string
          drive_links?: string[]
          key_dates?: any
          priority?: 'low' | 'medium' | 'high'
          source?: string
          paid_in_cash?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          emails?: any
          phones?: any
          company?: string | null
          category?: string
          status?: 'pending' | 'in-progress' | 'paid' | 'completed' | 'cancelled'
          consultation_type?: string
          notes?: string
          ai_suggestions?: string
          drive_links?: string[]
          key_dates?: any
          priority?: 'low' | 'medium' | 'high'
          source?: string
          paid_in_cash?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          client_id: string
          client_name: string
          title: string
          description: string
          assignee_id: string
          due_date: string
          due_time: string
          status: 'pending' | 'in-progress' | 'completed'
          priority: 'low' | 'medium' | 'high'
          recurrence: any
          comments: any[]
          created_at: string
          updated_at: string
          created_by: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          client_name: string
          title: string
          description: string
          assignee_id: string
          due_date: string
          due_time: string
          status?: 'pending' | 'in-progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          recurrence?: any
          comments?: any[]
          created_at?: string
          updated_at?: string
          created_by: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          client_name?: string
          title?: string
          description?: string
          assignee_id?: string
          due_date?: string
          due_time?: string
          status?: 'pending' | 'in-progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          recurrence?: any
          comments?: any[]
          created_at?: string
          updated_at?: string
          created_by?: string
          completed_at?: string | null
        }
      }
      service_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
      }
      whatsapp_messages: {
        Row: {
          id: string
          user_id: string
          client_id: string
          message: string
          timestamp: string
          type: 'sent' | 'received'
          status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
          ai_generated: boolean
          context: string | null
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          message: string
          timestamp?: string
          type?: 'sent' | 'received'
          status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
          ai_generated?: boolean
          context?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          message?: string
          timestamp?: string
          type?: 'sent' | 'received'
          status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
          ai_generated?: boolean
          context?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}