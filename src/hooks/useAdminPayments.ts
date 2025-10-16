import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAccounting } from './useAccounting';

export interface AdminPayment {
  id: string;
  transaction_id: string;
  user_id: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  processor: string;
  created_at: string;
  updated_at: string;
  // Campos adicionales para integración con contabilidad
  subscription_plan_id?: string;
  external_payment_id?: string;
  description?: string;
}

export const useAdminPayments = () => {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hook de contabilidad para sincronización
  const { syncPaymentToTransaction } = useAccounting();

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener pagos de la tabla transactions
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) {
        throw paymentsError;
      }

      // Obtener transacciones financieras relacionadas
      const { data: financialData, error: financialError } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('transaction_type', 'income')
        .eq('category', 'subscription')
        .order('created_at', { ascending: false });

      if (financialError) {
        console.warn('Error obteniendo transacciones financieras:', financialError);
      }

      // Combinar datos de pagos con información financiera
      const enrichedPayments = (paymentsData || []).map(payment => {
        const financialTransaction = financialData?.find(ft => 
          ft.external_payment_id === payment.transaction_id ||
          ft.user_id === payment.user_id
        );

        return {
          ...payment,
          subscription_plan_id: financialTransaction?.subscription_plan_id,
          external_payment_id: financialTransaction?.external_payment_id,
          description: financialTransaction?.description
        };
      });

      setPayments(enrichedPayments);
      console.log('✅ Pagos cargados:', enrichedPayments.length);
    } catch (err) {
      console.error('❌ Error cargando pagos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = useCallback(async (paymentData: Partial<AdminPayment>) => {
    try {
      console.log('📝 Creando pago:', paymentData);
      
      // Generar IDs únicos
      const baseId = `payment-${Date.now()}`;
      const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const insertData: any = {
        id: baseId,
        transaction_id: transactionId,
        user_id: paymentData.user_id || null,
        amount: paymentData.amount || 0,
        currency: paymentData.currency || 'USD',
        status: paymentData.status || 'pending',
        payment_method: paymentData.payment_method || 'unknown',
        processor: paymentData.processor || 'manual',
        subscription_plan_id: paymentData.subscription_plan_id,
        external_payment_id: paymentData.external_payment_id,
        description: paymentData.description
      };

      const { data, error: createError } = await supabase
        .from('transactions')
        .insert([insertData])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Sincronizar con contabilidad si es un pago completado
      if (paymentData.status === 'completed' && paymentData.user_id && paymentData.subscription_plan_id) {
        try {
          await syncPaymentToTransaction(
            paymentData.user_id,
            paymentData.subscription_plan_id,
            paymentData.amount || 0,
            paymentData.payment_method || 'manual',
            transactionId,
            paymentData.description
          );
          console.log('✅ Pago sincronizado con contabilidad');
        } catch (syncError) {
          console.error('⚠️ Error sincronizando con contabilidad:', syncError);
          // No fallar la creación del pago por error de sincronización
        }
      }

      console.log('✅ Pago creado:', data);
      await fetchPayments();
      return data;
    } catch (err) {
      console.error('❌ Error creando pago:', err);
      throw err;
    }
  }, [fetchPayments, syncPaymentToTransaction]);

  const updatePayment = useCallback(async (paymentId: string, paymentData: Partial<AdminPayment>) => {
    try {
      console.log('📝 Actualizando pago:', paymentId, paymentData);

      const updateData: any = {
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status,
        payment_method: paymentData.payment_method,
        processor: paymentData.processor,
        subscription_plan_id: paymentData.subscription_plan_id,
        external_payment_id: paymentData.external_payment_id,
        description: paymentData.description
      };

      // Filtrar valores undefined
      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      const { data, error: updateError } = await supabase
        .from('transactions')
        .update(filteredUpdateData)
        .eq('id', paymentId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Si el estado cambió a 'completed', sincronizar con contabilidad
      if (paymentData.status === 'completed' && paymentData.user_id && paymentData.subscription_plan_id) {
        try {
          await syncPaymentToTransaction(
            paymentData.user_id,
            paymentData.subscription_plan_id,
            paymentData.amount || 0,
            paymentData.payment_method || 'manual',
            data.transaction_id,
            paymentData.description
          );
          console.log('✅ Pago actualizado y sincronizado con contabilidad');
        } catch (syncError) {
          console.error('⚠️ Error sincronizando actualización con contabilidad:', syncError);
        }
      }

      console.log('✅ Pago actualizado:', data);
      await fetchPayments();
      return data;
    } catch (err) {
      console.error('❌ Error actualizando pago:', err);
      throw err;
    }
  }, [fetchPayments, syncPaymentToTransaction]);

  const deletePayment = useCallback(async (paymentId: string) => {
    try {
      console.log('🗑️ Eliminando pago:', paymentId);

      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', paymentId);

      if (deleteError) {
        throw deleteError;
      }

      console.log('✅ Pago eliminado');
      await fetchPayments();
    } catch (err) {
      console.error('❌ Error eliminando pago:', err);
      throw err;
    }
  }, [fetchPayments]);

  const getPaymentStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, status, created_at');

      if (error) {
        throw error;
      }

      const stats = {
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        thisMonth: 0,
        lastMonth: 0
      };

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      data?.forEach(payment => {
        stats.total += payment.amount;
        
        if (payment.status === 'completed') {
          stats.completed += payment.amount;
        } else if (payment.status === 'pending') {
          stats.pending += payment.amount;
        } else if (payment.status === 'failed') {
          stats.failed += payment.amount;
        }

        const paymentDate = new Date(payment.created_at);
        if (paymentDate >= thisMonth) {
          stats.thisMonth += payment.amount;
        } else if (paymentDate >= lastMonth && paymentDate < thisMonth) {
          stats.lastMonth += payment.amount;
        }
      });

      return stats;
    } catch (err) {
      console.error('❌ Error obteniendo estadísticas de pagos:', err);
      throw err;
    }
  }, []);

  // Sincronizar pagos existentes con contabilidad
  const syncExistingPayments = useCallback(async () => {
    try {
      console.log('🔄 Sincronizando pagos existentes con contabilidad...');
      
      const { data: paymentsData, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'completed');

      if (error) {
        throw error;
      }

      let syncedCount = 0;
      for (const payment of paymentsData || []) {
        if (payment.user_id && payment.subscription_plan_id) {
          try {
            await syncPaymentToTransaction(
              payment.user_id,
              payment.subscription_plan_id,
              payment.amount,
              payment.payment_method,
              payment.transaction_id,
              `Pago sincronizado: ${payment.transaction_id}`
            );
            syncedCount++;
          } catch (syncError) {
            console.error(`Error sincronizando pago ${payment.id}:`, syncError);
          }
        }
      }

      console.log(`✅ ${syncedCount} pagos sincronizados con contabilidad`);
      await fetchPayments();
      return syncedCount;
    } catch (err) {
      console.error('❌ Error sincronizando pagos existentes:', err);
      throw err;
    }
  }, [fetchPayments, syncPaymentToTransaction]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
    getPaymentStats,
    syncExistingPayments
  };
};