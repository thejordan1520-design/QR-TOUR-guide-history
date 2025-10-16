/**
 * SERVICIO DE SINCRONIZACIÓN EN TIEMPO REAL
 * Sincroniza cambios de orden del admin con el frontend público instantáneamente
 */

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeOrderUpdate {
  table: string;
  id: string;
  order_position: number;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  record: any;
}

export type OrderUpdateCallback = (update: RealtimeOrderUpdate) => void;

/**
 * Clase para gestionar sincronización en tiempo real de orden
 */
export class RealtimeOrderSync {
  private channels: Map<string, RealtimeChannel> = new Map();
  private callbacks: Map<string, OrderUpdateCallback[]> = new Map();

  /**
   * Suscribe a cambios de orden en una tabla específica
   */
  subscribeToOrderChanges(
    tableName: string, 
    callback: OrderUpdateCallback
  ): () => void {
    console.log(`🔔 Suscribiendo a cambios de orden en tabla: ${tableName}`);

    // Agregar callback a la lista
    const existingCallbacks = this.callbacks.get(tableName) || [];
    existingCallbacks.push(callback);
    this.callbacks.set(tableName, existingCallbacks);

    // Crear canal si no existe
    if (!this.channels.has(tableName)) {
      const channel = supabase
        .channel(`realtime-order-${tableName}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName
          },
          (payload) => {
            console.log(`🔄 Cambio detectado en ${tableName} (${payload.eventType}):`, {
              id: payload.new?.id || payload.old?.id,
              name: payload.new?.name || payload.old?.name,
              is_active: payload.new?.is_active || payload.old?.is_active,
              order_position: payload.new?.order_position || payload.old?.order_position
            });
            
            const update: RealtimeOrderUpdate = {
              table: tableName,
              id: payload.new?.id || payload.old?.id,
              order_position: payload.new?.order_position || 0,
              action: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              record: payload.new || payload.old
            };

            // Notificar a todos los callbacks
            const callbacks = this.callbacks.get(tableName) || [];
            callbacks.forEach(cb => {
              try {
                cb(update);
              } catch (error) {
                console.error(`Error en callback de ${tableName}:`, error);
              }
            });
          }
        )
        .subscribe((status) => {
          console.log(`📡 Estado de suscripción ${tableName}:`, status);
        });

      this.channels.set(tableName, channel);
    }

    // Retornar función de limpieza
    return () => {
      const callbacks = this.callbacks.get(tableName) || [];
      const updatedCallbacks = callbacks.filter(cb => cb !== callback);
      
      if (updatedCallbacks.length === 0) {
        // No hay más callbacks, eliminar canal
        const channel = this.channels.get(tableName);
        if (channel) {
          supabase.removeChannel(channel);
          this.channels.delete(tableName);
          console.log(`🔇 Canal ${tableName} eliminado`);
        }
        this.callbacks.delete(tableName);
      } else {
        this.callbacks.set(tableName, updatedCallbacks);
      }
    };
  }

  /**
   * Suscribe a múltiples tablas a la vez
   */
  subscribeToMultipleTables(
    tables: string[],
    callback: OrderUpdateCallback
  ): () => void {
    const unsubscribeFunctions = tables.map(table => 
      this.subscribeToOrderChanges(table, callback)
    );

    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }

  /**
   * Limpia todas las suscripciones
   */
  cleanup(): void {
    console.log('🧹 Limpiando todas las suscripciones de orden');
    
    this.channels.forEach((channel, tableName) => {
      supabase.removeChannel(channel);
      console.log(`🔇 Canal ${tableName} eliminado`);
    });

    this.channels.clear();
    this.callbacks.clear();
  }

  /**
   * Obtiene el estado actual de las suscripciones
   */
  getSubscriptionStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    
    this.channels.forEach((channel, tableName) => {
      status[tableName] = channel.state === 'joined';
    });

    return status;
  }
}

// Instancia singleton
export const realtimeOrderSync = new RealtimeOrderSync();

/**
 * Hook personalizado para sincronización en tiempo real
 */
export const useRealtimeOrderSync = (
  tables: string[],
  onOrderChange: OrderUpdateCallback
) => {
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef(onOrderChange);

  // Mantener siempre la última referencia al callback sin re-suscribirse
  useEffect(() => {
    callbackRef.current = onOrderChange;
  }, [onOrderChange]);

  useEffect(() => {
    const key = tables.join(',');
    console.log(`🔔 Iniciando sincronización en tiempo real para: ${key}`);
    
    const unsubscribe = realtimeOrderSync.subscribeToMultipleTables(
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
      const status = realtimeOrderSync.getSubscriptionStatus();
      const allConnected = tables.every(table => status[table]);
      setIsConnected(allConnected);
    }, 10000); // Cambiado de 3s a 10s

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
export const useTableOrderSync = (
  tableName: string,
  onOrderChange: OrderUpdateCallback
) => {
  return useRealtimeOrderSync([tableName], onOrderChange);
};

export default RealtimeOrderSync;
