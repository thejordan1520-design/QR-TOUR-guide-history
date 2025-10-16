-- Script para arreglar permisos de anuncios
-- Ejecutar en Supabase SQL Editor

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

-- 5. Verificar que existen anuncios de ejemplo
INSERT INTO advertisements (
  id,
  title_es,
  title_en,
  title_fr,
  content_es,
  content_en,
  content_fr,
  cta_text_es,
  cta_text_en,
  cta_text_fr,
  cta_url,
  image_url,
  type,
  status,
  priority,
  is_active,
  display_duration,
  target_url,
  link_url
) VALUES (
  gen_random_uuid(),
  'Descubre Puerto Plata',
  'Discover Puerto Plata',
  'Découvrez Puerto Plata',
  'Explora los lugares más emblemáticos de Puerto Plata con nuestra guía interactiva.',
  'Explore the most emblematic places of Puerto Plata with our interactive guide.',
  'Explorez les endroits les plus emblématiques de Puerto Plata avec notre guide interactif.',
  'Comenzar Tour',
  'Start Tour',
  'Commencer le Tour',
  '/tour',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'banner',
  'active',
  1,
  true,
  10,
  '/tour',
  '/tour'
) ON CONFLICT DO NOTHING;

-- 6. Insertar más anuncios de ejemplo
INSERT INTO advertisements (
  id,
  title_es,
  title_en,
  title_fr,
  content_es,
  content_en,
  content_fr,
  cta_text_es,
  cta_text_en,
  cta_text_fr,
  cta_url,
  image_url,
  type,
  status,
  priority,
  is_active,
  display_duration,
  target_url,
  link_url
) VALUES (
  gen_random_uuid(),
  'Guía de Audio Premium',
  'Premium Audio Guide',
  'Guide Audio Premium',
  'Disfruta de narraciones profesionales y contenido exclusivo.',
  'Enjoy professional narrations and exclusive content.',
  'Profitez de narrations professionnelles et de contenu exclusif.',
  'Actualizar',
  'Upgrade',
  'Mettre à niveau',
  '/premium',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
  'banner',
  'active',
  2,
  true,
  8,
  '/premium',
  '/premium'
) ON CONFLICT DO NOTHING;

-- 7. Verificar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('advertisements', 'advertisement_views');

-- 8. Verificar que hay anuncios activos
SELECT id, title_es, is_active, status FROM advertisements WHERE is_active = true;

