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

export interface AdminNotification {
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

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔔 [Admin] Cargando notificaciones para admins...');
      
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error cargando notificaciones admin:', error);
        if (!handleNotificationError(error, 'loadNotifications')) {
          // Error de conexión, continuar con datos vacíos
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        return;
      }

      console.log(`✅ [Admin] ${data?.length || 0} notificaciones cargadas`);
      setNotifications(data || []);
      
      const unread = data?.filter(n => !n.is_read) || [];
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('❌ Error crítico cargando notificaciones:', error);
      if (!handleNotificationError(error, 'loadNotifications')) {
        // Error de conexión, continuar con datos vacíos
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribeToNotifications = useCallback(() => {
    console.log('📡 [Admin] Suscribiéndose a notificaciones en tiempo real...');

    const channel = supabase
      .channel('admin-notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: 'target_audience=eq.admin'
        },
        (payload) => {
          console.log('🔔 [Admin] Nueva notificación recibida:', payload);
          const newNotification = payload.new as AdminNotification;
          
          if (newNotification.status === 'sent') {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Mostrar notificación nativa del navegador
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(newNotification.title, {
                body: newNotification.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: newNotification.id
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 [Admin] Estado de suscripción:', status);
      });

    return () => {
      console.log('🔌 [Admin] Desconectando canal de notificaciones');
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
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

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
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
        .from('notifications')
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

  // Funciones adicionales requeridas por el componente Notifications.tsx
  const createNotification = async (notificationData: Partial<AdminNotification>) => {
    try {
      console.log('🔔 [Admin] Creando nueva notificación:', notificationData);
      
      const { data, error } = await supabase
        .from('admin_notifications')
        .insert([{
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type || 'info',
          target_audience: notificationData.target_audience || 'all',
          status: notificationData.status || 'draft',
          action_url: notificationData.action_url,
          metadata: notificationData.metadata,
          is_read: false
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando notificación:', error);
        throw error;
      }

      console.log('✅ [Admin] Notificación creada:', data);
      await loadNotifications(); // Recargar la lista
      return data;
    } catch (error) {
      console.error('❌ Error crítico creando notificación:', error);
      throw error;
    }
  };

  const updateNotification = async (id: string, notificationData: Partial<AdminNotification>) => {
    try {
      console.log('🔔 [Admin] Actualizando notificación:', id, notificationData);
      
      const { data, error } = await supabase
        .from('admin_notifications')
        .update({
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          target_audience: notificationData.target_audience,
          status: notificationData.status,
          action_url: notificationData.action_url,
          metadata: notificationData.metadata
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando notificación:', error);
        throw error;
      }

      console.log('✅ [Admin] Notificación actualizada:', data);
      await loadNotifications(); // Recargar la lista
      return data;
    } catch (error) {
      console.error('❌ Error crítico actualizando notificación:', error);
      throw error;
    }
  };

  const sendNotification = async (id: string) => {
    try {
      console.log('🔔 [Admin] Enviando notificación:', id);
      
      const { data, error } = await supabase
        .from('admin_notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error enviando notificación:', error);
        throw error;
      }

      console.log('✅ [Admin] Notificación enviada:', data);
      await loadNotifications(); // Recargar la lista
      return data;
    } catch (error) {
      console.error('❌ Error crítico enviando notificación:', error);
      throw error;
    }
  };

  const scheduleNotification = async (id: string, scheduleDate: string) => {
    try {
      console.log('🔔 [Admin] Programando notificación:', id, scheduleDate);
      
      const { data, error } = await supabase
        .from('admin_notifications')
        .update({
          status: 'scheduled',
          scheduled_at: scheduleDate
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error programando notificación:', error);
        throw error;
      }

      console.log('✅ [Admin] Notificación programada:', data);
      await loadNotifications(); // Recargar la lista
      return data;
    } catch (error) {
      console.error('❌ Error crítico programando notificación:', error);
      throw error;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error: null, // Agregado para compatibilidad con el componente
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    updateNotification,
    sendNotification,
    scheduleNotification,
    refetch: loadNotifications
  };
};
