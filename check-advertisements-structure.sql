-- Script para verificar estructura de tabla advertisements
-- Ejecutar primero para ver qué columnas existen

-- 1. Verificar estructura de la tabla advertisements
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'advertisements' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar estructura de la tabla advertisement_views
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'advertisement_views' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar si existen datos en advertisements
SELECT COUNT(*) as total_advertisements FROM advertisements;

-- 4. Verificar políticas RLS existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('advertisements', 'advertisement_views');

