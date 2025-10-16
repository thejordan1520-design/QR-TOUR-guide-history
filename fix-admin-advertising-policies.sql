-- Script para verificar y corregir políticas RLS de advertisements para admin
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'advertisements';

-- 2. Eliminar políticas existentes para recrearlas correctamente
DROP POLICY IF EXISTS "Public read advertisements" ON advertisements;
DROP POLICY IF EXISTS "Admin full access advertisements" ON advertisements;
DROP POLICY IF EXISTS "Admin insert advertisements" ON advertisements;
DROP POLICY IF EXISTS "Admin update advertisements" ON advertisements;
DROP POLICY IF EXISTS "Admin delete advertisements" ON advertisements;

-- 3. Crear políticas específicas para admin y público
-- Política para lectura pública (solo anuncios activos)
CREATE POLICY "Public read active advertisements" ON advertisements
  FOR SELECT USING (is_active = true);

-- Política para administradores (acceso completo)
CREATE POLICY "Admin full access advertisements" ON advertisements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid 
      AND auth.users.email = 'jordandn15@outlook.com'
    )
  );

-- 4. Verificar que la tabla advertisement_views también tenga políticas correctas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'advertisement_views';

-- 5. Crear políticas para advertisement_views si no existen
DROP POLICY IF EXISTS "Public insert advertisement_views" ON advertisement_views;
DROP POLICY IF EXISTS "Public update advertisement_views" ON advertisement_views;
DROP POLICY IF EXISTS "Public select advertisement_views" ON advertisement_views;
DROP POLICY IF EXISTS "Admin full access advertisement_views" ON advertisement_views;

CREATE POLICY "Public insert advertisement_views" ON advertisement_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update advertisement_views" ON advertisement_views
  FOR UPDATE USING (true);

CREATE POLICY "Public select advertisement_views" ON advertisement_views
  FOR SELECT USING (true);

CREATE POLICY "Admin full access advertisement_views" ON advertisement_views
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid 
      AND auth.users.email = 'jordandn15@outlook.com'
    )
  );

-- 6. Verificar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('advertisements', 'advertisement_views')
ORDER BY tablename, policyname;

-- 7. Probar inserción como admin (esto debería funcionar)
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
  'Test Admin Ad',
  'Anuncio de prueba creado desde admin',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  '/test',
  '/test',
  'banner',
  'active',
  99,
  true,
  5
) ON CONFLICT DO NOTHING;

-- 8. Verificar que el anuncio se insertó
SELECT id, title, is_active, created_at FROM advertisements WHERE title = 'Test Admin Ad';

