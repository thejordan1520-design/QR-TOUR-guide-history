import { useState, useEffect } from 'react';
import { paymentsService } from '../supabaseServices';

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transaction_id: string;
  created_at: string;
}

export const usePayments = (userId?: string) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error } = await paymentsService.getPaymentsByUser(userId);
        
        if (error) {
          console.error('Error fetching user payments:', error);
          setError(error.message);
          setPayments([]);
        } else {
          setPayments(data || []);
          console.log('✅ User payments loaded:', data?.length || 0, 'payments');
        }
      } catch (err: any) {
        console.error('Unexpected error fetching user payments:', err);
        setError(err.message);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [userId]);

  // Función para crear nuevo pago
  const createPayment = async (paymentData: Omit<Payment, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await paymentsService.createPayment(paymentData);
      if (error) {
        console.error('Error creating payment:', error);
        return { data: null, error };
      }
      
      // Actualizar estado local
      if (data) {
        setPayments(prev => [...prev, data[0]]);
      }
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Unexpected error creating payment:', err);
      return { data: null, error: err };
    }
  };

  // Función para actualizar estado de pago
  const updatePaymentStatus = async (paymentId: string, status: string) => {
    try {
      const { data, error } = await paymentsService.updatePaymentStatus(paymentId, status);
      if (error) {
        console.error('Error updating payment status:', error);
        return { data: null, error };
      }
      
      // Actualizar estado local
      if (data) {
        setPayments(prev => 
          prev.map(payment => 
            payment.id === paymentId 
              ? { ...payment, status: data[0].status }
              : payment
          )
        );
      }
      
      return { data, error: null };
    } catch (err: any) {
      console.error('Unexpected error updating payment status:', err);
      return { data: null, error: err };
    }
  };

  return { 
    payments, 
    loading, 
    error, 
    createPayment,
    updatePaymentStatus 
  };
};
