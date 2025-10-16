import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Versión segura del hook de notificaciones admin
interface AdminNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'feedback' | 'reservation' | 'payment';
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

export const useSafeAdminNotifications = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔔 [SafeAdmin] Cargando notificaciones para admins...');
      
      // Timeout para evitar carga infinita
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout loading notifications')), 10000);
      });

      const loadPromise = supabase
        .from('notifications')
        .select('*')
        .eq('target_audience', 'admin')
        .eq('status', 'sent')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data, error: loadError } = await Promise.race([loadPromise, timeoutPromise]) as any;

      if (loadError) {
        throw loadError;
      }

      console.log(`✅ [SafeAdmin] ${data?.length || 0} notificaciones cargadas`);
      setNotifications(data || []);
      
      const unread = data?.filter((n: AdminNotification) => !n.is_read) || [];
      setUnreadCount(unread.length);
      setRetryCount(0); // Reset retry count on success
      
    } catch (error: any) {
      console.error('❌ [SafeAdmin] Error cargando notificaciones:', error);
      setError(error.message || 'Error cargando notificaciones');
      
      // Si no hemos alcanzado el máximo de reintentos, reintentar
      if (retryCount < maxRetries) {
        console.log(`🔄 [SafeAdmin] Reintentando en 3 segundos... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 3000);
      } else {
        console.warn('⚠️ [SafeAdmin] Máximo de reintentos alcanzado, usando datos vacíos');
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount, maxRetries]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ [SafeAdmin] Error marcando como leída:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ [SafeAdmin] Error marcando como leída:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) {
        console.error('❌ [SafeAdmin] Error marcando todas como leídas:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ [SafeAdmin] Error marcando todas como leídas:', error);
    }
  }, [notifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('❌ [SafeAdmin] Error eliminando notificación:', error);
        return;
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.is_read ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error('❌ [SafeAdmin] Error eliminando notificación:', error);
    }
  }, [notifications]);

  // Cargar notificaciones inicialmente
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Auto-retry si hay error
  useEffect(() => {
    if (error && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        loadNotifications();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, maxRetries, loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: loadNotifications,
    retryCount,
    maxRetries
  };
};

export default useSafeAdminNotifications;

