-- Script corregido para arreglar permisos de anuncios
-- Basado en la estructura real de la tabla advertisements

-- 1. Habilitar RLS en las tablas de anuncios
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisement_views ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes problemáticas
DROP POLICY IF EXISTS "Anuncios públicos" ON advertisements;
DROP POLICY IF EXISTS "Insertar visualizaciones" ON advertisement_views;
DROP POLICY IF EXISTS "Actualizar visualizaciones" ON advertisement_views;
DROP POLICY IF EXISTS "Anuncios públicos - lectura" ON advertisements;
DROP POLICY IF EXISTS "Visualizaciones públicas - inserción" ON advertisement_views;
DROP POLICY IF EXISTS "Visualizaciones públicas - actualización" ON advertisement_views;
DROP POLICY IF EXISTS "Public read advertisements" ON advertisements;
DROP POLICY IF EXISTS "Public insert advertisement_views" ON advertisement_views;
DROP POLICY IF EXISTS "Public update advertisement_views" ON advertisement_views;
DROP POLICY IF EXISTS "Public select advertisement_views" ON advertisement_views;

-- 3. Crear políticas simples y permisivas para anuncios
CREATE POLICY "Public read advertisements" ON advertisements
  FOR SELECT USING (is_active = true);

-- 4. Crear políticas permisivas para advertisement_views
CREATE POLICY "Public insert advertisement_views" ON advertisement_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update advertisement_views" ON advertisement_views
  FOR UPDATE USING (true);

CREATE POLICY "Public select advertisement_views" ON advertisement_views
  FOR SELECT USING (true);

-- 5. Verificar que existen anuncios de ejemplo (usando campos simples)
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
  'Descubre Puerto Plata',
  'Explora los lugares más emblemáticos de Puerto Plata con nuestra guía interactiva.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  '/tour',
  '/tour',
  'banner',
  'active',
  1,
  true,
  10
) ON CONFLICT DO NOTHING;

-- 6. Insertar más anuncios de ejemplo
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
  'Guía de Audio Premium',
  'Disfruta de narraciones profesionales y contenido exclusivo.',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
  '/premium',
  '/premium',
  'banner',
  'active',
  2,
  true,
  8
) ON CONFLICT DO NOTHING;

-- 7. Verificar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('advertisements', 'advertisement_views');

-- 8. Verificar que hay anuncios activos
SELECT id, title, is_active, status FROM advertisements WHERE is_active = true;

