# 🚀 Guía de Despliegue - QR Tour Guide

Esta guía te ayudará a desplegar el proyecto QR Tour Guide en Vercel de manera segura y eficiente.

## 📋 Prerrequisitos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Resend](https://resend.com) (para emails)
- Cuenta en [PayPal Developer](https://developer.paypal.com)

## 🔧 Configuración del Proyecto

### 1. Clonar y Preparar el Proyecto

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd qr-tour-guide

# Instalar dependencias
npm install

# Copiar archivo de configuración local
cp env.local.example .env.local
```

### 2. Configurar Variables de Entorno

Edita el archivo `.env.local` con tus valores reales:

```bash
# Supabase (Frontend)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Resend (Emails)
VITE_RESEND_API_KEY=tu-resend-api-key
VITE_MAIN_EMAIL=info@tudominio.com
VITE_MAIN_EMAIL_NAME=QR Tour Guide

# PayPal
VITE_PAYPAL_CLIENT_ID=tu-paypal-client-id
VITE_PAYPAL_ENVIRONMENT=live

# URLs de producción
VITE_FRONTEND_URL=https://tu-dominio.vercel.app
VITE_BACKEND_URL=https://tu-backend.vercel.app
```

## 🗄️ Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Crea un nuevo proyecto
3. Anota la URL y las claves API

### 2. Ejecutar Migraciones SQL

Ejecuta estos scripts en el orden indicado en el SQL Editor de Supabase:

```sql
-- 1. Crear tablas principales
-- Ejecutar: CREATE_MISSING_TABLES.sql

-- 2. Crear tablas de servicios
-- Ejecutar: CREATE_SERVICE_TABLES_V2.sql

-- 3. Crear sistema de ordenamiento
-- Ejecutar: COMPLETE_ORDER_SYSTEM_MIGRATION.sql

-- 4. Crear tabla de planes de suscripción
-- Ejecutar: CREATE_SUBSCRIPTION_PLANS_TABLE.sql
-- Ejecutar: MIGRATE_SUBSCRIPTION_PLANS_COMPLETE.sql

-- 5. Crear tabla de notificaciones admin
-- Ejecutar: CREATE_ADMIN_NOTIFICATIONS_TABLE.sql
```

### 3. Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excursions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supermarkets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública (frontend)
CREATE POLICY "Public read access" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.excursions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.supermarkets FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.services FOR SELECT USING (true);

-- Políticas para admin (service role)
CREATE POLICY "Admin full access" ON public.destinations FOR ALL USING (true);
CREATE POLICY "Admin full access" ON public.excursions FOR ALL USING (true);
CREATE POLICY "Admin full access" ON public.restaurants FOR ALL USING (true);
CREATE POLICY "Admin full access" ON public.supermarkets FOR ALL USING (true);
CREATE POLICY "Admin full access" ON public.services FOR ALL USING (true);
```

### 4. Crear Usuario Admin

```sql
-- Crear usuario admin en Supabase Auth
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES ('admin@tudominio.com', crypt('tu-password-seguro', gen_salt('bf')), NOW(), NOW(), NOW());

-- Crear registro en tabla users
INSERT INTO public.users (id, email, name, is_admin, isSubscribed)
SELECT id, email, 'Admin', true, true
FROM auth.users
WHERE email = 'admin@tudominio.com';
```

## 🚀 Despliegue en Vercel

### 1. Conectar con Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en "New Project"
3. Conecta tu repositorio de GitHub/GitLab
4. Selecciona el proyecto QR Tour Guide

### 2. Configurar Variables de Entorno en Vercel

En la configuración del proyecto en Vercel, añade estas variables:

```bash
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Resend
VITE_RESEND_API_KEY=tu-resend-api-key
VITE_MAIN_EMAIL=info@tudominio.com
VITE_MAIN_EMAIL_NAME=QR Tour Guide
VITE_RESEND_FROM_EMAIL=info@tudominio.com
VITE_RESEND_FROM_NAME=QR Tour Guide
VITE_RESEND_REPLY_TO=info@tudominio.com

# PayPal
VITE_PAYPAL_CLIENT_ID=tu-paypal-client-id
VITE_PAYPAL_ENVIRONMENT=live

# URLs de producción
VITE_FRONTEND_URL=https://tu-dominio.vercel.app
VITE_BACKEND_URL=https://tu-backend.vercel.app

# OAuth
VITE_GOOGLE_CLIENT_ID=tu-google-client-id
VITE_GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

### 3. Configurar Build Settings

En Vercel, configura:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Desplegar

1. Haz clic en "Deploy"
2. Espera a que termine el build
3. Verifica que la aplicación funcione correctamente

## 🔐 Configuración de Seguridad

### 1. Configurar Dominios en Supabase

En Supabase Dashboard > Settings > API:

- Añade tu dominio de Vercel a "Site URL"
- Añade tu dominio a "Additional Redirect URLs"

### 2. Configurar OAuth

#### Google OAuth:
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Configura OAuth 2.0
3. Añade tu dominio de Vercel a "Authorized JavaScript origins"
4. Añade `https://tu-dominio.vercel.app/auth/callback` a "Authorized redirect URIs"

#### Microsoft OAuth:
1. Ve a [Azure Portal](https://portal.azure.com)
2. Configura App Registration
3. Añade tu dominio de Vercel a "Redirect URIs"

### 3. Configurar PayPal

1. Ve a [PayPal Developer](https://developer.paypal.com)
2. Crea una aplicación
3. Configura Webhooks para tu dominio de Vercel
4. Actualiza las variables de entorno con las nuevas credenciales

## 📧 Configuración de Emails

### 1. Configurar Resend

1. Ve a [Resend Dashboard](https://resend.com)
2. Crea un dominio
3. Configura DNS records
4. Obtén tu API key
5. Actualiza las variables de entorno

### 2. Configurar Templates de Email

Los emails se envían automáticamente para:
- Confirmación de reservas
- Notificaciones de pago
- Recordatorios de tours

## 🧪 Testing Post-Despliegue

### 1. Verificar Funcionalidades Básicas

- [ ] Frontend público carga correctamente
- [ ] Login de admin funciona
- [ ] Panel admin es accesible
- [ ] CRUD operations funcionan
- [ ] Realtime sync funciona

### 2. Verificar Integraciones

- [ ] Supabase connection
- [ ] PayPal payments
- [ ] Email notifications
- [ ] OAuth login (Google/Microsoft)

### 3. Verificar Performance

- [ ] Tiempo de carga < 3 segundos
- [ ] No hay errores en consola
- [ ] Responsive design funciona
- [ ] SEO meta tags están presentes

## 🔧 Mantenimiento

### 1. Monitoreo

- Revisa logs de Vercel regularmente
- Monitorea métricas de Supabase
- Verifica que los emails se envíen correctamente

### 2. Actualizaciones

- Actualiza dependencias regularmente
- Revisa logs de seguridad
- Mantén backups de la base de datos

### 3. Escalabilidad

- Configura CDN si es necesario
- Optimiza imágenes y assets
- Considera implementar caching

## 🆘 Troubleshooting

### Problemas Comunes

1. **Error de Supabase**: Verifica que las variables de entorno estén correctas
2. **Emails no se envían**: Revisa configuración de Resend
3. **PayPal no funciona**: Verifica credenciales y webhooks
4. **Admin no puede acceder**: Verifica que el usuario tenga `is_admin: true`

### Logs Útiles

- Vercel Function Logs
- Supabase Logs
- Browser Console
- Network Tab

## 📞 Soporte

Si tienes problemas con el despliegue:

1. Revisa esta guía paso a paso
2. Verifica que todas las variables de entorno estén configuradas
3. Revisa los logs de error
4. Contacta al equipo de desarrollo

---

¡Felicitaciones! 🎉 Tu aplicación QR Tour Guide debería estar funcionando en producción.
