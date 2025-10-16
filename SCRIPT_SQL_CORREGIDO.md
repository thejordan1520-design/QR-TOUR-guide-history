# 🔧 SCRIPT SQL CORREGIDO

## ❌ PROBLEMA IDENTIFICADO:
El script SQL anterior tenía un error de ambigüedad en la función `table_exists`:
```
ERROR: 42702: column reference "table_name" is ambiguous
It could refer to either a PL/pgSQL variable or a table column.
```

## ✅ SOLUCIÓN IMPLEMENTADA:

### Script SQL Simple (`fix-admin-auth-simple.sql`)
- ✅ **Sin funciones complejas** - Evita ambigüedad
- ✅ **Verificación directa** - Usa `EXISTS` directamente
- ✅ **Políticas RLS simples** - Para todas las tablas existentes
- ✅ **Datos de ejemplo** - Solo si las tablas existen
- ✅ **Funciones útiles** - `is_admin()` y `get_current_user()`

## 🚀 INSTRUCCIONES:

### Paso 1: Ejecutar Script SQL Simple
1. Ve a Supabase → SQL Editor
2. Copia y pega el contenido de `fix-admin-auth-simple.sql`
3. Ejecuta el script
4. Deberías ver mensajes como "Política creada para X"

### Paso 2: Crear Usuario Admin
1. Ve a Supabase → Authentication → Users
2. Haz clic en "Add user"
3. Email: `jordandn15@outlook.com`
4. Password: `admin123`
5. Confirma la creación

### Paso 3: Probar Panel Admin
1. Ve a `http://localhost:3005/admin`
2. Deberías ver la pantalla de login automático
3. Haz clic en "Iniciar Sesión Automática"

## 🎯 RESULTADO ESPERADO:

Después de ejecutar el script SQL simple:
```
NOTICE: Política creada para subscription_plans
NOTICE: Política creada para translations
NOTICE: Política creada para appearance_settings
NOTICE: Política creada para testimonials
NOTICE: Política creada para advertisements
NOTICE: Datos de planes insertados
NOTICE: Datos de apariencia insertados
Configuración completada exitosamente
```

## 🔍 VERIFICACIÓN:

El script SQL simple:
- ✅ **No tiene funciones complejas** - Evita errores de ambigüedad
- ✅ **Verifica tablas directamente** - Usa `EXISTS` en cada bloque
- ✅ **Crea políticas solo si existen** - No falla si la tabla no existe
- ✅ **Inserta datos de ejemplo** - Solo si las tablas existen
- ✅ **Muestra reporte final** - Lista qué tablas existen

## 🆘 SI SIGUE FALLANDO:

1. **Ejecuta el script por partes**:
   - Copia solo la primera sección (políticas)
   - Ejecuta y verifica que funciona
   - Luego copia la segunda sección (datos)

2. **Verifica el usuario admin**:
   - Confirma que `jordandn15@outlook.com` existe en Supabase Auth

3. **Revisa la consola del navegador**:
   - Busca errores específicos de Supabase
   - Verifica que no hay errores de JWT

---
**¡El script SQL simple debería funcionar sin errores!** 🎉

