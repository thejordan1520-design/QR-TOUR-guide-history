-- Script de prueba completo para verificar operaciones CRUD de anuncios
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura de la tabla advertisements
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

-- 4. Probar inserción de nuevo anuncio
INSERT INTO advertisements (
  id,
  title,
  description,
  image_url,
  link_url,
  target_url,
  type,
  status,
  priority,
  is_active,
  display_duration
) VALUES (
  gen_random_uuid(),
  'Anuncio de Prueba CRUD',
  'Este anuncio fue creado para probar las operaciones CRUD del panel admin',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  '/test-crud',
  '/test-crud',
  'banner',
  'active',
  50,
  true,
  15
);

-- 5. Verificar que se insertó correctamente
SELECT 
  id, 
  title, 
  description, 
  is_active, 
  priority, 
  display_duration,
  created_at
FROM advertisements 
WHERE title = 'Anuncio de Prueba CRUD';

-- 6. Probar actualización del anuncio
UPDATE advertisements 
SET 
  title = 'Anuncio de Prueba CRUD - ACTUALIZADO',
  description = 'Este anuncio fue actualizado para probar la operación UPDATE',
  priority = 75,
  display_duration = 20,
  updated_at = NOW()
WHERE title = 'Anuncio de Prueba CRUD';

-- 7. Verificar la actualización
SELECT 
  id, 
  title, 
  description, 
  is_active, 
  priority, 
  display_duration,
  updated_at
FROM advertisements 
WHERE title LIKE '%ACTUALIZADO%';

-- 8. Probar cambio de estado (toggle)
UPDATE advertisements 
SET 
  is_active = false,
  updated_at = NOW()
WHERE title LIKE '%ACTUALIZADO%';

-- 9. Verificar cambio de estado
SELECT 
  id, 
  title, 
  is_active, 
  updated_at
FROM advertisements 
WHERE title LIKE '%ACTUALIZADO%';

-- 10. Probar eliminación
DELETE FROM advertisements 
WHERE title LIKE '%ACTUALIZADO%';

-- 11. Verificar que se eliminó
SELECT COUNT(*) as total_ads
FROM advertisements 
WHERE title LIKE '%ACTUALIZADO%';

-- 12. Verificar anuncios activos para el frontend público
SELECT 
  id, 
  title, 
  description, 
  image_url,
  link_url,
  target_url,
  priority,
  display_duration
FROM advertisements 
WHERE is_active = true
ORDER BY priority ASC, created_at DESC;

-- 13. Verificar estadísticas de advertisement_views
SELECT 
  COUNT(*) as total_views,
  COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as total_clicks,
  AVG(duration_viewed) as avg_duration
FROM advertisement_views;

