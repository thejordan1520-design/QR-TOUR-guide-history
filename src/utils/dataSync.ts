// Utilidad para sincronización de datos entre Admin Panel y Frontend
// Usa localStorage como mecanismo de comunicación
import React from 'react';

export class DataSyncManager {
  private static instance: DataSyncManager;
  private listeners: Set<() => void> = new Set();
  private readonly STORAGE_KEY = 'qr-tour-data-sync';

  private constructor() {
    // Escuchar cambios en localStorage desde otras pestañas
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  public static getInstance(): DataSyncManager {
    if (!DataSyncManager.instance) {
      DataSyncManager.instance = new DataSyncManager();
    }
    return DataSyncManager.instance;
  }

  private handleStorageChange(event: StorageEvent) {
    if (event.key === this.STORAGE_KEY && event.newValue) {
      // Notificar a todos los listeners
      this.listeners.forEach(listener => {
        try {
          listener();
        } catch (error) {
          console.error('Error in data sync listener:', error);
        }
      });
    }
  }

  // Trigger desde el Admin Panel cuando hay cambios
  public triggerSync(tableName: string, action: 'create' | 'update' | 'delete') {
    const syncData = {
      table: tableName,
      action,
      timestamp: Date.now(),
      trigger: Math.random() // Para forzar re-render
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(syncData));
      
      // También notificar listeners locales inmediatamente
      this.listeners.forEach(listener => {
        try {
          listener();
        } catch (error) {
          console.error('Error in data sync listener:', error);
        }
      });

      console.log(`DataSync: Triggered sync for ${tableName} ${action}`);
    } catch (error) {
      console.error('Error triggering data sync:', error);
    }
  }

  // Suscribirse a cambios de sincronización
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    
    // Retornar función de cleanup
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Obtener el último trigger de sincronización
  public getLastSyncTrigger(): number {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.trigger || 0;
      }
    } catch (error) {
      console.error('Error getting last sync trigger:', error);
    }
    return 0;
  }

  // Limpiar datos de sincronización
  public clearSync() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Hook para usar en componentes React
export const useDataSync = () => {
  const [syncTrigger, setSyncTrigger] = React.useState(0);
  const manager = DataSyncManager.getInstance();

  React.useEffect(() => {
    // Obtener trigger inicial
    setSyncTrigger(manager.getLastSyncTrigger());

    // Suscribirse a cambios
    const unsubscribe = manager.subscribe(() => {
      setSyncTrigger(manager.getLastSyncTrigger());
    });

    return unsubscribe;
  }, [manager]);

  return {
    syncTrigger,
    triggerSync: manager.triggerSync.bind(manager)
  };
};

