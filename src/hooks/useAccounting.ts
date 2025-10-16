import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface FinancialTransaction {
  id: string;
  transaction_type: 'income' | 'expense' | 'refund' | 'commission';
  category: string;
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  user_id?: string;
  subscription_plan_id?: string;
  payment_method?: string;
  external_payment_id?: string;
  tax_amount: number;
  commission_amount: number;
  net_amount: number;
  transaction_date: string;
  due_date?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface FinancialCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  description?: string;
  is_active: boolean;
  parent_category_id?: string;
  created_at: string;
}

export interface FinancialStats {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  transaction_count: number;
  avg_transaction_amount: number;
}

export interface IncomeByPeriod {
  period_start: string;
  period_end: string;
  total_amount: number;
  transaction_count: number;
}

export interface Budget {
  id: string;
  name: string;
  description?: string;
  category: string;
  budget_amount: number;
  spent_amount: number;
  currency: string;
  period_start: string;
  period_end: string;
  is_active: boolean;
  alert_threshold: number;
  created_at: string;
  updated_at: string;
}

export const useAccounting = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar transacciones financieras
  const fetchTransactions = useCallback(async (filters?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    category?: string;
    status?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('transaction_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('transaction_date', filters.endDate);
      }
      if (filters?.type) {
        query = query.eq('transaction_type', filters.type);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setTransactions(data || []);
      console.log('✅ Transacciones financieras cargadas:', data?.length || 0);
    } catch (err) {
      console.error('❌ Error cargando transacciones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar categorías financieras
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('financial_categories')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setCategories(data || []);
      console.log('✅ Categorías financieras cargadas:', data?.length || 0);
    } catch (err) {
      console.error('❌ Error cargando categorías:', err);
    }
  }, []);

  // Cargar presupuestos
  const fetchBudgets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setBudgets(data || []);
      console.log('✅ Presupuestos cargados:', data?.length || 0);
    } catch (err) {
      console.error('❌ Error cargando presupuestos:', err);
    }
  }, []);

  // Obtener estadísticas financieras
  const getFinancialStats = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      const { data, error } = await supabase.rpc('calculate_financial_stats', {
        p_start_date: startDate || null,
        p_end_date: endDate || null
      });

      if (error) {
        throw error;
      }

      return data?.[0] as FinancialStats || {
        total_income: 0,
        total_expenses: 0,
        net_profit: 0,
        transaction_count: 0,
        avg_transaction_amount: 0
      };
    } catch (err) {
      console.error('❌ Error obteniendo estadísticas:', err);
      throw err;
    }
  }, []);

  // Obtener ingresos por período
  const getIncomeByPeriod = useCallback(async (
    startDate: string,
    endDate: string,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ) => {
    try {
      const { data, error } = await supabase.rpc('get_income_by_period', {
        p_start_date: startDate,
        p_end_date: endDate,
        p_group_by: groupBy
      });

      if (error) {
        throw error;
      }

      return data as IncomeByPeriod[] || [];
    } catch (err) {
      console.error('❌ Error obteniendo ingresos por período:', err);
      throw err;
    }
  }, []);

  // Crear nueva transacción
  const createTransaction = useCallback(async (transactionData: Partial<FinancialTransaction>) => {
    try {
      console.log('📝 Creando transacción financiera:', transactionData);

      const insertData: any = {
        transaction_type: transactionData.transaction_type || 'income',
        category: transactionData.category || 'Otros',
        description: transactionData.description || 'Sin descripción',
        amount: transactionData.amount || 0,
        currency: transactionData.currency || 'USD',
        status: transactionData.status || 'completed',
        user_id: transactionData.user_id,
        subscription_plan_id: transactionData.subscription_plan_id,
        payment_method: transactionData.payment_method,
        external_payment_id: transactionData.external_payment_id,
        tax_amount: transactionData.tax_amount || 0,
        commission_amount: transactionData.commission_amount || 0,
        net_amount: transactionData.net_amount || transactionData.amount || 0,
        transaction_date: transactionData.transaction_date || new Date().toISOString(),
        due_date: transactionData.due_date,
        notes: transactionData.notes,
        tags: transactionData.tags || []
      };

      const { data, error: createError } = await supabase
        .from('financial_transactions')
        .insert([insertData])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      console.log('✅ Transacción creada:', data);
      await fetchTransactions();
      return data;
    } catch (err) {
      console.error('❌ Error creando transacción:', err);
      throw err;
    }
  }, [fetchTransactions]);

  // Sincronizar pago con transacción financiera
  const syncPaymentToTransaction = useCallback(async (
    userId: string,
    planId: string,
    amount: number,
    paymentMethod: string,
    externalPaymentId: string,
    description?: string
  ) => {
    try {
      console.log('💰 Sincronizando pago con transacción:', {
        userId, planId, amount, paymentMethod, externalPaymentId, description
      });

      const { data, error } = await supabase.rpc('sync_payment_to_transaction', {
        p_user_id: userId,
        p_plan_id: planId,
        p_amount: amount,
        p_payment_method: paymentMethod,
        p_external_payment_id: externalPaymentId,
        p_description: description || null
      });

      if (error) {
        throw error;
      }

      console.log('✅ Pago sincronizado con transacción:', data);
      await fetchTransactions();
      return data;
    } catch (err) {
      console.error('❌ Error sincronizando pago:', err);
      throw err;
    }
  }, [fetchTransactions]);

  // Crear presupuesto
  const createBudget = useCallback(async (budgetData: Partial<Budget>) => {
    try {
      console.log('📝 Creando presupuesto:', budgetData);

      const insertData: any = {
        name: budgetData.name || 'Sin nombre',
        description: budgetData.description,
        category: budgetData.category || 'General',
        budget_amount: budgetData.budget_amount || 0,
        spent_amount: budgetData.spent_amount || 0,
        currency: budgetData.currency || 'USD',
        period_start: budgetData.period_start || new Date().toISOString(),
        period_end: budgetData.period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: budgetData.is_active !== undefined ? budgetData.is_active : true,
        alert_threshold: budgetData.alert_threshold || 80
      };

      const { data, error: createError } = await supabase
        .from('budgets')
        .insert([insertData])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      console.log('✅ Presupuesto creado:', data);
      await fetchBudgets();
      return data;
    } catch (err) {
      console.error('❌ Error creando presupuesto:', err);
      throw err;
    }
  }, [fetchBudgets]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchTransactions(),
        fetchCategories(),
        fetchBudgets()
      ]);
    };

    loadInitialData();
  }, [fetchTransactions, fetchCategories, fetchBudgets]);

  return {
    transactions,
    categories,
    budgets,
    loading,
    error,
    fetchTransactions,
    fetchCategories,
    fetchBudgets,
    getFinancialStats,
    getIncomeByPeriod,
    createTransaction,
    syncPaymentToTransaction,
    createBudget
  };
};







