import { plansTableSetup } from '../services/plansTableSetup';
import { supabase } from '../lib/supabase';

export interface TestResult {
  success: boolean;
  message: string;
  details: any;
}

/**
 * Prueba completa del sistema de planes
 */
export const testPlansCreation = async (): Promise<TestResult> => {
  try {
    console.log('🧪 [TestPlansCreation] Iniciando prueba completa del sistema de planes...');

    // 1. Verificar configuración de tabla
    console.log('📋 [TestPlansCreation] Verificando configuración de tabla...');
    const isConfigured = await plansTableSetup.verifyTableSetup();
    
    if (!isConfigured) {
      console.log('🔧 [TestPlansCreation] Configurando tabla automáticamente...');
      const setupResult = await plansTableSetup.setupPlansTable();
      
      if (!setupResult.success) {
        return {
          success: false,
          message: 'Error configurando tabla: ' + setupResult.message,
          details: setupResult
        };
      }
    }

    // 2. Crear un plan de prueba
    console.log('📝 [TestPlansCreation] Creando plan de prueba...');
    const testPlanData = {
      name: 'Plan de Prueba Automática',
      description: 'Plan creado automáticamente para verificar el sistema',
      price: 25.00,
      currency: 'USD',
      duration_days: 30,
      duration_hours: 720,
      is_active: true,
      is_popular: false,
      color: 'green',
      paypal_link: 'https://paypal.com/test',
      plan_key: 'test_plan_auto',
      price_usd: 25.00,
      discount_percentage: '10',
      credits: 200,
      features: ['Acceso completo', 'Soporte 24/7', 'Sin anuncios'],
      benefits: ['Descarga offline', 'Contenido premium', 'Actualizaciones automáticas']
    };

    const { data: createdPlan, error: createError } = await supabase
      .from('subscription_plans')
      .insert([testPlanData])
      .select()
      .single();

    if (createError) {
      return {
        success: false,
        message: 'Error creando plan de prueba: ' + createError.message,
        details: createError
      };
    }

    console.log('✅ [TestPlansCreation] Plan creado exitosamente:', createdPlan);

    // 3. Verificar que el plan se puede leer
    console.log('🔍 [TestPlansCreation] Verificando lectura del plan...');
    const { data: retrievedPlan, error: readError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', createdPlan.id)
      .single();

    if (readError) {
      return {
        success: false,
        message: 'Error leyendo plan: ' + readError.message,
        details: readError
      };
    }

    // 4. Actualizar el plan
    console.log('📝 [TestPlansCreation] Actualizando plan de prueba...');
    const { data: updatedPlan, error: updateError } = await supabase
      .from('subscription_plans')
      .update({ 
        name: 'Plan de Prueba Actualizado',
        price: 30.00,
        credits: 250
      })
      .eq('id', createdPlan.id)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        message: 'Error actualizando plan: ' + updateError.message,
        details: updateError
      };
    }

    // 5. Eliminar el plan de prueba
    console.log('🗑️ [TestPlansCreation] Eliminando plan de prueba...');
    const { error: deleteError } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', createdPlan.id);

    if (deleteError) {
      return {
        success: false,
        message: 'Error eliminando plan: ' + deleteError.message,
        details: deleteError
      };
    }

    console.log('🎉 [TestPlansCreation] Prueba completada exitosamente');

    return {
      success: true,
      message: 'Sistema de planes funcionando correctamente. Todas las operaciones CRUD funcionan.',
      details: {
        createdPlan,
        retrievedPlan,
        updatedPlan,
        testOperations: ['CREATE', 'READ', 'UPDATE', 'DELETE']
      }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ [TestPlansCreation] Error en prueba:', error);
    
    return {
      success: false,
      message: 'Error en prueba: ' + errorMessage,
      details: error
    };
  }
};

/**
 * Prueba rápida de conectividad con Supabase
 */
export const testSupabaseConnection = async (): Promise<TestResult> => {
  try {
    console.log('🔌 [TestPlansCreation] Probando conexión con Supabase...');
    
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('id')
      .limit(1);

    if (error) {
      return {
        success: false,
        message: 'Error de conexión: ' + error.message,
        details: error
      };
    }

    return {
      success: true,
      message: 'Conexión con Supabase exitosa',
      details: { data }
    };

  } catch (error) {
    return {
      success: false,
      message: 'Error de conexión: ' + (error instanceof Error ? error.message : 'Error desconocido'),
      details: error
    };
  }
};

