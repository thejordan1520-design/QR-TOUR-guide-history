// Script de diagnóstico para identificar problemas de conexión con Supabase
import { supabase } from '../lib/supabase';
import { ENV_CONFIG } from '../config/environment';

export interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

export const runSupabaseDiagnostic = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];

  // 1. Verificar configuración de entorno
  results.push({
    test: 'Environment Configuration',
    status: ENV_CONFIG.supabase.url && ENV_CONFIG.supabase.anonKey ? 'success' : 'error',
    message: `URL: ${ENV_CONFIG.supabase.url ? '✅' : '❌'}, AnonKey: ${ENV_CONFIG.supabase.anonKey ? '✅' : '❌'}`,
    data: {
      url: ENV_CONFIG.supabase.url,
      hasAnonKey: !!ENV_CONFIG.supabase.anonKey,
      hasServiceKey: !!ENV_CONFIG.supabase.serviceRoleKey
    }
  });

  // 2. Verificar conexión básica
  try {
    const { data, error } = await supabase.from('destinations').select('count').limit(1);
    results.push({
      test: 'Basic Connection',
      status: error ? 'error' : 'success',
      message: error ? `Error: ${error.message}` : 'Connection successful',
      data: { error, data }
    });
  } catch (err) {
    results.push({
      test: 'Basic Connection',
      status: 'error',
      message: `Exception: ${err}`,
      data: { error: err }
    });
  }

  // 3. Verificar tabla destinations específicamente
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('id, name, is_active, order_position')
      .eq('is_active', true)
      .limit(5);

    results.push({
      test: 'Destinations Table Query',
      status: error ? 'error' : 'success',
      message: error ? `Error: ${error.message}` : `Found ${data?.length || 0} active destinations`,
      data: { error, count: data?.length, sample: data }
    });
  } catch (err) {
    results.push({
      test: 'Destinations Table Query',
      status: 'error',
      message: `Exception: ${err}`,
      data: { error: err }
    });
  }

  // 4. Verificar tabla services
  try {
    const { data, error } = await supabase
      .from('tourist_guides')
      .select('id, name, is_active, order_position')
      .eq('is_active', true)
      .limit(5);

    results.push({
      test: 'Services Table Query',
      status: error ? 'error' : 'success',
      message: error ? `Error: ${error.message}` : `Found ${data?.length || 0} active guides`,
      data: { error, count: data?.length, sample: data }
    });
  } catch (err) {
    results.push({
      test: 'Services Table Query',
      status: 'error',
      message: `Exception: ${err}`,
      data: { error: err }
    });
  }

  // 5. Verificar autenticación
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    results.push({
      test: 'Authentication Status',
      status: error ? 'warning' : 'success',
      message: error ? `Auth error: ${error.message}` : `Session: ${session ? 'Active' : 'None'}`,
      data: { error, hasSession: !!session, userEmail: session?.user?.email }
    });
  } catch (err) {
    results.push({
      test: 'Authentication Status',
      status: 'warning',
      message: `Auth exception: ${err}`,
      data: { error: err }
    });
  }

  // 6. Verificar canales realtime
  try {
    const channel = supabase.channel('diagnostic-test');
    const subscription = channel.subscribe((status) => {
      console.log('Diagnostic channel status:', status);
    });
    
    // Esperar un poco para ver el estado
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    results.push({
      test: 'Realtime Channel',
      status: channel.state === 'joined' ? 'success' : 'warning',
      message: `Channel state: ${channel.state}`,
      data: { state: channel.state }
    });

    // Limpiar
    supabase.removeChannel(channel);
  } catch (err) {
    results.push({
      test: 'Realtime Channel',
      status: 'error',
      message: `Channel error: ${err}`,
      data: { error: err }
    });
  }

  return results;
};

// Función para mostrar resultados en consola
export const logDiagnosticResults = (results: DiagnosticResult[]) => {
  console.log('🔍 SUPABASE DIAGNOSTIC RESULTS:');
  console.log('================================');
  
  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.test}: ${result.message}`);
    if (result.data) {
      console.log('   Data:', result.data);
    }
  });
  
  console.log('================================');
  
  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  
  if (errorCount === 0 && warningCount === 0) {
    console.log('🎉 All tests passed! Supabase connection is healthy.');
  } else {
    console.log(`⚠️ Found ${errorCount} errors and ${warningCount} warnings.`);
  }
};

// Función para ejecutar diagnóstico completo
export const runFullDiagnostic = async () => {
  console.log('🚀 Starting Supabase diagnostic...');
  const results = await runSupabaseDiagnostic();
  logDiagnosticResults(results);
  return results;
};
