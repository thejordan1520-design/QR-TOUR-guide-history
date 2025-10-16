// Utilidad para probar el sistema de emails
import { hybridEmailService } from '../services/hybridEmailService';
import { paymentEmailService } from '../services/paymentEmailService';

export const testEmailSystem = async () => {
  console.log('🧪 [Email Test] Iniciando pruebas del sistema REAL de emails...');
  
  try {
    // Test 1: Verificar configuración
    console.log('🧪 [Email Test] 1. Verificando configuración real...');
    const config = hybridEmailService.getConfig();
    console.log('🔧 [Email Test] Configuración:', config);
    
    if (!config.resendConfigured) {
      console.error('❌ [Email Test] Resend no está configurado correctamente');
      return false;
    }
    
    // Test 2: Probar conexión
    console.log('🧪 [Email Test] 2. Probando conexión con Resend...');
    const connectionTest = await hybridEmailService.testResendConnection();
    console.log('✅ [Email Test] Conexión:', connectionTest.success ? 'OK' : 'ERROR');
    
    if (!connectionTest.success) {
      console.error('❌ [Email Test] Error en conexión:', connectionTest.error);
      return false;
    }

    console.log('🎉 [Email Test] Sistema REAL funcionando correctamente!');
    console.log('✅ [Email Test] Resend configurado y conectado');
    console.log('✅ [Email Test] Variables de entorno cargadas correctamente');
    console.log('✅ [Email Test] Configuración profesional activa');
    return true;
    
  } catch (error) {
    console.error('❌ [Email Test] Error durante las pruebas:', error);
    return false;
  }
};

// Función para probar desde la consola del navegador
(window as any).testEmailSystem = testEmailSystem;
