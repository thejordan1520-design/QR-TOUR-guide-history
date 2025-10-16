import { useState, useEffect, useCallback } from 'react';
import notificationsService, { SystemNotification } from '../services/notificationsService';

export interface UseNotificationsReturn {
  notifications: SystemNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const useNotifications = (userId?: string): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      console.log('useNotifications: No userId provided, skipping load');
      setNotifications([]);
      setLoading(false);
      return;
    }

    console.log('useNotifications: Loading notifications for userId:', userId);
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: loadError } = await notificationsService.getUserNotifications(userId, 1, 20);
      
      if (loadError) {
        setError('Error al cargar notificaciones');
        console.error('Error loading notifications:', loadError);
        return;
      }
      
      console.log('useNotifications: Loaded notifications:', data?.length || 0);
      setNotifications(data || []);
    } catch (err) {
      setError('Error al cargar notificaciones');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadUnreadCount = useCallback(async () => {
    if (!userId) {
      console.log('useNotifications: No userId for unread count');
      setUnreadCount(0);
      return;
    }

    console.log('useNotifications: Loading unread count for userId:', userId);
    try {
      const { count, error: countError } = await notificationsService.getUnreadCount(userId);
      
      if (countError) {
        console.error('Error loading unread count:', countError);
        return;
      }
      
      console.log('useNotifications: Unread count:', count);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      
      // Actualizar estado local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Error al marcar notificación como leída');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Error al marcar todas las notificaciones como leídas');
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      
      // Remover notificación de la lista local
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      // Actualizar contador si la notificación no estaba leída
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Error al eliminar notificación');
    }
  }, [notifications]);

  const refreshNotifications = useCallback(async () => {
    await Promise.all([loadNotifications(), loadUnreadCount()]);
  }, [loadNotifications, loadUnreadCount]);

  // Cargar notificaciones iniciales
  useEffect(() => {
    refreshNotifications();
  }, [userId]);

  // Suscribirse a nuevas notificaciones en tiempo real
  useEffect(() => {
    if (!userId) return;

    const subscription = notificationsService.subscribeToNotifications((notification) => {
      console.log('🔔 Nueva notificación recibida:', notification);
      
      // Agregar nueva notificación al inicio de la lista
      setNotifications(prev => [notification, ...prev]);
      
      // Incrementar contador de no leídas si es relevante para el usuario
      if (!notification.is_read) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  // Suscribirse a actualizaciones de notificaciones
  useEffect(() => {
    if (!userId) return;

    const subscription = notificationsService.subscribeToNotificationUpdates((notification) => {
      console.log('🔄 Notificación actualizada:', notification);
      
      // Actualizar notificación en la lista
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notification.id ? notification : notif
        )
      );
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  };
};

export default useNotifications;
