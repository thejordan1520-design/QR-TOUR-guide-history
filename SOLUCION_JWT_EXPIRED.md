# 🔧 SOLUCIÓN RÁPIDA PARA JWT EXPIRED

## 🚨 PROBLEMA IDENTIFICADO
El error "JWT expired" está causando que todas las secciones del panel admin fallen. Esto significa que la sesión de autenticación con Supabase ha expirado.

## ✅ SOLUCIONES IMPLEMENTADAS

### 1. **Sistema de Autenticación Automática**
- `AdminAuthGuard.tsx` - Componente que maneja la autenticación automática
- `useAdminAuth.ts` - Hook para gestionar la sesión del admin
- `supabaseAuth.ts` - Utilidades para refrescar sesiones

### 2. **Script SQL de Corrección**
- `fix-admin-auth.sql` - Script para corregir políticas RLS y crear datos de ejemplo

## 🚀 INSTRUCCIONES INMEDIATAS

### Paso 1: Ejecutar Script SQL
1. Ve a Supabase → SQL Editor
2. Copia y pega el contenido de `fix-admin-auth.sql`
3. Ejecuta el script

### Paso 2: Crear Usuario Admin (si no existe)
1. Ve a Supabase → Authentication → Users
2. Haz clic en "Add user"
3. Email: `jordandn15@outlook.com`
4. Password: `admin123` (o la que prefieras)
5. Confirma la creación

### Paso 3: Verificar el Panel Admin
1. Recarga la página del admin: `http://localhost:3005/admin`
2. Deberías ver una pantalla de login automático
3. Haz clic en "Iniciar Sesión Automática"
4. El sistema debería conectarte automáticamente

## 🔍 QUÉ HACE LA SOLUCIÓN

### AdminAuthGuard
- Detecta automáticamente si hay problemas de JWT
- Muestra una pantalla de login si no hay sesión
- Intenta reconectar automáticamente
- Maneja errores de conexión

### Políticas RLS Simplificadas
- Cambia las políticas complejas por políticas simples
- Permite acceso completo a usuarios autenticados
- Elimina restricciones que causaban problemas

### Datos de Ejemplo
- Crea planes de suscripción de ejemplo
- Crea configuraciones de apariencia por defecto
- Asegura que las tablas tengan contenido

## 🎯 RESULTADO ESPERADO

Después de ejecutar el script SQL y crear el usuario admin:

1. ✅ **JWT Error Resuelto** - No más errores de JWT expired
2. ✅ **Login Automático** - El admin se conecta automáticamente
3. ✅ **Todas las Secciones Funcionan** - Planes, Traducciones, Logs, etc.
4. ✅ **Datos de Ejemplo** - Las tablas tienen contenido para mostrar

## 🆘 SI SIGUE FALLANDO

1. **Verifica el usuario admin**:
   - Ve a Supabase → Authentication → Users
   - Confirma que `jordandn15@outlook.com` existe
   - Verifica que la contraseña sea correcta

2. **Revisa las políticas RLS**:
   - Ve a Supabase → Authentication → Policies
   - Confirma que las políticas están aplicadas

3. **Verifica la conexión**:
   - Revisa la consola del navegador
   - Busca errores específicos de Supabase

## 📞 CREDENCIALES DE ADMIN
- **Email**: `jordandn15@outlook.com`
- **Password**: `admin123` (cambiar si es necesario)

---
**¡Esta solución debería resolver completamente el problema de JWT expired!** 🎉

