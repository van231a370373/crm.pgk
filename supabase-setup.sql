-- Configuración inicial de Supabase para CRM Polska
-- Ejecutar este script en el SQL Editor de Supabase

-- Activar la extensión UUID (si no está ya activada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (extendiendo auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE public.clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    emails JSONB DEFAULT '[]',
    phones JSONB DEFAULT '[]',
    company TEXT,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'paid', 'completed', 'cancelled')),
    consultation_type TEXT NOT NULL,
    notes TEXT DEFAULT '',
    ai_suggestions TEXT DEFAULT '',
    drive_links TEXT[] DEFAULT '{}',
    key_dates JSONB DEFAULT '{}',
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    source TEXT DEFAULT 'manual',
    paid_in_cash BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de tareas
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    client_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    assignee_id UUID REFERENCES auth.users(id),
    due_date DATE NOT NULL,
    due_time TIME,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    recurrence JSONB DEFAULT '{}',
    comments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    completed_at TIMESTAMPTZ
);

-- Tabla de categorías de servicio
CREATE TABLE public.service_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de mensajes WhatsApp
CREATE TABLE public.whatsapp_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    type TEXT NOT NULL DEFAULT 'sent' CHECK (type IN ('sent', 'received')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    ai_generated BOOLEAN DEFAULT FALSE,
    context TEXT
);

-- Índices para mejor rendimiento
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_created_at ON public.clients(created_at);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_whatsapp_client_id ON public.whatsapp_messages(client_id);

-- Triggers para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON public.users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para clients
CREATE POLICY "Los usuarios pueden ver sus propios clientes" ON public.clients
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden insertar sus propios clientes" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden actualizar sus propios clientes" ON public.clients
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden eliminar sus propios clientes" ON public.clients
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para tasks
CREATE POLICY "Los usuarios pueden ver sus propias tareas" ON public.tasks
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden insertar sus propias tareas" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden actualizar sus propias tareas" ON public.tasks
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden eliminar sus propias tareas" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para service_categories
CREATE POLICY "Los usuarios pueden ver sus propias categorías" ON public.service_categories
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden insertar sus propias categorías" ON public.service_categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden actualizar sus propias categorías" ON public.service_categories
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden eliminar sus propias categorías" ON public.service_categories
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para whatsapp_messages
CREATE POLICY "Los usuarios pueden ver sus propios mensajes" ON public.whatsapp_messages
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden insertar sus propios mensajes" ON public.whatsapp_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insertar categorías por defecto
INSERT INTO public.service_categories (user_id, name) VALUES 
('00000000-0000-0000-0000-000000000000', 'IRNR'),
('00000000-0000-0000-0000-000000000000', 'Constitución de Sociedad'),
('00000000-0000-0000-0000-000000000000', 'Declaración de la Renta'),
('00000000-0000-0000-0000-000000000000', 'IVA Trimestral'),
('00000000-0000-0000-0000-000000000000', 'Gestoría Laboral'),
('00000000-0000-0000-0000-000000000000', 'Consulta General');