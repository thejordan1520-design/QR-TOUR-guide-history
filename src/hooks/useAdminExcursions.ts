import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { createTranslationService } from '../services/translationService';
import { DynamicOrderManager, useOrderManager } from '../utils/dynamicOrderManager';

export interface AdminExcursion {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  location: string | null;
  phone: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  order_position: number | null;
  display_order: number | null;
}

export const useAdminExcursions = () => {
  const [excursions, setExcursions] = useState<AdminExcursion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Usar el nuevo sistema de orden dinámico
  const orderManager = useOrderManager('excursions');

  // Fetch excursions con orden dinámico
  const fetchExcursions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Obteniendo excursiones con orden dinámico...');
      
      // Usar el sistema de orden dinámico
      const orderedExcursions = await orderManager.getOrderedItems<AdminExcursion>();
      
      console.log(`✅ ${orderedExcursions.length} excursiones obtenidas con orden dinámico`);
      setExcursions(orderedExcursions);
      
    } catch (err) {
      console.error('Error fetching excursions:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar excursiones');
    } finally {
      setLoading(false);
    }
  }, [orderManager]);

  // Función para crear traducciones de excursiones
  const createExcursionTranslations = async (excursion: AdminExcursion) => {
    try {
      console.log('🌐 Creando traducciones para excursión:', excursion.name);
      
      const translationService = createTranslationService();
      
      // Generar traducciones para nombre y descripción
      const translations = await translationService.translatePlace({
        name: excursion.name,
        description: excursion.description || '',
        title: excursion.name // Usar el nombre como título también
      }, 'es');
      
      const translationsToSave = [
        // Nombre en español (original)
        { key: `excursion.${excursion.id}.name`, language: 'es', value: excursion.name },
        // Nombre en inglés
        { key: `excursion.${excursion.id}.name`, language: 'en', value: translations.name.en },
        // Nombre en francés
        { key: `excursion.${excursion.id}.name`, language: 'fr', value: translations.name.fr },
        // Descripción en español (original)
        { key: `excursion.${excursion.id}.description`, language: 'es', value: excursion.description || '' },
        // Descripción en inglés
        { key: `excursion.${excursion.id}.description`, language: 'en', value: translations.description.en },
        // Descripción en francés
        { key: `excursion.${excursion.id}.description`, language: 'fr', value: translations.description.fr },
        // Título en español (original)
        { key: `excursion.${excursion.id}.title`, language: 'es', value: excursion.name },
        // Título en inglés
        { key: `excursion.${excursion.id}.title`, language: 'en', value: translations.title?.en || translations.name.en },
        // Título en francés
        { key: `excursion.${excursion.id}.title`, language: 'fr', value: translations.title?.fr || translations.name.fr }
      ];
      
      // Guardar todas las traducciones
      const { error: translationError } = await supabase
        .from('translations')
        .insert(translationsToSave);
      
      if (translationError) {
        console.error('❌ Error guardando traducciones:', translationError);
      } else {
        console.log('✅ Traducciones creadas exitosamente para:', excursion.name);
      }
      
    } catch (err) {
      console.error('❌ Error creando traducciones:', err);
    }
  };

  // Create excursion
  const createExcursion = useCallback(async (excursionData: Partial<AdminExcursion>) => {
    try {
      console.log('🔍 Iniciando creación de excursión...');
      console.log('🔍 Datos recibidos:', excursionData);
      
      // Validar datos requeridos
      if (!excursionData.name || excursionData.name.trim() === '') {
        throw new Error('El nombre de la excursión es requerido');
      }
      
      // Generar ID único basado en el nombre si no se proporciona
      const id = excursionData.id || `excursion-${excursionData.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
      
      // Obtener la siguiente posición automáticamente
      const nextPosition = await orderManager.getNextPosition();
      
      const now = new Date().toISOString();
      const dataToInsert = {
        ...excursionData,
        id,
        name: excursionData.name.trim(),
        description: excursionData.description?.trim() || null,
        price: excursionData.price || null,
        image_url: excursionData.image_url?.trim() || null,
        location: excursionData.location?.trim() || null,
        phone: excursionData.phone?.trim() || null,
        website_url: excursionData.website_url?.trim() || null,
        created_at: now,
        updated_at: now,
        is_active: excursionData.is_active ?? true,
        order_position: nextPosition, // Usar posición automática
        display_order: excursionData.display_order ?? 0
      };
      
      console.log(`🔍 Creando excursión con posición automática: ${nextPosition}`);
      
      console.log('🔍 Datos a enviar a Supabase:', dataToInsert);
      
      const { data, error } = await supabase
        .from('excursions')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error('❌ Error de Supabase:', error);
        console.error('❌ Código:', error.code);
        console.error('❌ Mensaje:', error.message);
        console.error('❌ Detalles:', error.details);
        throw error;
      }
      
      console.log('✅ Excursión creada exitosamente con orden dinámico:', data);
      
      // Crear traducciones automáticamente
      await createExcursionTranslations(data);
      
      setExcursions(prev => [...prev, data].sort((a, b) => (a.order_position || 0) - (b.order_position || 0)));
      setError(null); // Limpiar errores previos
      
      return data;
    } catch (err) {
      console.error('❌ Error creating excursion:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al crear excursión';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [orderManager]);

  // Update excursion
  const updateExcursion = useCallback(async (id: string, excursionData: Partial<AdminExcursion>) => {
    try {
      console.log('🔍 Iniciando actualización de excursión...');
      console.log('🔍 ID:', id);
      console.log('🔍 Datos recibidos:', excursionData);
      
      // Validar datos requeridos
      if (excursionData.name !== undefined && (!excursionData.name || excursionData.name.trim() === '')) {
        throw new Error('El nombre de la excursión no puede estar vacío');
      }
      
      const now = new Date().toISOString();
      const dataToUpdate = {
        ...excursionData,
        name: excursionData.name?.trim(),
        description: excursionData.description?.trim() || null,
        price: excursionData.price || null,
        image_url: excursionData.image_url?.trim() || null,
        location: excursionData.location?.trim() || null,
        phone: excursionData.phone?.trim() || null,
        website_url: excursionData.website_url?.trim() || null,
        updated_at: now
      };
      
      console.log('🔍 Datos a enviar a Supabase:', dataToUpdate);
      
      const { data, error } = await supabase
        .from('excursions')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error de Supabase:', error);
        console.error('❌ Código:', error.code);
        console.error('❌ Mensaje:', error.message);
        console.error('❌ Detalles:', error.details);
        throw error;
      }
      
      console.log('✅ Excursión actualizada exitosamente:', data);
      setExcursions(prev => prev.map(excursion => 
        excursion.id === id ? data : excursion
      ));
      setError(null); // Limpiar errores previos
      
      return data;
    } catch (err) {
      console.error('❌ Error updating excursion:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar excursión';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Delete excursion
  const deleteExcursion = useCallback(async (id: string) => {
    try {
      console.log('🔍 Eliminando excursión:', id);
      
      const { error } = await supabase
        .from('excursions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw error;
      }
      
      console.log('✅ Excursión eliminada exitosamente');
      setExcursions(prev => prev.filter(excursion => excursion.id !== id));
      
      // Refrescar la lista después de eliminar
      setTimeout(() => {
        fetchExcursions();
      }, 100);
      
    } catch (err) {
      console.error('❌ Error deleting excursion:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar excursión';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchExcursions]);

  // Toggle excursion status
  const toggleExcursionStatus = useCallback(async (id: string) => {
    try {
      const excursion = excursions.find(e => e.id === id);
      if (!excursion) throw new Error('Excursión no encontrada');

      await updateExcursion(id, { is_active: !excursion.is_active });
    } catch (err) {
      console.error('Error toggling excursion status:', err);
      throw err;
    }
  }, [excursions, updateExcursion]);

  // Load excursions on mount
  useEffect(() => {
    fetchExcursions();
  }, [fetchExcursions]);

  // Función inteligente para manejar orden dinámico con swap automático
  const updateOrderPosition = useCallback(async (id: string, newPosition: number) => {
    try {
      console.log(`🔄 Swap dinámico en excursiones: ${id} → posición ${newPosition}`);
      
      // Usar el sistema de orden dinámico con swap automático
      const result = await orderManager.swapPosition(id, newPosition);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Refrescar la lista para mostrar el nuevo orden
      await fetchExcursions();
      
      console.log(`✅ Swap dinámico completado: ${result.message}`);
      return result;
      
    } catch (err) {
      console.error('❌ Error en swap dinámico de excursiones:', err);
      throw err;
    }
  }, [orderManager, fetchExcursions]);

  return {
    excursions,
    loading,
    error,
    fetchExcursions,
    createExcursion,
    updateExcursion,
    updateOrderPosition,
    deleteExcursion,
    toggleExcursionStatus
  };
};
