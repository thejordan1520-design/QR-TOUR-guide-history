# 🎯 SCRIPT SQL ESPECÍFICO PARA SUBSCRIPTION_PLANS

## ✅ TABLA CONFIRMADA:
La tabla `subscription_plans` existe y tiene todas las columnas necesarias:
- ✅ `id` (uuid)
- ✅ `name` (text)
- ✅ `description` (text)
- ✅ `price` (numeric)
- ✅ `currency` (text)
- ✅ `duration_days` (integer)
- ✅ `duration_hours` (integer)
- ✅ `features` (jsonb)
- ✅ `benefits` (jsonb)
- ✅ `is_active` (boolean)
- ✅ `is_popular` (boolean)
- ✅ `color` (text)
- ✅ `plan_key` (text)
- ✅ `price_usd` (numeric)
- ✅ `order_position` (integer)

## 🚀 INSTRUCCIONES:

### Opción 1: Script Específico (Recomendado)
1. Ve a Supabase → SQL Editor
2. Copia y pega el contenido de `setup-subscription-plans.sql`
3. Ejecuta el script
4. Deberías ver los 3 planes insertados

### Opción 2: Script Completo
1. Ve a Supabase → SQL Editor
2. Copia y pega el contenido de `setup-all-tables.sql`
3. Ejecuta el script
4. Verás un reporte de todas las tablas

## 🎯 RESULTADO ESPERADO:

Después de ejecutar el script:
```
plan_key    | name           | price | currency | duration_days | is_active | is_popular | order_position
basic_24h   | Acceso Básico  | 5.00  | USD      | 1             | true      | true       | 1
premium_7d  | Acceso Premium | 15.00 | USD      | 7             | true      | false      | 2
vip_30d     | Acceso VIP     | 35.00 | USD      | 30            | true      | false      | 3
```

## 🔍 VERIFICACIÓN:

El script:
- ✅ **Crea política RLS** - Para acceso autenticado
- ✅ **Inserta 3 planes** - Básico, Premium, VIP
- ✅ **Usa ON CONFLICT** - No duplica datos
- ✅ **Incluye todas las columnas** - Según el esquema
- ✅ **Muestra resultado** - Confirma inserción

## 🆘 SI SIGUE FALLANDO:

1. **Ejecuta solo la inserción**:
   ```sql
   INSERT INTO subscription_plans (name, description, price, currency, duration_days, duration_hours, features, benefits, is_active, is_popular, color, plan_key, price_usd, order_position) VALUES ('Acceso Básico', 'Acceso básico por 24 horas', 5.00, 'USD', 1, 24, '["Acceso completo por 24 horas"]', '["Perfecto para visitas cortas"]', true, true, 'blue', 'basic_24h', 5.00, 1);
   ```

2. **Verifica permisos**:
   - Confirma que tienes permisos de escritura
   - Verifica que la tabla existe

3. **Revisa errores**:
   - Busca mensajes de error específicos
   - Verifica que no hay conflictos de claves

---
**¡Este script debería funcionar perfectamente con la tabla existente!** 🎉

