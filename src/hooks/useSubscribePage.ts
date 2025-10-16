import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SubscribePagePlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  popular: boolean;
  color: string;
}

interface SubscribePageData {
  plans: SubscribePagePlan[];
  loading: boolean;
  error: string | null;
  createSubscription: (planId: string, userId: string) => Promise<any>;
  createPayment: (subscriptionId: string, amount: number, method: string) => Promise<any>;
}

// Cargar planes reales desde Supabase (sin mocks)
const getPlansFromSupabase = async (): Promise<SubscribePagePlan[]> => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('is_popular', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((plan: any) => ({
    id: plan.id,
    name: plan.name,
    price: Number(plan.price ?? plan.price_usd ?? 0), // Usar price primero, luego price_usd
    duration: Number(plan.duration_hours ?? 24),
    features: Array.isArray(plan.features) ? plan.features : [],
    popular: !!plan.is_popular,
    color: plan.color || 'blue'
  }));
};

export const useSubscribePage = (t: any): SubscribePageData => {
  const [plans, setPlans] = useState<SubscribePagePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      setError(null);

      try {
        const realPlans = await getPlansFromSupabase();
        setPlans(realPlans);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [t]);

  const createSubscription = async (planId: string, userId: string) => {
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      const endTime = new Date();
      endTime.setHours(endTime.getHours() + plan.duration);

      // Crear suscripción real en user_subscriptions (RLS debe permitir vía policies o RPC)
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert([{ 
          user_id: userId || null,
          plan_id: planId,
          plan_name: plan.name,
          start_time: new Date().toISOString(),
          end_time: endTime.toISOString(),
          status: 'active',
          amount: plan.price
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  };

  const createPayment = async (subscriptionId: string, amount: number, method: string) => {
    try {
      // Registrar pago (opcional) si existe tabla payments. Como estándar, usaremos transactions
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ 
          id: `txn-${Date.now()}-${Math.random().toString(36).slice(2,10)}`,
          transaction_id: `txn_${Date.now()}`,
          order_id: subscriptionId,
          user_id: null,
          plan_id: null,
          plan_name: null,
          amount: amount,
          currency: 'USD',
          status: 'pending',
          payment_method: method,
          processor: 'paypal',
          metadata: { subscription_id: subscriptionId },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  };

  return { plans, loading, error, createSubscription, createPayment };
};
