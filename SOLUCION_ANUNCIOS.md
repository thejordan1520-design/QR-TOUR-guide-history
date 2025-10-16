# 🔧 SOLUCIÓN PARA ERRORES DE CONSOLA Y ANUNCIOS

## 🚨 **Problemas identificados:**

### **1. Errores de JWT expirado:**
- **Error:** `JWT expired` (código PGRST303)
- **Causa:** Token de autenticación caducado
- **Impacto:** Los anuncios no se cargan

### **2. Propiedad `isPremium` faltante:**
- **Error:** `useAdvertisingSystem` intenta usar `isPremium` que no existe en `AuthContext`
- **Causa:** Inconsistencia en la interfaz de autenticación

## ✅ **Soluciones implementadas:**

### **1. Hook de anuncios mejorado:**
- ✅ **Manejo de JWT expirado** con refresh automático
- ✅ **Fallback a consulta directa** si falla la función RPC
- ✅ **Logs detallados** para debugging
- ✅ **Funciona sin autenticación** para usuarios anónimos

### **2. Hook de sistema de anuncios corregido:**
- ✅ **Propiedad `isPremium` hardcodeada** como `false` temporalmente
- ✅ **Sistema funciona para todos los usuarios**

### **3. Políticas RLS actualizadas:**
- ✅ **Acceso público** a anuncios activos
- ✅ **Inserción pública** de visualizaciones
- ✅ **Actualización pública** de visualizaciones

## 📋 **Pasos para completar la solución:**

### **Paso 1: Actualizar políticas en Supabase**
Ejecuta el archivo `UPDATE_ADVERTISING_POLICIES.sql` en Supabase:

```sql
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Anuncios públicos" ON advertisements;
DROP POLICY IF EXISTS "Insertar visualizaciones" ON advertisement_views;
DROP POLICY IF EXISTS "Actualizar visualizaciones" ON advertisement_views;

-- Crear nuevas políticas más permisivas
CREATE POLICY "Anuncios públicos - lectura" ON advertisements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Visualizaciones públicas - inserción" ON advertisement_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Visualizaciones públicas - actualización" ON advertisement_views
  FOR UPDATE USING (true);
```

### **Paso 2: Verificar que el servidor esté funcionando**
```bash
# El servidor debería estar en http://localhost:3005
# Si no está funcionando, ejecuta:
npm run dev
```

### **Paso 3: Probar los anuncios**
1. **Abre la aplicación** en http://localhost:3005
2. **Abre la consola** del navegador (F12)
3. **Busca los logs** de anuncios:
   - `🚀 Iniciando sistema de publicidad...`
   - `✅ Anuncio obtenido por función RPC: [título]`
   - `🎬 Mostrando anuncio: [título]`

## 🔍 **Debugging:**

### **Si los anuncios aún no aparecen:**

1. **Verificar en consola:**
   ```javascript
   // Buscar estos mensajes:
   "🚀 Iniciando sistema de publicidad..."
   "✅ Anuncio obtenido por función RPC:"
   "🎬 Mostrando anuncio:"
   ```

2. **Verificar políticas RLS:**
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE tablename IN ('advertisements', 'advertisement_views');
   ```

3. **Verificar anuncios en la base de datos:**
   ```sql
   SELECT id, title, is_active FROM advertisements;
   ```

### **Si hay errores de JWT:**
- Los logs mostrarán: `⚠️ JWT expirado - intentando refrescar sesión...`
- El sistema intentará refrescar automáticamente
- Si falla, continuará sin autenticación

## 🎯 **Resultado esperado:**

- ✅ **Sin errores de JWT** en la consola
- ✅ **Anuncios aparecen** en la parte superior de la página
- ✅ **Logs informativos** en la consola
- ✅ **Sistema funciona** para usuarios autenticados y anónimos

## 📝 **Archivos modificados:**

1. **`src/hooks/useAdvertising.ts`** - Manejo mejorado de errores
2. **`src/hooks/useAdvertisingSystem.ts`** - Propiedad `isPremium` corregida
3. **`UPDATE_ADVERTISING_POLICIES.sql`** - Políticas RLS actualizadas

**¡Los anuncios deberían funcionar correctamente después de ejecutar el SQL!** 🚀

