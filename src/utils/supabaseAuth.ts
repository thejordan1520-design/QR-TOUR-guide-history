import { supabaseAdmin } from '../lib/supabase';

export const refreshSupabaseSession = async () => {
  try {
    console.log('🔄 Refrescando sesión de Supabase...');
    
    // Obtener la sesión actual
    const { data: { session }, error: sessionError } = await supabaseAdmin.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error obteniendo sesión:', sessionError);
      return false;
    }
    
    if (!session) {
      console.log('⚠️ No hay sesión activa');
      return false;
    }
    
    // Si hay sesión, intentar refrescarla
    const { data: refreshData, error: refreshError } = await supabaseAdmin.auth.refreshSession();
    
    if (refreshError) {
      console.error('❌ Error refrescando sesión:', refreshError);
      return false;
    }
    
    console.log('✅ Sesión refrescada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error general refrescando sesión:', error);
    return false;
  }
};

export const checkSupabaseConnection = async () => {
  try {
    console.log('🔍 Verificando conexión con Supabase...');
    
    // Intentar hacer una consulta simple a una tabla pública
    const { data, error } = await supabaseAdmin
      .from('advertisements')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
    
    console.log('✅ Conexión con Supabase verificada');
    return true;
  } catch (error) {
    console.error('❌ Error verificando conexión:', error);
    return false;
  }
};

// Función para manejar errores de JWT automáticamente
export const handleJWTError = async (error: any) => {
  if (error?.message?.includes('JWT') || error?.message?.includes('expired')) {
    console.log('🔄 Detectado error JWT, refrescando sesión...');
    const refreshed = await refreshSupabaseSession();
    return refreshed;
  }
  return false;
};
