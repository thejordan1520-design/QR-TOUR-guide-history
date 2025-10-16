import { useState, useEffect } from 'react';
import { emergencyNotificationService } from '../services/emergencyNotificationService';

// Hook de emergencia que siempre funciona sin depender de Supabase
interface EmergencyNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'feedback' | 'reservation' | 'payment';
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

export const useEmergencyNotifications = () => {
  const [notifications, setNotifications] = useState<EmergencyNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      // Reducir logs para evitar spam en consola
      
      // Obtener notificaciones del servicio de emergencia
      const emergencyNotifications = emergencyNotificationService.getNotifications();
      const unreadCount = emergencyNotificationService.getUnreadCount();
      
      setNotifications(emergencyNotifications);
      setUnreadCount(unreadCount);
      
      // Solo loggear una vez al cargar inicialmente
      console.log('✅ [Emergency] Notificaciones cargadas:', emergencyNotifications.length);
    } catch (error: any) {
      console.error('❌ [Emergency] Error cargando notificaciones:', error);
      setError(error.message);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      emergencyNotificationService.markAsRead(notificationId);
      setNotifications(emergencyNotificationService.getNotifications());
      setUnreadCount(emergencyNotificationService.getUnreadCount());
      // Reducir logs para evitar spam
    } catch (error) {
      console.error('❌ [Emergency] Error marcando como leída:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      emergencyNotificationService.deleteNotification(notificationId);
      setNotifications(emergencyNotificationService.getNotifications());
      setUnreadCount(emergencyNotificationService.getUnreadCount());
      // Reducir logs para evitar spam
    } catch (error) {
      console.error('❌ [Emergency] Error eliminando notificación:', error);
    }
  };

  // Cargar notificaciones inmediatamente y suscribirse a cambios
  useEffect(() => {
    loadNotifications();
    
    // Suscribirse a cambios en el servicio (solo una vez)
    const unsubscribe = emergencyNotificationService.subscribe((newNotifications) => {
      setNotifications(prev => {
        // Solo actualizar si realmente hay cambios para evitar loops infinitos
        if (JSON.stringify(prev) !== JSON.stringify(newNotifications)) {
          setUnreadCount(emergencyNotificationService.getUnreadCount());
          return [...newNotifications];
        }
        return prev;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []); // Array de dependencias vacío para ejecutar solo una vez

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    deleteNotification,
    refetch: loadNotifications
  };
};

export default useEmergencyNotifications;
