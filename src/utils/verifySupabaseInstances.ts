// Utilidad para verificar que solo hay una instancia de Supabase
import { verifySingleInstances } from '../lib/supabase';

export const runSupabaseAudit = () => {
  console.log('🔍 AUDITORÍA DE SUPABASE - Verificando instancias...');
  
  // Verificar instancias centralizadas
  verifySingleInstances();
  
  // Verificar que no hay múltiples clientes en el DOM
  const clientElements = document.querySelectorAll('[data-supabase-client]');
  console.log('📊 Elementos con data-supabase-client:', clientElements.length);
  
  // Verificar localStorage para tokens duplicados
  const authKeys = Object.keys(localStorage).filter(key => 
    key.includes('supabase') || key.includes('auth')
  );
  console.log('🔑 Claves de auth en localStorage:', authKeys);
  
  // Verificar que no hay múltiples listeners de auth
  const authListeners = (window as any).__supabase_auth_listeners || 0;
  console.log('👂 Listeners de auth registrados:', authListeners);
  
  // Verificar warnings en la consola
  const originalWarn = console.warn;
  let warningCount = 0;
  console.warn = (...args) => {
    if (args[0]?.includes?.('Multiple GoTrueClient instances')) {
      warningCount++;
      console.error('❌ WARNING DETECTADO:', ...args);
    }
    originalWarn.apply(console, args);
  };
  
  // Restaurar console.warn después de un momento
  setTimeout(() => {
    console.warn = originalWarn;
    if (warningCount === 0) {
      console.log('✅ No se detectaron warnings de múltiples instancias');
    } else {
      console.error(`❌ Se detectaron ${warningCount} warnings de múltiples instancias`);
    }
  }, 1000);
  
  return {
    clientElements: clientElements.length,
    authKeys: authKeys.length,
    authListeners,
    warningCount
  };
};

// Función para limpiar instancias duplicadas
export const cleanupSupabaseInstances = () => {
  console.log('🧹 Limpiando instancias duplicadas de Supabase...');
  
  // Limpiar localStorage
  const authKeys = Object.keys(localStorage).filter(key => 
    key.includes('supabase') || key.includes('auth')
  );
  
  authKeys.forEach(key => {
    console.log('🗑️ Eliminando clave:', key);
    localStorage.removeItem(key);
  });
  
  // Limpiar sessionStorage
  const sessionKeys = Object.keys(sessionStorage).filter(key => 
    key.includes('supabase') || key.includes('auth')
  );
  
  sessionKeys.forEach(key => {
    console.log('🗑️ Eliminando clave de sesión:', key);
    sessionStorage.removeItem(key);
  });
  
  console.log('✅ Limpieza completada');
};

// Función para reinicializar Supabase correctamente
export const reinitializeSupabase = async () => {
  console.log('🔄 Reinicializando Supabase...');
  
  // Limpiar instancias existentes
  cleanupSupabaseInstances();
  
  // Esperar un momento
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Verificar que todo esté limpio
  const audit = runSupabaseAudit();
  
  if (audit.warningCount === 0) {
    console.log('✅ Supabase reinicializado correctamente');
    return true;
  } else {
    console.error('❌ Aún hay problemas con las instancias de Supabase');
    return false;
  }
};
