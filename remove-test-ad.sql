-- Eliminar anuncio de prueba "TEST INSERCIÓN DIRECTA"
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar anuncios existentes
SELECT 'ANUNCIOS ACTUALES:' as info;
SELECT 
    id,
    title,
    description,
    is_active,
    priority,
    created_at
FROM advertisements 
ORDER BY created_at DESC;

-- 2. Eliminar anuncio de prueba
DELETE FROM advertisements 
WHERE title ILIKE '%TEST INSERCIÓN DIRECTA%' 
   OR title ILIKE '%test inserción directa%'
   OR description ILIKE '%Este anuncio fue creado directamente desde SQL%';

-- 3. Verificar que se eliminó
SELECT 'ANUNCIOS DESPUÉS DE ELIMINAR:' as info;
SELECT 
    id,
    title,
    description,
    is_active,
    priority,
    created_at
FROM advertisements 
ORDER BY created_at DESC;

-- 4. Verificar anuncios activos finales
SELECT 'ANUNCIOS ACTIVOS FINALES:' as info;
SELECT COUNT(*) as total_active_ads 
FROM advertisements 
WHERE is_active = true;
