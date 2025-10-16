// Configuración de entorno para el proyecto
const getEnvVar = (key: string, fallback: string = ''): any => {
  // Prioridad: import.meta.env -> window[key] -> process.env -> fallback
  // window[key] permite inyectar valores en tiempo de ejecución si hiciera falta
  const viteVal = (import.meta as any)?.env?.[key];
  const winVal = typeof window !== 'undefined' ? (window as any)[key] : undefined;
  const nodeVal = (typeof process !== 'undefined' ? (process as any).env?.[key] : undefined);
  return viteVal ?? winVal ?? nodeVal ?? fallback;
};

export const ENV_CONFIG = {
  // Detectar si estamos en desarrollo
  isDevelopment: import.meta.env.DEV,
  
  // Detectar si estamos en producción
  isProduction: import.meta.env.PROD,
  
  // URLs de la aplicación
  frontendUrl: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3005',
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3003',
  
  // Configuración de Supabase
  supabase: {
    // Fallbacks seguros: solo URL y anon key (NUNCA exponer service role)
    url: getEnvVar('VITE_SUPABASE_URL', 'https://nhegdlprktbtriwwhoms.supabase.co'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZWdkbHBya3RidHJpd3dob21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxODU5NTgsImV4cCI6MjA3Mjc2MTk1OH0.8shmGdoFCih9LKzUe7VQ1UdGIc2FCyuo6y8BCVKgKtk'),
    serviceRoleKey: getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY', ''), // ✅ NO hardcodear service role
  },
  
  // Configuración de PayPal
    paypal: {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    environment: import.meta.env.VITE_PAYPAL_ENVIRONMENT || 'sandbox',
  },
  
  // Configuración de email
  email: {
    resendApiKey: getEnvVar('VITE_RESEND_API_KEY', 're_RoNMHgSQ_8KT2d5mCBVL4bkeKz1qQi4Pm'),
    mainEmail: getEnvVar('VITE_MAIN_EMAIL', 'info@qrtourguidehistory.com'),
    mainEmailName: getEnvVar('VITE_MAIN_EMAIL_NAME', 'QR Tour Guide'),
    fromEmail: getEnvVar('VITE_RESEND_FROM_EMAIL', 'info@qrtourguidehistory.com'),
    fromName: getEnvVar('VITE_RESEND_FROM_NAME', 'QR Tour Guide'),
    replyTo: getEnvVar('VITE_RESEND_REPLY_TO', 'info@qrtourguidehistory.com'),
  },
  
  // Configuración de OAuth
  oauth: {
    google: {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
    },
    microsoft: {
      clientId: import.meta.env.MICROSOFT_CLIENT_ID,
      clientSecret: import.meta.env.MICROSOFT_CLIENT_SECRET,
    },
  },
  
  // Configuración de PayPal Backend
  paypalBackend: {
    clientSecret: import.meta.env.PAYPAL_CLIENT_SECRET,
    webhookId: import.meta.env.PAYPAL_WEBHOOK_ID,
    environment: import.meta.env.PAYPAL_ENVIRONMENT || 'live',
  },
  
  // Flags de funcionalidad
  features: {
    // Habilitar fallbacks solo en desarrollo
    enableFallbacks: import.meta.env.DEV,
    
    // Habilitar logs detallados solo en desarrollo
    enableDetailedLogs: import.meta.env.DEV,
    
    // Habilitar datos mock solo en desarrollo
    enableMockData: import.meta.env.DEV,
    
    // Habilitar Service Worker solo en producción
    enableServiceWorker: import.meta.env.PROD,
  },
  
  // Configuración de logging
  logging: {
    level: import.meta.env.DEV ? 'debug' : 'error',
    enableConsole: import.meta.env.DEV,
    enablePerformance: import.meta.env.DEV,
  },
};

// Validar configuración crítica
export const validateEnvironment = () => {
  const errors: string[] = [];
  
  if (!ENV_CONFIG.supabase.url) {
    errors.push('VITE_SUPABASE_URL is required');
  }
  
  if (!ENV_CONFIG.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }
  
  if (ENV_CONFIG.isProduction && !ENV_CONFIG.supabase.serviceRoleKey) {
    errors.push('VITE_SUPABASE_SERVICE_ROLE_KEY is required in production');
  }
  
  if (errors.length > 0) {
    console.error('❌ Environment validation failed:', errors);
    if (ENV_CONFIG.isProduction) {
      throw new Error(`Environment validation failed: ${errors.join(', ')}`);
    }
  }
  
  return errors.length === 0;
};

// Inicializar validación
if (typeof window !== 'undefined') {
  validateEnvironment();
}