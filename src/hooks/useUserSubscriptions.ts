import { useState, useEffect } from 'react';
import { userSubscriptionsService } from '../supabaseServices';

interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export const useUserSubscriptions = (userId?: string) => {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Obtener todas las suscripciones del usuario
        const { data: allSubscriptions, error: allError } = await userSubscriptionsService.getSubscriptionsByUser(userId);
        
        if (allError) {
          console.error('Error fetching user subscriptions:', allError);
          setError(allError.message);
          setSubscriptions([]);
        } else {
          setSubscriptions(allSubscriptions || []);
        }

        // Obtener suscripción activa
        const { data: active, error: activeError } = await userSubscriptionsService.getActiveSubscriptionByUser(userId);
        
        if (activeError) {
          console.log('No active subscription found:', activeError.message);
          setActiveSubscription(null);
        } else {
          setActiveSubscription(active);
        }

        console.log('✅ User subscriptions loaded:', {
          total: allSubscriptions?.length || 0,
          active: !!active
        });
      } catch (err: any) {
        console.error('Unexpected error fetching user subscriptions:', err);
        setError(err.message);
        setSubscriptions([]);
        setActiveSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [userId]);

  // Función para crear nueva suscripción
  const createSubscription = async (subscriptionData: Omit<UserSubscription, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await userSubscriptionsService.createSubscription(subscriptionData);
      if (error) {
        console.error('Error creating subscription:', error);
        return { data: null, error };
      }
      
      // Actualizar estado local
      if (data) {
        setSubscriptions(prev => [...prev, data[0]]);
        if (data[0].status === 'active') {
          setActiveSubscription(data[0]);
        }
      }
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Unexpected error creating subscription:', err);
      return { data: null, error: err };
    }
  };

  return { 
    subscriptions, 
    activeSubscription, 
    loading, 
    error, 
    createSubscription 
  };
};
