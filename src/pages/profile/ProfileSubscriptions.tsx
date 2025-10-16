import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { subscriptionPlansService, transactionsService } from '../../supabaseServices';

const ProfileSubscriptions: React.FC = () => {
  const { token, user } = useAuth();
  const [subs, setSubs] = useState<Array<{plan:string;start:string;end:string;amount:number;status:string}>>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        setLoading(true);
        
        // Intentar cargar desde Supabase primero
        if (user?.id) {
          const { data: transactions, error } = await transactionsService.getTransactionsByUser(user.id.toString());
          
          if (!error && transactions) {
            // Convertir transacciones a formato de suscripciones
            const subscriptions = transactions.map(transaction => ({
              plan: transaction.plan_id || 'Plan Semanal',
              start: new Date(transaction.created_at).toISOString().split('T')[0],
              end: new Date(new Date(transaction.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días después
              amount: transaction.amount || 0,
              status: transaction.status || 'active'
            }));
            setSubs(subscriptions);
            setLoading(false);
            return;
          }
        }
        
        // Fallback a API local
        const response = await axios.get<{plan:string;start:string;end:string;amount:number;status:string}[]>('/api/user/subscriptions', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setSubs(response.data);
      } catch (error) {
        console.error('Error loading subscriptions:', error);
        // Datos de ejemplo para demostración
        setSubs([
          { plan: 'Plan Semanal', start: '2024-01-01', end: '2024-01-31', amount: 9.99, status: 'active' },
          { plan: 'Basic', start: '2023-12-01', end: '2023-12-31', amount: 4.99, status: 'expired' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, [token, user]);

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">{t('profile_subscriptions_history_title')}</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th>{t('profile_subscriptions_history_plan')}</th><th>{t('profile_subscriptions_history_start')}</th><th>{t('profile_subscriptions_history_end')}</th><th>{t('profile_subscriptions_history_amount')}</th><th>{t('profile_subscriptions_history_status')}</th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s, i) => (
            <tr key={i} className="border-b">
              <td>{s.plan}</td>
              <td>{s.start}</td>
              <td>{s.end}</td>
              <td>${s.amount}</td>
              <td>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProfileSubscriptions;
