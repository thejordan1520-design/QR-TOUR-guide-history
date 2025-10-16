// Script para debuggear variables de entorno desde la consola del navegador
// Ejecutar en la consola: fetch('/debug-env.js').then(r => r.text()).then(eval)

console.log('🔍 [Debug Env] Verificando variables de entorno en el navegador...');

// Verificar si las variables están disponibles en window
const envCheck = {
  VITE_RESEND_API_KEY: import.meta?.env?.VITE_RESEND_API_KEY,
  VITE_MAIN_EMAIL: import.meta?.env?.VITE_MAIN_EMAIL,
  VITE_MAIN_EMAIL_NAME: import.meta?.env?.VITE_MAIN_EMAIL_NAME,
  VITE_RESEND_FROM_EMAIL: import.meta?.env?.VITE_RESEND_FROM_EMAIL,
  VITE_RESEND_FROM_NAME: import.meta?.env?.VITE_RESEND_FROM_NAME,
  VITE_RESEND_REPLY_TO: import.meta?.env?.VITE_RESEND_REPLY_TO
};

console.log('📋 [Debug Env] Variables import.meta.env:', envCheck);

// Verificar si están disponibles globalmente
const globalCheck = {
  RESEND_API_KEY: window.RESEND_API_KEY,
  VITE_RESEND_API_KEY: window.VITE_RESEND_API_KEY
};

console.log('🌍 [Debug Env] Variables globales:', globalCheck);

// Función para probar la inicialización de Resend
window.testResendFromBrowser = async () => {
  try {
    console.log('🧪 [Debug Env] Probando Resend desde el navegador...');
    
    // Intentar importar Resend dinámicamente
    const { Resend } = await import('https://cdn.skypack.dev/resend');
    
    if (!import.meta?.env?.VITE_RESEND_API_KEY) {
      throw new Error('VITE_RESEND_API_KEY no está disponible en import.meta.env');
    }
    
    const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);
    console.log('✅ [Debug Env] Resend inicializado correctamente desde el navegador');
    
    return { success: true, resend };
  } catch (error) {
    console.error('❌ [Debug Env] Error inicializando Resend desde el navegador:', error);
    return { success: false, error: error.message };
  }
};

// Función para verificar el servicio híbrido
window.testHybridService = () => {
  try {
    console.log('🧪 [Debug Env] Verificando servicio híbrido...');
    
    // Intentar acceder al servicio híbrido si está disponible
    if (window.hybridEmailService) {
      console.log('✅ [Debug Env] Servicio híbrido disponible en window');
      return { success: true, service: window.hybridEmailService };
    } else {
      console.log('⚠️ [Debug Env] Servicio híbrido no disponible en window');
      return { success: false, error: 'Servicio híbrido no encontrado' };
    }
  } catch (error) {
    console.error('❌ [Debug Env] Error verificando servicio híbrido:', error);
    return { success: false, error: error.message };
  }
};

console.log('🛠️ [Debug Env] Funciones disponibles:');
console.log('- testResendFromBrowser(): Probar inicialización de Resend');
console.log('- testHybridService(): Verificar servicio híbrido');
console.log('');

// Verificar inmediatamente si las variables están disponibles
const hasResendKey = !!envCheck.VITE_RESEND_API_KEY;
console.log(`🔑 [Debug Env] VITE_RESEND_API_KEY presente: ${hasResendKey}`);

if (hasResendKey) {
  console.log(`🔑 [Debug Env] API Key: ${envCheck.VITE_RESEND_API_KEY.substring(0, 15)}...`);
} else {
  console.error('❌ [Debug Env] VITE_RESEND_API_KEY NO ENCONTRADA');
  console.log('💡 [Debug Env] Sugerencias:');
  console.log('1. Verificar que el archivo .env.local existe');
  console.log('2. Reiniciar el servidor de desarrollo');
  console.log('3. Verificar que las variables empiecen con VITE_');
}

console.log('✅ [Debug Env] Script de debug cargado. Usa las funciones disponibles para más pruebas.');

