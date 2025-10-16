import { useState, useEffect, useCallback } from 'react';
import { DataSyncManager } from '../utils/dataSync';

interface SyncNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: number;
  table?: string;
  action?: 'create' | 'update' | 'delete';
}

export const useRealtimeSync = () => {
  const [notifications, setNotifications] = useState<SyncNotification[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [syncTrigger, setSyncTrigger] = useState(0);
  const manager = DataSyncManager.getInstance();

  // Función para agregar notificaciones
  const addNotification = useCallback((notification: Omit<SyncNotification, 'id' | 'timestamp'>) => {
    const newNotification: SyncNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remover notificación después de 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  // Función para remover notificación
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Función para limpiar todas las notificaciones
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Trigger sync con notificaciones
  const triggerSync = useCallback((tableName: string, action: 'create' | 'update' | 'delete') => {
    try {
      manager.triggerSync(tableName, action);
      
      // Agregar notificación de éxito
      const actionMessages = {
        create: 'creado',
        update: 'actualizado',
        delete: 'eliminado'
      };

      addNotification({
        type: 'success',
        message: `Elemento ${actionMessages[action]} en ${tableName}`,
        table: tableName,
        action
      });

      console.log(`✅ RealtimeSync: ${tableName} ${action} - Notificación enviada`);
    } catch (error) {
      console.error('❌ RealtimeSync: Error triggering sync:', error);
      addNotification({
        type: 'error',
        message: 'Error al sincronizar cambios',
        table: tableName,
        action
      });
    }
  }, [manager, addNotification]);

  // Escuchar cambios de sincronización
  useEffect(() => {
    const unsubscribe = manager.subscribe(() => {
      console.log('🔄 RealtimeSync: Cambio detectado, actualizando estado...');
      setIsConnected(true);
      setSyncTrigger(prev => prev + 1); // Incrementar trigger para notificar a otros hooks
    });

    return unsubscribe;
  }, [manager]);

  // Verificar conexión periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const lastSync = manager.getLastSyncTrigger();
      if (lastSync > 0) {
        setIsConnected(true);
      }
    }, 30000); // Verificar cada 30 segundos

    return () => clearInterval(interval);
  }, [manager]);

  return {
    notifications,
    isConnected,
    syncTrigger,
    triggerSync,
    addNotification,
    removeNotification,
    clearNotifications
  };
};
