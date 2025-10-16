# Instrucciones para arreglar el sistema de anuncios

## ✅ Errores corregidos:

1. **Dependencia `date-fns` instalada** - Ya no habrá errores de importación
2. **Rutas de importación corregidas** - Los componentes ahora encuentran sus dependencias
3. **Servidor funcionando** - La aplicación está corriendo en localhost:3005

## 🔧 Para arreglar completamente el sistema de anuncios:

### Paso 1: Ejecutar el SQL en Supabase
1. Ve a tu proyecto de Supabase
2. Abre el **SQL Editor**
3. Copia y pega el contenido del archivo `CREATE_ADVERTISING_FUNCTIONS.sql`
4. Ejecuta el script

### Paso 2: Verificar que las funciones se crearon
En el SQL Editor de Supabase, ejecuta:
```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%advertisement%';
```

Deberías ver:
- `get_next_advertisement`
- `record_advertisement_view`
- `record_advertisement_click`
- `get_active_advertisements`

### Paso 3: Verificar las tablas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%advertisement%';
```

Deberías ver:
- `advertisements`
- `advertisement_views`

## 🎯 Resultado esperado:

Después de ejecutar el SQL:
- ✅ No más errores de "función no encontrada"
- ✅ Sistema de anuncios funcionando
- ✅ Anuncios de ejemplo disponibles
- ✅ Tracking de visualizaciones y clics funcionando

## 📝 Notas importantes:

- Las funciones están configuradas con `SECURITY DEFINER` para funcionar correctamente
- Se crearon políticas RLS (Row Level Security) apropiadas
- Se insertaron anuncios de ejemplo para probar
- El sistema respeta usuarios premium (no muestra anuncios)

## 🚀 Una vez ejecutado el SQL:

La aplicación debería funcionar completamente sin errores en la consola relacionados con anuncios.

