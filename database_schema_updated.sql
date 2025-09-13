-- Schema actualizado para CRM Polska Grupa Konsultingowa
-- Este script maneja tablas que ya pueden existir en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- Crear tabla de usuarios (si no existe)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de clientes (si no existe)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    emails JSONB DEFAULT '[]'::jsonb,
    phones JSONB DEFAULT '[]'::jsonb,
    company TEXT,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'paid', 'completed', 'cancelled')),
    consultation_type TEXT NOT NULL,
    notes TEXT DEFAULT '',
    ai_suggestions TEXT DEFAULT '',
    drive_links TEXT[] DEFAULT '{}',
    key_dates JSONB DEFAULT '{}'::jsonb,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    source TEXT DEFAULT '',
    paid_in_cash BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de tareas (si no existe)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    assignee_id UUID REFERENCES public.users(id),
    due_date DATE NOT NULL,
    due_time TIME NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    recurrence JSONB,
    comments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Crear tabla de categorías de servicio (si no existe)
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de mensajes de WhatsApp (si no existe)
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type TEXT NOT NULL CHECK (type IN ('sent', 'received')),
    status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    ai_generated BOOLEAN DEFAULT FALSE,
    context TEXT
);

-- Habilitar RLS en todas las tablas (si no está habilitado)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de Row Level Security (crear solo si no existen)

-- Políticas para users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON public.users
            FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can view all users') THEN
        CREATE POLICY "Admin can view all users" ON public.users
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.users
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Políticas para clients
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own clients') THEN
        CREATE POLICY "Users can view own clients" ON public.clients
            FOR SELECT USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own clients') THEN
        CREATE POLICY "Users can manage own clients" ON public.clients
            FOR ALL USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can view all clients') THEN
        CREATE POLICY "Admin can view all clients" ON public.clients
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.users
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Políticas para tasks
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own tasks and assigned tasks') THEN
        CREATE POLICY "Users can view own tasks and assigned tasks" ON public.tasks
            FOR SELECT USING (
                user_id = auth.uid() OR
                assignee_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.users
                    WHERE id = auth.uid() AND role IN ('admin', 'manager')
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own tasks and assigned tasks') THEN
        CREATE POLICY "Users can manage own tasks and assigned tasks" ON public.tasks
            FOR ALL USING (
                user_id = auth.uid() OR
                assignee_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.users
                    WHERE id = auth.uid() AND role IN ('admin', 'manager')
                )
            );
    END IF;
END $$;

-- Políticas para service_categories
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own categories') THEN
        CREATE POLICY "Users can view own categories" ON public.service_categories
            FOR SELECT USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own categories') THEN
        CREATE POLICY "Users can manage own categories" ON public.service_categories
            FOR ALL USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can view all categories') THEN
        CREATE POLICY "Admin can view all categories" ON public.service_categories
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.users
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Políticas para whatsapp_messages
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own WhatsApp messages') THEN
        CREATE POLICY "Users can view own WhatsApp messages" ON public.whatsapp_messages
            FOR SELECT USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own WhatsApp messages') THEN
        CREATE POLICY "Users can manage own WhatsApp messages" ON public.whatsapp_messages
            FOR ALL USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can view all WhatsApp messages') THEN
        CREATE POLICY "Admin can view all WhatsApp messages" ON public.whatsapp_messages
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.users
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Crear índices (si no existen)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_clients_user_id') THEN
        CREATE INDEX idx_clients_user_id ON public.clients(user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_clients_status') THEN
        CREATE INDEX idx_clients_status ON public.clients(status);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_clients_category') THEN
        CREATE INDEX idx_clients_category ON public.clients(category);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_clients_priority') THEN
        CREATE INDEX idx_clients_priority ON public.clients(priority);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_clients_created_at') THEN
        CREATE INDEX idx_clients_created_at ON public.clients(created_at);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_user_id') THEN
        CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_client_id') THEN
        CREATE INDEX idx_tasks_client_id ON public.tasks(client_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_assignee_id') THEN
        CREATE INDEX idx_tasks_assignee_id ON public.tasks(assignee_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_status') THEN
        CREATE INDEX idx_tasks_status ON public.tasks(status);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_due_date') THEN
        CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_priority') THEN
        CREATE INDEX idx_tasks_priority ON public.tasks(priority);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_service_categories_user_id') THEN
        CREATE INDEX idx_service_categories_user_id ON public.service_categories(user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_whatsapp_messages_user_id') THEN
        CREATE INDEX idx_whatsapp_messages_user_id ON public.whatsapp_messages(user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_whatsapp_messages_client_id') THEN
        CREATE INDEX idx_whatsapp_messages_client_id ON public.whatsapp_messages(client_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_whatsapp_messages_timestamp') THEN
        CREATE INDEX idx_whatsapp_messages_timestamp ON public.whatsapp_messages(timestamp);
    END IF;
END $$;

-- Función para actualizar updated_at (si no existe)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at (crear si no existen)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_users') THEN
        CREATE TRIGGER handle_updated_at_users
            BEFORE UPDATE ON public.users
            FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_clients') THEN
        CREATE TRIGGER handle_updated_at_clients
            BEFORE UPDATE ON public.clients
            FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_tasks') THEN
        CREATE TRIGGER handle_updated_at_tasks
            BEFORE UPDATE ON public.tasks
            FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
    END IF;
END $$;