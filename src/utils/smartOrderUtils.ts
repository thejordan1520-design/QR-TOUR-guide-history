/**
 * Utilidad inteligente para manejar conflictos de orden automáticamente
 * Evita duplicados de números de orden y reorganiza elementos automáticamente
 */

import { supabase } from '../lib/supabase';

export interface SmartOrderUpdate<T> {
  success: boolean;
  moved?: string;
  newPosition?: number;
  result?: T;
}

/**
 * Maneja conflictos de orden de manera inteligente
 * @param tableName - Nombre de la tabla en Supabase
 * @param items - Array de elementos actuales
 * @param id - ID del elemento a actualizar
 * @param newPosition - Nueva posición deseada
 * @param orderField - Campo de orden (order_position, display_order, etc.)
 * @param nameField - Campo nombre para logs
 * @param updateFn - Función de actualización básica
 */
export const handleOrderConflict = async <T extends { id: string; [key: string]: any }>(
  tableName: string,
  items: T[],
  id: string,
  newPosition: number,
  orderField: string,
  nameField: string,
  updateFn: (id: string, data: any) => Promise<T>
): Promise<SmartOrderUpdate<T>> => {
  try {
    // Obtener todos los elementos ordenados por la posición
    const allItemsSorted = [...items].sort((a, b) => ((a[orderField] as number) || 0) - ((b[orderField] as number) || 0));
    
    // Verificar si hay conflicto
    const conflictingItem = allItemsSorted.find(item => 
      (item[orderField] as number) === newPosition && item.id !== id
    );
    
    if (!conflictingItem) {
      // No hay conflicto, actualizar directamente
      console.log(`✅ Posición ${newPosition} disponible para ${tableName}`);
      const result = await updateFn(id, { [orderField]: newPosition });
      return { success: true, result };
    }
    
    console.log(`🔄 Conflicto detectado en ${tableName}: posición ${newPosition} ocupada por "${conflictingItem[nameField]}"`);
    
    // Determinar nueva posición para el elemento en conflicto
    let nextPosition = newPosition + 1;
    
    // Encontrar la siguiente posición disponible
    while (allItemsSorted.some(item => (item[orderField] as number) === nextPosition && item.id !== conflictingItem.id)) {
      nextPosition++;
    }
    
    // Actualizar ambos elementos: el que cambiamos y el que se mueve automáticamente
    const updates = [
      updateFn(id, { [orderField]: newPosition }),
      updateFn(conflictingItem.id, { [orderField]: nextPosition })
    ];
    
    await Promise.all(updates);
    
    console.log(`✅ Reordenamiento automático de ${tableName}: "${conflictingItem[nameField]}" movido a posición ${nextPosition}`);
    
    return { 
      success: true, 
      moved: conflictingItem[nameField] as string, 
      newPosition: nextPosition 
    };
  } catch (err) {
    console.error(`❌ Error manejando conflicto de orden en ${tableName}:`, err);
    throw err;
  }
};

/**
 * Valida que una posición sea válida para el array dado
 */
export const validatePosition = (position: number, totalItems: number): boolean => {
  return position > 0 && position <= totalItems && !isNaN(position);
};

/**
 * Limpia estado de orden después de una actualización exitosa
 */
export const clearOrderingState = (ordering: { [id: string]: number }, itemId: string) => {
  const newOrdering = { ... ordering };
  delete newOrdering[itemId];
  return newOrdering;
};
