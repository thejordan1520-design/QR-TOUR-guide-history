/**
 * SISTEMA DE ORDENAMIENTO DINÁMICO PARA SUPABASE
 * Utilidades para gestión de orden con transacciones y prevención de conflictos
 */

import { supabase } from '../lib/supabase';
import { useMemo } from 'react';

export interface OrderUpdateResult {
  success: boolean;
  message: string;
  affectedItems?: number;
  newPosition?: number;
}

export interface OrderableItem {
  id: string;
  order_position: number;
  [key: string]: any;
}

/**
 * Configuración de tablas ordenables
 */
export const ORDERABLE_TABLES = {
  destinations: {
    table: 'destinations',
    orderColumn: 'order_position',
    nameColumn: 'name'
  },
  excursions: {
    table: 'excursions',
    orderColumn: 'order_position',
    nameColumn: 'name'
  },
  restaurants: {
    table: 'restaurants',
    orderColumn: 'order_position',
    nameColumn: 'name'
  },
  services: {
    table: 'services',
    orderColumn: 'order_position',
    nameColumn: 'name'
  },
  service_categories: {
    table: 'service_categories',
    orderColumn: 'order_position',
    nameColumn: 'name'
  },
  supermarkets: {
    table: 'supermarkets',
    orderColumn: 'order_position',
    nameColumn: 'name'
  }
} as const;

export type OrderableTableName = keyof typeof ORDERABLE_TABLES;

/**
 * Clase principal para gestión de ordenamiento
 */
export class DynamicOrderManager {
  
  /**
   * Obtiene la siguiente posición disponible para una tabla
   */
  static async getNextPosition(tableName: OrderableTableName): Promise<number> {
    try {
      const config = ORDERABLE_TABLES[tableName];
      
      const { data, error } = await supabase.rpc('get_next_order_position', {
        table_name: config.table,
        order_column: config.orderColumn
      });

      if (error) throw error;
      
      return data || 1;
    } catch (error) {
      console.error(`Error getting next position for ${tableName}:`, error);
      return 1;
    }
  }

  /**
   * Realiza swap dinámico de posiciones con transacción
   */
  static async swapPosition(
    tableName: OrderableTableName,
    itemId: string,
    newPosition: number
  ): Promise<OrderUpdateResult> {
    try {
      const config = ORDERABLE_TABLES[tableName];
      
      console.log(`🔄 Iniciando swap dinámico en ${tableName}: ${itemId} → posición ${newPosition}`);
      
      // Usar función SQL para swap dinámico (con transacción automática)
      const { error } = await supabase.rpc('swap_order_position', {
        table_name: config.table,
        record_id: itemId,
        new_position: newPosition,
        id_column: 'id',
        order_column: config.orderColumn
      });

      if (error) throw error;

      console.log(`✅ Swap dinámico completado en ${tableName}`);
      
      return {
        success: true,
        message: `Orden actualizado correctamente`,
        newPosition
      };

    } catch (error) {
      console.error(`❌ Error en swap dinámico ${tableName}:`, error);
      return {
        success: false,
        message: `Error al actualizar orden: ${error.message}`
      };
    }
  }

  /**
   * Compacta posiciones después de eliminación
   */
  static async compactPositions(tableName: OrderableTableName): Promise<OrderUpdateResult> {
    try {
      const config = ORDERABLE_TABLES[tableName];
      
      console.log(`🔧 Compactando posiciones en ${tableName}`);
      
      const { error } = await supabase.rpc('compact_order_positions', {
        table_name: config.table,
        order_column: config.orderColumn
      });

      if (error) throw error;

      console.log(`✅ Posiciones compactadas en ${tableName}`);
      
      return {
        success: true,
        message: 'Posiciones compactadas correctamente'
      };

    } catch (error) {
      console.error(`❌ Error compactando ${tableName}:`, error);
      return {
        success: false,
        message: `Error al compactar posiciones: ${error.message}`
      };
    }
  }

  /**
   * Reordena completamente una tabla
   */
  static async reorderTable(tableName: OrderableTableName): Promise<OrderUpdateResult> {
    try {
      const config = ORDERABLE_TABLES[tableName];
      
      console.log(`🔄 Reordenando tabla completa: ${tableName}`);
      
      const { error } = await supabase.rpc('reorder_positions', {
        table_name: config.table,
        id_column: 'id',
        order_column: config.orderColumn
      });

      if (error) throw error;

      console.log(`✅ Tabla reordenada: ${tableName}`);
      
      return {
        success: true,
        message: 'Tabla reordenada correctamente'
      };

    } catch (error) {
      console.error(`❌ Error reordenando ${tableName}:`, error);
      return {
        success: false,
        message: `Error al reordenar tabla: ${error.message}`
      };
    }
  }

