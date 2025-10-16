import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AccountingTransaction {
  id: string;
  transaction_id: string;
  order_id: string | null;
  user_id: string | null;
  plan_id: string | null;
  plan_name: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  processor: string;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface AccountingPlan {
  id: string;
  plan_key: string;
  name: string;
  description: string;
  price: number;
  price_usd: number;
  discount_percentage: string;
  discount_amount: number | null;
  credits: number;
  duration_days: number;
  features: Record<string, any>;
  benefits: Record<string, any> | null;
  is_active: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountingReport {
  id: string;
  name: string;
  type: 'revenue' | 'expenses' | 'profit' | 'custom';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  data: Record<string, any>;
  created_at: string;
}

export const useAdminAccounting = () => {
  const [transactions, setTransactions] = useState<AccountingTransaction[]>([]);
  const [plans, setPlans] = useState<AccountingPlan[]>([]);
  const [reports, setReports] = useState<AccountingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching transactions:', error);
        throw error;
      }

      console.log('✅ Transactions fetched:', data?.length || 0);
      setTransactions(data || []);
    } catch (err) {
      console.error('❌ Error in fetchTransactions:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching plans:', error);
        throw error;
      }

      console.log('✅ Plans fetched:', data?.length || 0);
      setPlans(data || []);
    } catch (err) {
      console.error('❌ Error in fetchPlans:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      // Simular datos de reportes (en un caso real, se obtendrían de la base de datos)
      const mockReports: AccountingReport[] = [
        {
          id: 'report-1',
          name: 'Reporte de Ingresos - Septiembre 2025',
          type: 'revenue',
          period: 'monthly',
          start_date: '2025-09-01',
          end_date: '2025-09-30',
          data: {
            total_revenue: 1250.00,
            transaction_count: 25,
            average_transaction: 50.00,
            top_plan: 'Acceso 24 Horas',
            revenue_by_plan: {
              'Acceso 24 Horas': 800.00,
              'Acceso Semanal': 450.00
            }
          },
          created_at: new Date().toISOString()
        },
        {
          id: 'report-2',
          name: 'Reporte de Gastos - Septiembre 2025',
          type: 'expenses',
          period: 'monthly',
          start_date: '2025-09-01',
          end_date: '2025-09-30',
          data: {
            total_expenses: 450.00,
            categories: {
              'Servicios': 200.00,
              'Marketing': 150.00,
              'Infraestructura': 100.00
            }
          },
          created_at: new Date().toISOString()
        },
        {
          id: 'report-3',
          name: 'Reporte de Utilidades - Septiembre 2025',
          type: 'profit',
          period: 'monthly',
          start_date: '2025-09-01',
          end_date: '2025-09-30',
          data: {
            total_revenue: 1250.00,
            total_expenses: 450.00,
            net_profit: 800.00,
            profit_margin: 64.0
          },
          created_at: new Date().toISOString()
        }
      ];

      console.log('✅ Reports loaded:', mockReports.length);
      setReports(mockReports);
    } catch (err) {
      console.error('❌ Error in fetchReports:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, []);

  const createTransaction = useCallback(async (transactionData: Partial<AccountingTransaction>) => {
    try {
      console.log('📝 Creating transaction:', transactionData);
      
      const transactionToCreate = {
        id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        transaction_id: transactionData.transaction_id || `txn_${Date.now()}`,
        order_id: transactionData.order_id || null,
        user_id: transactionData.user_id || null,
        plan_id: transactionData.plan_id || null,
        plan_name: transactionData.plan_name || null,
        amount: transactionData.amount || 0,
        currency: transactionData.currency || 'USD',
        status: transactionData.status || 'pending',
        payment_method: transactionData.payment_method || 'credit_card',
        processor: transactionData.processor || 'stripe',
        metadata: transactionData.metadata || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionToCreate)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating transaction:', error);
        throw error;
      }

      console.log('✅ Transaction created:', data);
      
      // Refrescar la lista
      await fetchTransactions();
      
      return data;
    } catch (err) {
      console.error('❌ Error creating transaction:', err);
      throw err;
    }
  }, [fetchTransactions]);

  const updateTransaction = useCallback(async (id: string, transactionData: Partial<AccountingTransaction>) => {
    try {
      console.log('✏️ Updating transaction:', id, transactionData);
      
      const updateData = {
        ...transactionData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating transaction:', error);
        throw error;
      }

      console.log('✅ Transaction updated:', data);
      
      // Refrescar la lista
      await fetchTransactions();
      
      return data;
    } catch (err) {
      console.error('❌ Error updating transaction:', err);
      throw err;
    }
  }, [fetchTransactions]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      console.log('🗑️ Deleting transaction:', id);
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting transaction:', error);
        throw error;
      }

      console.log('✅ Transaction deleted');
      
      // Refrescar la lista
      await fetchTransactions();
    } catch (err) {
      console.error('❌ Error deleting transaction:', err);
      throw err;
    }
  }, [fetchTransactions]);

  const createReport = useCallback(async (reportData: Partial<AccountingReport>) => {
    try {
      console.log('📊 Creating report:', reportData);
      
      const newReport: AccountingReport = {
        id: `report-${Date.now()}`,
        name: reportData.name || 'Nuevo Reporte',
        type: reportData.type || 'custom',
        period: reportData.period || 'monthly',
        start_date: reportData.start_date || new Date().toISOString().split('T')[0],
        end_date: reportData.end_date || new Date().toISOString().split('T')[0],
        data: reportData.data || {},
        created_at: new Date().toISOString()
      };

      setReports(prev => [newReport, ...prev]);
      
      console.log('✅ Report created:', newReport.id);
      return newReport;
    } catch (err) {
      console.error('❌ Error creating report:', err);
      throw err;
    }
  }, []);

  const getAccountingStats = useCallback(() => {
    const totalTransactions = transactions.length;
    const totalRevenue = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    const failedTransactions = transactions.filter(t => t.status === 'failed').length;
    
    const totalPlans = plans.length;
    const activePlans = plans.filter(p => p.is_active).length;
    
    const totalReports = reports.length;
    
    // Calcular estadísticas por período
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthTransactions = transactions.filter(t => 
      new Date(t.created_at) >= thisMonth
    );
    const thisMonthRevenue = thisMonthTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      transactions: {
        total: totalTransactions,
        pending: pendingTransactions,
        completed: completedTransactions,
        failed: failedTransactions
      },
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue
      },
      plans: {
        total: totalPlans,
        active: activePlans
      },
      reports: {
        total: totalReports
      }
    };
  }, [transactions, plans, reports]);

  const exportTransactions = useCallback(async (format: 'json' | 'csv' = 'json') => {
    try {
      console.log('📤 Exporting transactions in', format, 'format');
      
      if (format === 'json') {
        const dataStr = JSON.stringify(transactions, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `transactions_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      } else if (format === 'csv') {
        const headers = ['ID', 'Transaction ID', 'User ID', 'Amount', 'Currency', 'Status', 'Payment Method', 'Processor', 'Description', 'Created At'];
        const csvContent = [
          headers.join(','),
          ...transactions.map(txn => [
            txn.id,
            txn.transaction_id,
            txn.user_id || '',
            txn.amount,
            txn.currency,
            txn.status,
            txn.payment_method,
            txn.processor,
            `"${(txn.description || '').replace(/"/g, '""')}"`,
            txn.created_at
          ].join(','))
        ].join('\n');
        
        const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
        const exportFileDefaultName = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      }
      
      console.log('✅ Transactions exported successfully');
    } catch (err) {
      console.error('❌ Error exporting transactions:', err);
      throw err;
    }
  }, [transactions]);

  useEffect(() => {
    fetchTransactions();
    fetchPlans();
    fetchReports();
  }, [fetchTransactions, fetchPlans, fetchReports]);

  return {
    transactions,
    plans,
    reports,
    loading,
    error,
    fetchTransactions,
    fetchPlans,
    fetchReports,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    createReport,
    getAccountingStats,
    exportTransactions,
    refetch: () => {
      fetchTransactions();
      fetchPlans();
      fetchReports();
    }
  };
};
