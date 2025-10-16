import { createClient } from '@supabase/supabase-js';

// Variables de entorno directas
const SUPABASE_URL = 'https://nhegdlprktbtriwwhoms.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZWdkbHBya3RidHJpd3dob21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxODU5NTgsImV4cCI6MjA3Mjc2MTk1OH0.8shmGdoFCih9LKzUe7VQ1UdGIc2FCyuo6y8BCVKgKtk';

// Configuración común para evitar problemas de conexión
const commonConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // ✅ Habilitado para procesar callbacks OAuth
    flowType: 'implicit' as const, // ✅ Cambiado a implicit para OAuth
  },
  global: {
    headers: {
      'apikey': SUPABASE_ANON_KEY
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
};

// CLIENTE PÚBLICO (frontend) — sesiones aisladas
export const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  ...commonConfig,
  auth: {
    ...commonConfig.auth,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-public-auth'
  }
});

// CLIENTE ADMIN — sesiones completamente aisladas del público
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  ...commonConfig,
  auth: {
    ...commonConfig.auth,
    storage: typeof window !== 'undefined' ? window.sessionStorage : undefined, // Usar sessionStorage para admin
    storageKey: 'sb-admin-auth-temp', // Clave diferente
    detectSessionInUrl: false, // Deshabilitar detección automática
    flowType: 'pkce' as const, // Usar PKCE para admin
  }
});

// Compatibilidad: mantener `supabase` apuntando al cliente público
export const supabase = supabasePublic;

// Utilidad para limpiar solo sesiones públicas (usar cuando se accede al admin)
export const clearPublicSessions = () => {
  if (typeof window !== 'undefined') {
    console.log('🧹 Limpiando sesiones públicas...');
    
    // Limpiar localStorage del cliente público
    localStorage.removeItem('sb-public-auth');
    
    // Limpiar cookies relacionadas con sesiones públicas
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.includes('supabase') || name.includes('sb-')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });
    
    console.log('✅ Sesiones públicas limpiadas');
  }
};

// Utilidad para limpiar sesiones problemáticas
export const clearSupabaseSessions = () => {
  if (typeof window !== 'undefined') {
    console.log('🧹 Limpiando sesiones de Supabase...');
    
    // Limpiar localStorage del cliente público
    localStorage.removeItem('sb-public-auth');
    
    // Limpiar sessionStorage del cliente admin
    sessionStorage.removeItem('sb-admin-auth-temp');
    
    // Limpiar cookies relacionadas
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.includes('supabase') || name.includes('sb-')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });
    
    console.log('✅ Sesiones de Supabase limpiadas');
  }
};

// Utilidad para verificar el estado de conexión
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabasePublic.from('advertisements').select('count').limit(1);
    if (error) {
      console.error('❌ Error de conexión Supabase:', error);
      return false;
    }
    console.log('✅ Conexión Supabase OK');
    return true;
  } catch (err) {
    console.error('❌ Error verificando conexión:', err);
    return false;
  }
};

// Utilidad no-op para auditoría de instancias (compatibilidad con imports existentes)
export const verifySingleInstances = () => {
  if (typeof window !== 'undefined') {
    console.log('🔎 Verificación básica de instancias Supabase: pública y admin inicializadas');
  }
};

console.log('✅ Clientes Supabase creados: público y admin (sesiones separadas)');