/**
 * SERVICIO DE SINCRONIZACIÓN EN TIEMPO REAL EXTENDIDO
 * Sincroniza cambios de orden Y ratings del admin con el frontend público instantáneamente
 */

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeDataUpdate {
  table: string;
  id: string;
  order_position?: number;
  rating?: number;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  record: any;
  changedFields: string[];
}

export type DataUpdateCallback = (update: RealtimeDataUpdate) => void;

/**
 * Clase para gestionar sincronización en tiempo real de datos (orden + ratings + otros campos)
 */
export class RealtimeDataSync {
  private channels: Map<string, RealtimeChannel> = new Map();
  private callbacks: Map<string, DataUpdateCallback[]> = new Map();

  /**
   * Suscribe a cambios de datos en una tabla específica
   */
  subscribeToDataChanges(
    tableName: string, 
    callback: DataUpdateCallback
  ): () => void {
    console.log(`🔔 Suscribiendo a cambios de datos en tabla: ${tableName}`);

    // Agregar callback a la lista
    const existingCallbacks = this.callbacks.get(tableName) || [];
    existingCallbacks.push(callback);
    this.callbacks.set(tableName, existingCallbacks);

    // Crear canal si no existe
    if (!this.channels.has(tableName)) {
      const channel = supabase
        .channel(`realtime-data-${tableName}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName
          },
          (payload) => {
            console.log(`📡 Cambio detectado en ${tableName}:`, {
              eventType: payload.eventType,
              id: payload.new?.id || payload.old?.id,
              newData: payload.new,
              oldData: payload.old
            });

            // Determinar qué campos cambiaron
            const changedFields: string[] = [];
            if (payload.eventType === 'INSERT') {
              // Para INSERT, todos los campos son "nuevos"
              changedFields.push('all');
            } else if (payload.eventType === 'UPDATE') {
              // Para UPDATE, comparar campos específicos
              const oldData = payload.old || {};
              const newData = payload.new || {};
              
              // Campos importantes a monitorear
              const importantFields = ['order_position', 'rating', 'is_active', 'name', 'description'];
              
              importantFields.forEach(field => {
                if (oldData[field] !== newData[field]) {
                  changedFields.push(field);
                }
              });
            } else if (payload.eventType === 'DELETE') {
              changedFields.push('deleted');
            }

            // Crear objeto de actualización
            const update: RealtimeDataUpdate = {
              table: tableName,
              id: payload.new?.id || payload.old?.id,
              order_position: payload.new?.order_position,
              rating: payload.new?.rating,
              action: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              record: payload.new || payload.old,
              changedFields
            };

            // Notificar a todos los callbacks
            const callbacks = this.callbacks.get(tableName) || [];
            callbacks.forEach(cb => {
              try {
                cb(update);
              } catch (error) {
                console.error('Error en callback de sincronización:', error);
              }
            });
          }
        )
        .subscribe((status) => {
          console.log(`📡 Estado de suscripción para ${tableName}:`, status);
        });

      this.channels.set(tableName, channel);
    }

    // Retornar función de limpieza
    return () => {
      console.log(`🔕 Desuscribiendo de cambios en tabla: ${tableName}`);
      
      // Remover callback
      const callbacks = this.callbacks.get(tableName) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        this.callbacks.set(tableName, callbacks);
      }

      // Si no hay más callbacks, cerrar canal
      if (callbacks.length === 0) {
        const channel = this.channels.get(tableName);
        if (channel) {
          supabase.removeChannel(channel);
          this.channels.delete(tableName);
        }
      }
    };
  }

  /**
   * Suscribe a múltiples tablas
   */
  subscribeToMultipleTables(
    tableNames: string[],
    callback: DataUpdateCallback
  ): () => void {
    console.log(`🔔 Suscribiendo a múltiples tablas: ${tableNames.join(', ')}`);

    const unsubscribers = tableNames.map(tableName => 
      this.subscribeToDataChanges(tableName, callback)
    );

    return () => {
      console.log(`🔕 Desuscribiendo de múltiples tablas: ${tableNames.join(', ')}`);
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }

  /**
   * Obtener estado de suscripciones
   */
  getSubscriptionStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    
    this.channels.forEach((channel, tableName) => {
      status[tableName] = channel.state === 'SUBSCRIBED';
    });

    return status;
  }

  /**
   * Limpiar todas las suscripciones
   */
  cleanup(): void {
    console.log('🧹 Limpiando todas las suscripciones de sincronización');
    
    this.channels.forEach((channel, tableName) => {
      supabase.removeChannel(channel);
    });
    
    this.channels.clear();
    this.callbacks.clear();
  }
}

// Instancia singleton
export const realtimeDataSync = new RealtimeDataSync();

/**
 * Hook personalizado para sincronización en tiempo real de datos
 */
export const useRealtimeDataSync = (
  tables: string[],
  onDataChange: DataUpdateCallback
) => {
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef(onDataChange);

  // Mantener siempre la última referencia al callback sin re-suscribirse
  useEffect(() => {
    callbackRef.current = onDataChange;
  }, [onDataChange]);

  useEffect(() => {
    const key = tables.join(',');
    console.log(`🔔 Iniciando sincronización de datos en tiempo real para: ${key}`);
    
    const unsubscribe = realtimeDataSync.subscribeToMultipleTables(
      tables,
      (update) => {
        try {
          callbackRef.current(update);
          setIsConnected(true);
        } catch (e) {
          console.error('Realtime callback error:', e);
        }
      }
    );

    // Verificar estado de conexión (menos frecuente para evitar saturación)
    const checkConnection = setInterval(() => {
      const status = realtimeDataSync.getSubscriptionStatus();
      const allConnected = tables.every(table => status[table]);
      setIsConnected(allConnected);
    }, 10000); // 10 segundos

    return () => {
      unsubscribe();
      clearInterval(checkConnection);
      setIsConnected(false);
    };
  }, [tables.join(',')]);

  return { isConnected };
};

/**
 * Hook para sincronización de una sola tabla
 */
export const useTableDataSync = (
  tableName: string,
  onDataChange: DataUpdateCallback
) => {
  return useRealtimeDataSync([tableName], onDataChange);
};

/**
 * Hook específico para sincronización de ratings
 */
export const useRatingSync = (
  tables: string[],
  onRatingChange: (table: string, id: string, newRating: number) => void
) => {
  return useRealtimeDataSync(tables, (update) => {
    if (update.changedFields.includes('rating') && update.rating !== undefined) {
      console.log(`⭐ Rating actualizado en ${update.table}:`, {
        id: update.id,
        newRating: update.rating
      });
      onRatingChange(update.table, update.id, update.rating);
    }
  });
};

/**
 * Hook específico para sincronización de orden
 */
export const useOrderSync = (
  tables: string[],
  onOrderChange: (table: string, id: string, newOrder: number) => void
) => {
  return useRealtimeDataSync(tables, (update) => {
    if (update.changedFields.includes('order_position') && update.order_position !== undefined) {
      console.log(`📋 Orden actualizado en ${update.table}:`, {
        id: update.id,
        newOrder: update.order_position
      });
      onOrderChange(update.table, update.id, update.order_position);
    }
  });
};







