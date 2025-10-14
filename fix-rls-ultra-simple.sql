-- SCRIPT SQL ULTRA SIMPLE - Solo políticas RLS esenciales
-- Ejecutar en Supabase SQL Editor

-- 1. HABILITAR RLS EN TABLAS CRÍTICAS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Users public read" ON public.users;
DROP POLICY IF EXISTS "Users authenticated upsert" ON public.users;
DROP POLICY IF EXISTS "Users authenticated update" ON public.users;
DROP POLICY IF EXISTS "Users admin full access" ON public.users;
DROP POLICY IF EXISTS "Subscriptions authenticated insert" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Subscriptions authenticated read" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Subscriptions admin full access" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Transactions authenticated insert" ON public.transactions;
DROP POLICY IF EXISTS "Transactions authenticated read" ON public.transactions;
DROP POLICY IF EXISTS "Transactions admin full access" ON public.transactions;
DROP POLICY IF EXISTS "Destinations public read" ON public.destinations;
DROP POLICY IF EXISTS "Destinations admin full access" ON public.destinations;

-- 3. CREAR POLÍTICAS PERMISIVAS SIMPLES
-- Tabla users - Permitir todo para usuarios autenticados
CREATE POLICY "Users allow all authenticated" ON public.users
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Tabla user_subscriptions - Permitir todo para usuarios autenticados
CREATE POLICY "Subscriptions allow all authenticated" ON public.user_subscriptions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Tabla transactions - Permitir todo para usuarios autenticados
CREATE POLICY "Transactions allow all authenticated" ON public.transactions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Tabla destinations - Permitir lectura pública
CREATE POLICY "Destinations allow public read" ON public.destinations
  FOR SELECT USING (true);

-- 4. VERIFICAR QUE LAS POLÍTICAS SE CREARON
SELECT 
  tablename, 
  policyname, 
  cmd
FROM pg_policies 
WHERE tablename IN ('users', 'user_subscriptions', 'transactions', 'destinations')
ORDER BY tablename, policyname;

-- 5. INSERTAR USUARIO DE PRUEBA SI NO EXISTE
INSERT INTO public.users (
  email, 
  plan_type, 
  is_active, 
  created_at, 
  updated_at
) VALUES (
  'thejordan1520@gmail.com',
  'free',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 6. VERIFICAR CONEXIÓN
SELECT 
  COUNT(*) as user_count,
  'Usuarios en tabla' as description
FROM public.users
UNION ALL
SELECT 
  COUNT(*) as dest_count,
  'Destinos en tabla' as description
FROM public.destinations;

-- 7. MENSAJE FINAL
SELECT 'RLS SIMPLE CONFIGURADO - POLÍTICAS PERMISIVAS' as status;
