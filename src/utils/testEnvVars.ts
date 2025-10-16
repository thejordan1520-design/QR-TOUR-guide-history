// Utilidad para verificar que las variables de entorno se cargan correctamente
export const testEnvironmentVariables = () => {
  console.log('🔍 [Test Env] Verificando configuración REAL de variables de entorno...');
  
  const envVars = {
    VITE_RESEND_API_KEY: import.meta.env.VITE_RESEND_API_KEY,
    VITE_MAIN_EMAIL: import.meta.env.VITE_MAIN_EMAIL,
    VITE_MAIN_EMAIL_NAME: import.meta.env.VITE_MAIN_EMAIL_NAME,
    VITE_RESEND_FROM_EMAIL: import.meta.env.VITE_RESEND_FROM_EMAIL,
    VITE_RESEND_FROM_NAME: import.meta.env.VITE_RESEND_FROM_NAME,
    VITE_RESEND_REPLY_TO: import.meta.env.VITE_RESEND_REPLY_TO
  };

  console.log('📋 [Test Env] Variables encontradas:', envVars);
  
  const hasResendKey = !!envVars.VITE_RESEND_API_KEY;
  const hasMainEmail = !!envVars.VITE_MAIN_EMAIL;
  const hasFromEmail = !!envVars.VITE_RESEND_FROM_EMAIL;
  
  console.log(`✅ [Test Env] VITE_RESEND_API_KEY presente: ${hasResendKey}`);
  console.log(`✅ [Test Env] VITE_MAIN_EMAIL presente: ${hasMainEmail}`);
  console.log(`✅ [Test Env] VITE_RESEND_FROM_EMAIL presente: ${hasFromEmail}`);
  
  if (hasResendKey) {
    console.log(`🔑 [Test Env] API Key: ${envVars.VITE_RESEND_API_KEY.substring(0, 15)}...`);
    console.log(`🔑 [Test Env] Fuente: Variables de entorno REALES`);
  } else {
    console.error('❌ [Test Env] NO SE PUDO OBTENER API KEY DE RESEND desde variables de entorno');
  }
  
  return {
    resendConfigured: hasResendKey,
    mainEmailConfigured: hasMainEmail,
    fromEmailConfigured: hasFromEmail,
    finalApiKey: envVars.VITE_RESEND_API_KEY,
    sourceFromEnv: true,
    configuration: 'REAL_VARIABLES_ENTORNO',
    allVars: envVars
  };
};

// Función para probar la inicialización de Resend
export const testResendInitialization = async () => {
  try {
    console.log('🧪 [Test Resend] Probando inicialización REAL de Resend...');
    
    const { hybridEmailService } = await import('../services/hybridEmailService');
    const config = hybridEmailService.getConfig();
    
    console.log('🔧 [Test Resend] Configuración obtenida:', config);
    
    if (config.resendConfigured) {
      console.log('✅ [Test Resend] Resend está configurado correctamente (configuración simplificada).');
      // Intentar una conexión de prueba a través del servicio híbrido
      const connectionTest = await hybridEmailService.testResendConnection();
      if (connectionTest.success) {
        console.log('✅ [Test Resend] Conexión de prueba con Resend exitosa.');
        return { success: true, message: 'Resend inicializado y conectado correctamente (configuración simplificada).' };
      } else {
        console.error('❌ [Test Resend] Fallo en la conexión de prueba con Resend:', connectionTest.error);
        return { success: false, error: new Error(`Fallo en la conexión de prueba con Resend: ${connectionTest.error}`) };
      }
    } else {
      console.error('❌ [Test Resend] Resend no está configurado correctamente.');
      return { success: false, error: new Error('Resend no está configurado correctamente.') };
    }
  } catch (error) {
    console.error('❌ [Test Resend] Error durante la inicialización de Resend:', error);
    return { success: false, error: error instanceof Error ? error : new Error('Error desconocido durante la inicialización de Resend.') };
  }
};
