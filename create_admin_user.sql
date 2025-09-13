-- Crear usuario administrador en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- Inserta el usuario administrador
INSERT INTO public.users (id, email, full_name, role)
VALUES (
  '5f32f4c9-659e-4f4a-be5d-dedadbb4f2f0',
  'test@test.com',
  'admin',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verificar que se creó correctamente
SELECT id, email, full_name, role, created_at
FROM public.users
WHERE id = '5f32f4c9-659e-4f4a-be5d-dedadbb4f2f0';