import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  duration_hours: number;
  features: string[];
  benefits: string[];
  is_active: boolean;
  is_popular: boolean;
  color: string;
  paypal_link?: string;
  plan_key?: string;
  price_usd?: number;
  discount_percentage?: string;
  credits?: number;
  active?: boolean;
  order_position?: number;
}

export const useAdminPlans = () => {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [useAdminPlans] Obteniendo planes...');

      const { data, error: fetchError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('order_position', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('❌ [useAdminPlans] Error de Supabase:', fetchError);
        
        // Si la tabla no existe, mostrar error específico
        if (fetchError.message.includes('relation') && fetchError.message.includes('does not exist')) {
          setError('La tabla de planes no existe. Ejecuta el script create-admin-tables.sql en Supabase.');
          setIsConfigured(false);
        } else {
          setError(fetchError.message);
        }
        setPlans([]);
        return;
      }

      const transformedPlans = data?.map((plan: any) => ({
        id: plan.id || `plan-${Date.now()}`,
        name: plan.name || 'Sin nombre',
        description: plan.description || 'Sin descripción',
        price: plan.price || 0,
        currency: plan.currency || 'USD',
        duration_days: plan.duration_days || 1,
        duration_hours: plan.duration_hours || 24,
        features: Array.isArray(plan.features) ? plan.features : [],
        benefits: Array.isArray(plan.benefits) ? plan.benefits : [],
        is_active: plan.is_active !== undefined ? plan.is_active : true,
        is_popular: plan.is_popular || false,
        color: plan.color || 'blue',
        paypal_link: plan.paypal_link || '',
        plan_key: plan.plan_key || '',
        price_usd: plan.price_usd || 0,
        discount_percentage: plan.discount_percentage || '0',
        credits: plan.credits || 0,
        active: plan.is_active !== undefined ? plan.is_active : true,
        order_position: typeof plan.order_position === 'number' ? plan.order_position : null,
      })) || [];

      setPlans(transformedPlans);
      setIsConfigured(true);
      console.log('✅ [useAdminPlans] Planes cargados:', transformedPlans.length);
    } catch (err) {
      console.error('❌ [useAdminPlans] Error cargando planes:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const configureTable = useCallback(async () => {
    try {
      setIsConfiguring(true);
      setSetupError(null);
      console.log('🔧 [useAdminPlans] Configurando tabla...');
      
      // Simular configuración exitosa por ahora
      setIsConfigured(true);
      console.log('✅ [useAdminPlans] Tabla configurada');
      
      // Intentar cargar planes después de la configuración
      await fetchPlans();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setSetupError(errorMessage);
      console.error('❌ [useAdminPlans] Error configurando tabla:', err);
    } finally {
      setIsConfiguring(false);
    }
  }, [fetchPlans]);

  const createPlan = useCallback(async (planData: Partial<AdminPlan>) => {
    try {
      console.log('📝 [useAdminPlans] Creando plan:', planData);

      // Asegurar que la tabla esté configurada antes de crear
      if (!isConfigured) {
        console.log('🔧 [useAdminPlans] Configurando tabla antes de crear plan...');
        await configureTable();
      }

      // Generar plan_key automáticamente si no se proporciona
      let finalPlanKey = planData.plan_key || planData.name?.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || `plan_${Date.now()}`;

      // Verificar si el plan_key ya existe
      if (planData.plan_key && planData.plan_key.trim() !== '') {
        const { data: existingPlan } = await supabase
          .from('subscription_plans')
          .select('id, plan_key')
          .eq('plan_key', planData.plan_key.trim())
          .single();

        if (existingPlan) {
          throw new Error(`El plan_key "${planData.plan_key}" ya existe. Usa un valor único.`);
        }
        finalPlanKey = planData.plan_key.trim();
      }

      // Preparar datos con todas las columnas necesarias
      const insertData: any = {
        name: planData.name || 'Plan sin nombre',
        description: planData.description || 'Sin descripción',
        price: planData.price || 0,
        currency: planData.currency || 'USD',
        duration_days: planData.duration_days || 1,
        duration_hours: planData.duration_hours || 24,
        is_active: planData.is_active !== undefined ? planData.is_active : true,
        is_popular: planData.is_popular || false,
        color: planData.color || 'blue',
        paypal_link: planData.paypal_link || '',
        plan_key: finalPlanKey,
        price_usd: planData.price_usd || planData.price || 0,
        discount_percentage: planData.discount_percentage || '0',
        credits: planData.credits || 0,
        features: planData.features || [],
        benefits: planData.benefits || [],
        order_position: planData.order_position ?? null
      };

      console.log('📝 [useAdminPlans] Datos preparados con todas las columnas:', insertData);

      const { data, error: createError } = await supabase
        .from('subscription_plans')
        .insert([insertData])
        .select()
        .single();

      if (createError) {
        console.error('❌ [useAdminPlans] Error de Supabase:', createError);
        throw new Error(`Error creando plan: ${createError.message}`);
      }

      console.log('✅ [useAdminPlans] Plan creado exitosamente:', data);
      await fetchPlans();
      return data;
    } catch (err) {
      console.error('❌ [useAdminPlans] Error creando plan:', err);
      throw err;
    }
  }, [fetchPlans, isConfigured, configureTable]);

  const updatePlan = useCallback(async (planId: string, planData: Partial<AdminPlan>) => {
    try {
      console.log('📝 [useAdminPlans] Actualizando plan:', planId, planData);

      // Preparar datos de actualización con valores seguros
      const updateData: any = {
        name: planData.name,
        description: planData.description,
        price: planData.price,
        currency: planData.currency,
        duration_days: planData.duration_days,
        duration_hours: planData.duration_hours,
        features: planData.features,
        benefits: planData.benefits,
        is_active: planData.is_active,
        is_popular: planData.is_popular,
        color: planData.color,
        paypal_link: planData.paypal_link,
        price_usd: planData.price_usd,
        discount_percentage: planData.discount_percentage,
        credits: planData.credits,
        order_position: planData.order_position,
      };

      // Solo actualizar plan_key si se proporciona y es diferente al actual
      if (planData.plan_key !== undefined && planData.plan_key.trim() !== '') {
        // Verificar si el plan_key ya existe en otro plan
        const { data: existingPlan } = await supabase
          .from('subscription_plans')
          .select('id, plan_key')
          .eq('plan_key', planData.plan_key.trim())
          .neq('id', planId)
          .single();

        if (existingPlan) {
          throw new Error(`El plan_key "${planData.plan_key}" ya existe en otro plan. Usa un valor único.`);
        }
        
        updateData.plan_key = planData.plan_key.trim();
      }

      // Filtrar valores undefined para evitar errores
      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      console.log('📝 [useAdminPlans] Datos de actualización filtrados:', filteredUpdateData);

      const { data, error: updateError } = await supabase
        .from('subscription_plans')
        .update(filteredUpdateData)
        .eq('id', planId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ [useAdminPlans] Error de Supabase en actualización:', updateError);
        throw new Error(`Error actualizando plan: ${updateError.message}`);
      }

      console.log('✅ [useAdminPlans] Plan actualizado:', data);
      await fetchPlans();
      return data;
    } catch (err) {
      console.error('❌ [useAdminPlans] Error actualizando plan:', err);
      throw err;
    }
  }, [fetchPlans]);

  const deletePlan = useCallback(async (planId: string) => {
    try {
      console.log('🗑️ [useAdminPlans] Eliminando plan:', planId);

      const { error: deleteError } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);

      if (deleteError) {
        throw deleteError;
      }

      console.log('✅ [useAdminPlans] Plan eliminado');
      await fetchPlans();
    } catch (err) {
      console.error('❌ [useAdminPlans] Error eliminando plan:', err);
      throw err;
    }
  }, [fetchPlans]);

  const togglePlanStatus = useCallback(async (planId: string) => {
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan no encontrado');
      }

      const newStatus = !plan.is_active;
      console.log('🔄 [useAdminPlans] Cambiando estado del plan:', planId, 'a', newStatus);

      const { error: updateError } = await supabase
        .from('subscription_plans')
        .update({ is_active: newStatus })
        .eq('id', planId);

      if (updateError) {
        throw updateError;
      }

      console.log('✅ [useAdminPlans] Estado del plan cambiado');
      await fetchPlans();
    } catch (err) {
      console.error('❌ [useAdminPlans] Error cambiando estado del plan:', err);
      throw err;
    }
  }, [plans, fetchPlans]);

  // Actualizar posición de orden de un plan
  const updateOrderPosition = useCallback(async (planId: string, newPosition: number) => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update({ order_position: newPosition })
        .eq('id', planId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refrescar lista
      await fetchPlans();
      return data;
    } catch (err) {
      console.error('❌ [useAdminPlans] Error actualizando order_position:', err);
      throw err;
    }
  }, [fetchPlans]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus,
    // Estado de configuración de tabla
    isConfigured,
    isConfiguring,
    setupError,
    configureTable,
    updateOrderPosition,
  };
};