  /**
   * Obtiene elementos ordenados de una tabla
   */
  static async getOrderedItems<T = OrderableItem>(
    tableName: OrderableTableName,
    selectColumns: string = '*'
  ): Promise<T[]> {
    try {
      const config = ORDERABLE_TABLES[tableName];
      
      const { data, error } = await supabase
        .from(config.table)
        .select(selectColumns)
        .order(config.orderColumn, { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return data || [];

    } catch (error) {
      console.error(`❌ Error obteniendo elementos ordenados de ${tableName}:`, error);
      return [];
    }
  }

  /**
   * Valida que no existan duplicados en una tabla
   */
  static async validateNoDuplicates(tableName: OrderableTableName): Promise<boolean> {
    try {
      const config = ORDERABLE_TABLES[tableName];
      
      const { data, error } = await supabase
        .from(config.table)
        .select(`${config.orderColumn}, count(*)`)
        .group(config.orderColumn)
        .having('count(*)', 'gt', 1);

      if (error) throw error;
      
      const hasDuplicates = data && data.length > 0;
      
      if (hasDuplicates) {
        console.warn(`⚠️ Duplicados encontrados en ${tableName}:`, data);
        return false;
      }
      
      return true;

    } catch (error) {
      console.error(`❌ Error validando duplicados en ${tableName}:`, error);
      return false;
    }
  }

  /**
   * Mueve múltiples elementos en lote
   */
  static async batchMove(
    tableName: OrderableTableName,
    moves: Array<{ id: string; newPosition: number }>
  ): Promise<OrderUpdateResult> {
    try {
      console.log(`🔄 Movimiento en lote para ${tableName}:`, moves);
      
      // Ejecutar movimientos secuencialmente para evitar conflictos
      for (const move of moves) {
        const result = await this.swapPosition(tableName, move.id, move.newPosition);
        if (!result.success) {
          throw new Error(result.message);
        }
      }

      return {
        success: true,
        message: `${moves.length} elementos reordenados correctamente`,
        affectedItems: moves.length
      };

    } catch (error) {
      console.error(`❌ Error en movimiento en lote ${tableName}:`, error);
      return {
        success: false,
        message: `Error en movimiento en lote: ${error.message}`
      };
    }
  }

  /**
   * Obtiene estadísticas de orden de una tabla
   */
  static async getOrderStats(tableName: OrderableTableName) {
    try {
      const config = ORDERABLE_TABLES[tableName];
      
      const { data, error } = await supabase
        .from(config.table)
        .select(`
          count(*) as total,
          min(${config.orderColumn}) as min_position,
          max(${config.orderColumn}) as max_position
        `)
        .single();

      if (error) throw error;
      
      const isValid = await this.validateNoDuplicates(tableName);
      
      return {
        ...data,
        has_duplicates: !isValid,
        is_continuous: data.max_position === data.total
      };

    } catch (error) {
      console.error(`❌ Error obteniendo estadísticas de ${tableName}:`, error);
      return null;
    }
  }
}

/**
 * Hook personalizado para gestión de orden en React
 */
export const useOrderManager = (tableName: OrderableTableName) => {
  return useMemo(() => {
    const swapPosition = async (itemId: string, newPosition: number) => {
      return await DynamicOrderManager.swapPosition(tableName, itemId, newPosition);
    };

    const getNextPosition = async () => {
      return await DynamicOrderManager.getNextPosition(tableName);
    };

    const compactPositions = async () => {
      return await DynamicOrderManager.compactPositions(tableName);
    };

    const reorderTable = async () => {
      return await DynamicOrderManager.reorderTable(tableName);
    };

    const getOrderedItems = async <T = OrderableItem>(selectColumns?: string) => {
      return await DynamicOrderManager.getOrderedItems<T>(tableName, selectColumns);
    };

    const validateNoDuplicates = async () => {
      return await DynamicOrderManager.validateNoDuplicates(tableName);
    };

    const getOrderStats = async () => {
      return await DynamicOrderManager.getOrderStats(tableName);
    };

    return {
      swapPosition,
      getNextPosition,
      compactPositions,
      reorderTable,
      getOrderedItems,
      validateNoDuplicates,
      getOrderStats
    };
  }, [tableName]);
};

export default DynamicOrderManager;
