-- Script final corregido para advertisements basado en estructura real
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura real de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'advertisements' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'advertisements'
ORDER BY policyname;

-- 3. Verificar anuncios existentes
SELECT 
  id, 
  title, 
  description, 
  is_active, 
  priority, 
  display_duration,
  created_at,
  updated_at
FROM advertisements 
ORDER BY priority DESC, created_at DESC;

-- 4. Probar todas las operaciones CRUD con estructura correcta

-- INSERT: Crear nuevo anuncio
INSERT INTO advertisements (
  id,
  title,
  description,
  image_url,
  target_url,
  link_url,
  display_duration,
  is_active,
  priority,
  expires_at
) VALUES (
  gen_random_uuid(),
  'Anuncio CRUD Test - INSERT',
  'Anuncio creado para probar operación INSERT',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  '/test-insert',
  '/test-insert',
  10,
  true,
  80,
  NULL
);

-- SELECT: Verificar inserción
SELECT 
  id, 
  title, 
  description, 
  is_active, 
  priority, 
  display_duration,
  created_at
FROM advertisements 
WHERE title LIKE '%INSERT%';

-- UPDATE: Actualizar anuncio
UPDATE advertisements 
SET 
  title = 'Anuncio CRUD Test - UPDATED',
  description = 'Anuncio actualizado para probar operación UPDATE',
  priority = 85,
  display_duration = 15,
  updated_at = NOW()
WHERE title LIKE '%INSERT%';

-- SELECT: Verificar actualización
SELECT 
  id, 
  title, 
  description, 
  is_active, 
  priority, 
  display_duration,
  updated_at
FROM advertisements 
WHERE title LIKE '%UPDATED%';

-- UPDATE: Cambiar estado (toggle)
UPDATE advertisements 
SET 
  is_active = false,
  updated_at = NOW()
WHERE title LIKE '%UPDATED%';

-- SELECT: Verificar cambio de estado
SELECT 
  id, 
  title, 
  is_active, 
  updated_at
FROM advertisements 
WHERE title LIKE '%UPDATED%';

-- DELETE: Eliminar anuncio
DELETE FROM advertisements 
WHERE title LIKE '%UPDATED%';

-- SELECT: Verificar eliminación
SELECT COUNT(*) as total_ads
FROM advertisements 
WHERE title LIKE '%UPDATED%';

-- 5. Verificar anuncios activos para frontend público
SELECT 
  id, 
  title, 
  description, 
  image_url,
  target_url,
  link_url,
  priority,
  display_duration,
  created_at
FROM advertisements 
WHERE is_active = true
ORDER BY priority ASC, created_at DESC;

-- 6. Verificar estadísticas de advertisement_views
SELECT 
  COUNT(*) as total_views,
  COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as total_clicks,
  AVG(duration_viewed) as avg_duration
FROM advertisement_views;

-- 7. Verificar políticas RLS finales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('advertisements', 'advertisement_views')
ORDER BY tablename, policyname;

