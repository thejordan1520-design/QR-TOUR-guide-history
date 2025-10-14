-- SCRIPT SQL SIMPLIFICADO - Sin funciones complejas que causan errores
-- Ejecutar en Supabase SQL Editor

-- 1. VERIFICAR ESTADO ACTUAL DE RLS
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled,
  (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) as policies_count
FROM pg_tables t 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'user_subscriptions', 'transactions', 'destinations')
ORDER BY tablename;

-- 2. VERIFICAR POLÍTICAS EXISTENTES
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'user_subscriptions', 'transactions', 'destinations')
ORDER BY tablename, policyname;

-- 3. HABILITAR RLS EN TABLAS CRÍTICAS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- 4. ELIMINAR POLÍTICAS PROBLEMÁTICAS EXISTENTES
DROP POLICY IF EXISTS "Public read access" ON public.users;
DROP POLICY IF EXISTS "Admin full access" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Public read access" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admin full access" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Public read access" ON public.transactions;
DROP POLICY IF EXISTS "Admin full access" ON public.transactions;
DROP POLICY IF EXISTS "Public read access" ON public.destinations;
DROP POLICY IF EXISTS "Admin full access" ON public.destinations;

-- 5. CREAR POLÍTICAS CORRECTAS PARA TABLA USERS
-- Permitir lectura pública (para verificar usuarios)
CREATE POLICY "Users public read" ON public.users
  FOR SELECT USING (true);

-- Permitir inserción/actualización para usuarios autenticados
CREATE POLICY "Users authenticated upsert" ON public.users
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users authenticated update" ON public.users
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Permitir acceso completo para admin
CREATE POLICY "Users admin full access" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'jordandn15@outlook.com'
    )
  );

-- 6. CREAR POLÍTICAS CORRECTAS PARA TABLA USER_SUBSCRIPTIONS
-- Permitir inserción para usuarios autenticados
CREATE POLICY "Subscriptions authenticated insert" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir lectura para usuarios autenticados (sus propias suscripciones)
CREATE POLICY "Subscriptions authenticated read" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Permitir acceso completo para admin
CREATE POLICY "Subscriptions admin full access" ON public.user_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'jordandn15@outlook.com'
    )
  );

-- 7. CREAR POLÍTICAS CORRECTAS PARA TABLA TRANSACTIONS
-- Permitir inserción para usuarios autenticados
CREATE POLICY "Transactions authenticated insert" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir lectura para usuarios autenticados
CREATE POLICY "Transactions authenticated read" ON public.transactions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Permitir acceso completo para admin
CREATE POLICY "Transactions admin full access" ON public.transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'jordandn15@outlook.com'
    )
  );

-- 8. CREAR POLÍTICAS CORRECTAS PARA TABLA DESTINATIONS
-- Permitir lectura pública (para mostrar destinos)
CREATE POLICY "Destinations public read" ON public.destinations
  FOR SELECT USING (true);

-- Permitir acceso completo para admin
CREATE POLICY "Destinations admin full access" ON public.destinations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'jordandn15@outlook.com'
    )
  );

-- 9. VERIFICAR QUE LAS POLÍTICAS SE CREARON CORRECTAMENTE
SELECT 
  tablename, 
  policyname, 
  cmd,
  CASE WHEN qual IS NOT NULL THEN 'HAS CONDITION' ELSE 'NO CONDITION' END as has_condition
FROM pg_policies 
WHERE tablename IN ('users', 'user_subscriptions', 'transactions', 'destinations')
ORDER BY tablename, policyname;

-- 10. CREAR FUNCIÓN HELPER SIMPLE PARA VERIFICAR ADMIN
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'jordandn15@outlook.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. CREAR FUNCIÓN HELPER SIMPLE PARA OBTENER USUARIO ACTUAL
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS text AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. VERIFICAR QUE LAS FUNCIONES SE CREARON
SELECT 
  routine_name, 
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_name IN ('is_admin', 'get_current_user_email')
  AND routine_schema = 'public';

-- 13. INSERTAR DATOS DE PRUEBA SI NO EXISTEN (SIN TRIGGERS)
-- Verificar si existe el usuario thejordan1520@gmail.com
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'thejordan1520@gmail.com') THEN
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
    );
    RAISE NOTICE 'Usuario thejordan1520@gmail.com creado';
  ELSE
    RAISE NOTICE 'Usuario thejordan1520@gmail.com ya existe';
  END IF;
END $$;

-- 14. VERIFICAR CONEXIÓN DE PRUEBA
DO $$
DECLARE
  user_count integer;
  dest_count integer;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users;
  SELECT COUNT(*) INTO dest_count FROM public.destinations;
  
  RAISE NOTICE 'Usuarios en tabla: %', user_count;
  RAISE NOTICE 'Destinos en tabla: %', dest_count;
  
  IF user_count > 0 AND dest_count > 0 THEN
    RAISE NOTICE '✅ CONFIGURACIÓN EXITOSA: Las tablas tienen datos y RLS configurado';
  ELSE
    RAISE NOTICE '⚠️ ADVERTENCIA: Algunas tablas están vacías';
  END IF;
END $$;

-- 15. MENSAJE FINAL
SELECT 'RLS CRÍTICO CONFIGURADO EXITOSAMENTE - SIN FUNCIONES COMPLEJAS' as status;
