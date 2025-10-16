import { supabase } from '../lib/supabase';

export interface PayPalTransaction {
  id: string;
  paypal_transaction_id: string;
  paypal_order_id: string;
  paypal_capture_id?: string;
  user_id?: string;
  user_email: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed';
  paypal_details?: any;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface UserSubscription {
  id: string;
  user_id?: string;
  user_email: string;
  plan_id: string;
  plan_name: string;
  plan_type: 'free' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  expires_at: string;
  payment_method?: string;
  payment_transaction_id?: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  duration_days: number;
  duration_hours: number;
  features: string[];
  benefits: string[];
  is_active: boolean;
  is_popular: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentStats {
  totalTransactions: number;
  totalRevenue: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  todayTransactions: number;
}

export class PaymentsService {
  /**
   * Obtener todos los planes de suscripción
   */
  static async getSubscriptionPlans(): Promise<{ data: SubscriptionPlan[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price');

      return { data, error };
    } catch (error) {
      console.error('Error obteniendo planes de suscripción:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener plan específico por ID
   */
  static async getPlanById(planId: string): Promise<{ data: SubscriptionPlan | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error obteniendo plan:', error);
      return { data: null, error };
    }
  }

  /**
   * Verificar si un usuario tiene plan premium activo
   */
  static async isUserPremium(userEmail: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('is_user_premium', { user_email: userEmail });

      if (error) {
        console.error('Error verificando estado premium:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error verificando estado premium:', error);
      return false;
    }
  }

  /**
   * Obtener información del plan del usuario
   */
  static async getUserPlanInfo(userEmail: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_plan_info', { user_email: userEmail });

      return { data, error };
    } catch (error) {
      console.error('Error obteniendo información del plan:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener suscripción activa del usuario
   */
  static async getUserActiveSubscription(userEmail: string): Promise<{ data: UserSubscription | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_email', userEmail)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error obteniendo suscripción activa:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener historial de transacciones del usuario
   */
  static async getUserTransactions(userEmail: string): Promise<{ data: PayPalTransaction[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('paypal_transactions')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error obteniendo transacciones del usuario:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener todas las transacciones (admin)
   */
  static async getAllTransactions(page = 1, limit = 50): Promise<{ data: PayPalTransaction[] | null; error: any; count: number }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('paypal_transactions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      return { data, error, count: count || 0 };
    } catch (error) {
      console.error('Error obteniendo todas las transacciones:', error);
      return { data: null, error, count: 0 };
    }
  }

  /**
   * Obtener todas las suscripciones (admin)
   */
  static async getAllSubscriptions(page = 1, limit = 50): Promise<{ data: UserSubscription[] | null; error: any; count: number }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      return { data, error, count: count || 0 };
    } catch (error) {
      console.error('Error obteniendo todas las suscripciones:', error);
      return { data: null, error, count: 0 };
    }
  }

  /**
   * Obtener estadísticas de pagos (admin)
   */
  static async getPaymentStats(): Promise<{ data: PaymentStats | null; error: any }> {
    try {
      // Obtener estadísticas de transacciones
      const { data: transactions, error: transactionsError } = await supabase
        .from('paypal_transactions')
        .select('status, amount, currency, created_at');

      if (transactionsError) {
        return { data: null, error: transactionsError };
      }

      // Calcular estadísticas
      const today = new Date().toISOString().split('T')[0];
      const stats: PaymentStats = {
        totalTransactions: transactions?.length || 0,
        totalRevenue: transactions
          ?.filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0,
        completedPayments: transactions?.filter(t => t.status === 'completed').length || 0,
        pendingPayments: transactions?.filter(t => t.status === 'pending').length || 0,
        failedPayments: transactions?.filter(t => t.status === 'failed').length || 0,
        todayTransactions: transactions?.filter(t => t.created_at.startsWith(today)).length || 0
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error obteniendo estadísticas de pagos:', error);
      return { data: null, error };
    }
  }

  /**
   * Verificar estado de pago por order ID
   */
  static async getPaymentStatus(orderId: string): Promise<{ data: PayPalTransaction | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('paypal_transactions')
        .select('*')
        .eq('paypal_order_id', orderId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error obteniendo estado de pago:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener webhooks de PayPal (admin)
   */
  static async getPayPalWebhooks(page = 1, limit = 50): Promise<{ data: any[] | null; error: any; count: number }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('paypal_webhooks')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      return { data, error, count: count || 0 };
    } catch (error) {
      console.error('Error obteniendo webhooks de PayPal:', error);
      return { data: null, error, count: 0 };
    }
  }

  /**
   * Cancelar suscripción de usuario (admin)
   */
  static async cancelUserSubscription(userEmail: string): Promise<{ data: UserSubscription | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('user_email', userEmail)
        .eq('status', 'active')
        .select()
        .single();

      // También actualizar tabla users
      await supabase
        .from('users')
        .update({
          plan_type: 'free',
          plan_expires_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('email', userEmail);

      return { data, error };
    } catch (error) {
      console.error('Error cancelando suscripción:', error);
      return { data: null, error };
    }
  }

  /**
   * Extender suscripción de usuario (admin)
   */
  static async extendUserSubscription(userEmail: string, additionalDays: number): Promise<{ data: UserSubscription | null; error: any }> {
    try {
      // Obtener suscripción activa
      const { data: activeSubscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_email', userEmail)
        .eq('status', 'active')
        .single();

      if (fetchError || !activeSubscription) {
        return { data: null, error: 'No se encontró suscripción activa' };
      }

      // Calcular nueva fecha de expiración
      const currentExpiry = new Date(activeSubscription.expires_at);
      const newExpiry = new Date(currentExpiry.getTime() + (additionalDays * 24 * 60 * 60 * 1000));

      // Actualizar suscripción
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          end_date: newExpiry.toISOString(),
          expires_at: newExpiry.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', activeSubscription.id)
        .select()
        .single();

      // También actualizar tabla users
      await supabase
        .from('users')
        .update({
          plan_expires_at: newExpiry.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('email', userEmail);

      return { data, error };
    } catch (error) {
      console.error('Error extendiendo suscripción:', error);
      return { data: null, error };
    }
  }
}
