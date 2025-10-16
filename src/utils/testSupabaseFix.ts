// Script de prueba para verificar que el fix de Supabase funciona
import { verifySingleInstances, runSupabaseAudit } from '../lib/supabase';

export const testSupabaseFix = async () => {
  console.log('🧪 INICIANDO PRUEBA DE FIX DE SUPABASE...');
  
  try {
    // 1. Verificar instancias iniciales
    console.log('\n1️⃣ Verificando instancias iniciales...');
    verifySingleInstances();
    
    // 2. Ejecutar auditoría completa
    console.log('\n2️⃣ Ejecutando auditoría completa...');
    const auditResults = runSupabaseAudit();
    
    // 3. Verificar resultados
    console.log('\n3️⃣ Analizando resultados...');
    console.log('📊 Resultados de la auditoría:', auditResults);
    
    if (auditResults.warningCount === 0) {
      console.log('✅ PRUEBA EXITOSA: No se detectaron múltiples instancias');
      console.log('✅ El admin debería cargar correctamente');
      return { success: true, message: 'Fix aplicado correctamente' };
    } else {
      console.log('❌ PRUEBA FALLIDA: Aún hay múltiples instancias');
      console.log('❌ El admin puede seguir teniendo problemas');
      return { success: false, message: 'Aún hay problemas con las instancias' };
    }
    
  } catch (error) {
    console.error('❌ ERROR EN LA PRUEBA:', error);
    return { success: false, message: 'Error durante la prueba' };
  }
};

// Función para ejecutar la prueba desde la consola
if (typeof window !== 'undefined') {
  (window as any).testSupabaseFix = testSupabaseFix;
  console.log('🔧 Función testSupabaseFix() disponible en la consola');
}
