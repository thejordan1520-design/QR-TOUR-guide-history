import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Manejo de errores robusto
const handleNotificationError = (error: any, operation: string) => {
  console.error(`❌ Error en ${operation}:`, error);
  
  // Si es un error de conexión, no propagar para evitar que afecte toda la app
  if (error?.message?.includes('connection') || 
      error?.message?.includes('network') || 
      error?.message?.includes('timeout') ||
      error?.code === 'PGRST301' ||
      error?.code === 'PGRST116') {
    console.warn(`⚠️ Error de conexión en ${operation}, continuando sin interrumpir la app`);
    return false; // Indica que no se debe propagar el error
  }
  
  return true; // Indica que se puede propagar el error
};

export interface SimpleNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'feedback' | 'reservation' | 'payment' | 'system' | 'promotion';
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
  sent_at?: string;
  scheduled_at?: string;
  target_audience: 'all' | 'admin' | 'users' | 'premium' | 'specific';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  metadata?: any;
}

export const useSimpleNotifications = () => {
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔔 [Simple] Cargando notificaciones...');
      
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Error cargando notificaciones:', error);
        if (!handleNotificationError(error, 'loadNotifications')) {
          // Error de conexión, continuar con datos vacíos
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        setError(error.message);
        return;
      }

      console.log(`✅ [Simple] ${data?.length || 0} notificaciones cargadas`);
      setNotifications(data || []);
      
      const unread = data?.filter(n => !n.is_read) || [];
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('❌ Error crítico cargando notificaciones:', error);
      if (!handleNotificationError(error, 'loadNotifications')) {
        // Error de conexión, continuar con datos vacíos
        setNotifications([]);
        setUnreadCount(0);
      } else {
        setError('Error cargando notificaciones');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribeToNotifications = useCallback(() => {
    console.log('📡 [Simple] Suscribiéndose a notificaciones en tiempo real...');

    const channel = supabase
      .channel('simple-notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_notifications'
        },
        (payload) => {
          console.log('🔔 [Simple] Cambio en notificaciones:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as SimpleNotification;
            setNotifications(prev => [newNotification, ...prev]);
            if (!newNotification.is_read) {
              setUnreadCount(prev => prev + 1);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotification = payload.new as SimpleNotification;
            setNotifications(prev =>
              prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
            );
            // Recalcular unread count
            setNotifications(prev => {
              const unread = prev.filter(n => !n.is_read);
              setUnreadCount(unread.length);
              return prev;
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setNotifications(prev => {
              const deleted = prev.find(n => n.id === deletedId);
              if (deleted && !deleted.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
              }
              return prev.filter(n => n.id !== deletedId);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 [Simple] Estado de suscripción:', status);
      });

    return () => {
      console.log('🔌 [Simple] Desconectando canal de notificaciones');
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Error marcando como leída:', error);
        return;
      }

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  const markAsUnread = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: false })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Error marcando como no leída:', error);
        return;
      }

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: false } : n)
      );
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) {
        console.error('❌ Error marcando todas como leídas:', error);
        return;
      }

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Error eliminando notificación:', error);
        return;
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.is_read ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  // Solicitar permiso para notificaciones del navegador
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('🔔 Permiso de notificaciones:', permission);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const initializeNotifications = async () => {
      try {
        if (isMounted) {
          await loadNotifications();
          await requestNotificationPermission();
          
          const cleanup = subscribeToNotifications();
          
          return cleanup;
        }
      } catch (error) {
        console.error('❌ Error inicializando notificaciones:', error);
        if (isMounted) {
          setLoading(false);
          setNotifications([]);
          setUnreadCount(0);
          setError('Error inicializando notificaciones');
        }
      }
    };
    
    const cleanup = initializeNotifications();
    
    return () => {
      isMounted = false;
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn());
      } else if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []); // Sin dependencias para evitar loops infinitos

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    refetch: loadNotifications
  };
};