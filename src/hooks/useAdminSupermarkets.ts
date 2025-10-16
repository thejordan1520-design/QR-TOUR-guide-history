import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { createTranslationService } from '../services/translationService';
import { useOrderManager } from '../utils/dynamicOrderManager';

export interface AdminSupermarket {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  phone: number | null;
  phone_display: string | null;
  website_url: string | null;
  image_url: string | null;
  category: string | null;
  rating: number;
  opening_hours: string | null;
  schedule: any | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  display_order: number;
  order_position: number;
}

export const useAdminSupermarkets = () => {
  const [supermarkets, setSupermarkets] = useState<AdminSupermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Usar el nuevo sistema de orden dinámico
  const orderManager = useOrderManager('supermarkets');

  const fetchSupermarkets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Obteniendo supermercados con orden dinámico...');
      
      // Usar el sistema de orden dinámico
      const orderedSupermarkets = await orderManager.getOrderedItems<AdminSupermarket>();
      
      console.log(`✅ ${orderedSupermarkets.length} supermercados obtenidos con orden dinámico`);
      setSupermarkets(orderedSupermarkets);
      
    } catch (err) {
      console.error('❌ Error fetching supermarkets:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar supermercados');
    } finally {
      setLoading(false);
    }
  }, [orderManager]);

  const createSupermarket = async (supermarketData: Partial<AdminSupermarket>) => {
    try {
      console.log('🛒 Creando supermercado:', supermarketData);
      
      // Generar ID único basado en el nombre
      const baseId = supermarketData.name?.toLowerCase().replace(/\s+/g, '-') || 'supermarket';
      const uniqueId = `supermarket-${baseId}-${Date.now()}`;
      
      const supermarketToCreate = {
        id: uniqueId,
        name: supermarketData.name?.trim() || '',
        description: supermarketData.description?.trim() || null,
        location: supermarketData.location?.trim() || null,
        phone: supermarketData.phone || null,
        phone_display: supermarketData.phone_display?.trim() || null,
        website_url: supermarketData.website_url?.trim() || null,
        image_url: supermarketData.image_url?.trim() || null,
        category: supermarketData.category?.trim() || null,
        rating: supermarketData.rating || 0,
        opening_hours: supermarketData.opening_hours?.trim() || null,
        schedule: supermarketData.schedule || null,
        latitude: supermarketData.latitude || null,
        longitude: supermarketData.longitude || null,
        is_active: supermarketData.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_order: supermarketData.display_order || 999,
        order_position: supermarketData.order_position || 0
      };

      const { data, error } = await supabase
        .from('supermarkets')
        .insert(supermarketToCreate)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando supermercado:', error);
        throw error;
      }

      console.log('✅ Supermercado creado:', data);
      
      // Crear traducciones automáticamente
      if (data && (supermarketData.name || supermarketData.description)) {
        await createSupermarketTranslations(data);
      }
      
      // Refrescar la lista
      await fetchSupermarkets();
      
      return data;
    } catch (err) {
      console.error('❌ Error creating supermarket:', err);
      throw err;
    }
  };

  const updateSupermarket = async (id: string, updates: Partial<AdminSupermarket>) => {
    try {
      console.log('🛒 Actualizando supermercado:', id, updates);
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('supermarkets')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando supermercado:', error);
        throw error;
      }

      console.log('✅ Supermercado actualizado:', data);
      
      // Actualizar traducciones si es necesario
      if (data && (updates.name || updates.description)) {
        await createSupermarketTranslations(data);
      }
      
      // Refrescar la lista
      await fetchSupermarkets();
      
      return data;
    } catch (err) {
      console.error('❌ Error updating supermarket:', err);
      throw err;
    }
  };

  const deleteSupermarket = async (id: string) => {
    try {
      console.log('🛒 Eliminando supermercado:', id);
      
      const { error } = await supabase
        .from('supermarkets')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error eliminando supermercado:', error);
        throw error;
      }

      console.log('✅ Supermercado eliminado');
      
      // Eliminar traducciones relacionadas
      await supabase
        .from('translations')
        .delete()
        .like('key', `supermarket.${id}.%`);
      
      // Refrescar la lista
      setTimeout(() => fetchSupermarkets(), 100);
      
    } catch (err) {
      console.error('❌ Error deleting supermarket:', err);
      throw err;
    }
  };

  const toggleSupermarketStatus = async (id: string) => {
    try {
      const supermarket = supermarkets.find(s => s.id === id);
      if (!supermarket) throw new Error('Supermercado no encontrado');

      const newStatus = !supermarket.is_active;
      console.log(`🛒 Cambiando estado del supermercado ${id} a ${newStatus ? 'activo' : 'inactivo'}`);

      const { error } = await supabase
        .from('supermarkets')
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error cambiando estado:', error);
        throw error;
      }

      console.log('✅ Estado cambiado exitosamente');
      await fetchSupermarkets();
    } catch (err) {
      console.error('❌ Error toggling supermarket status:', err);
      throw err;
    }
  };

  // Función para crear traducciones automáticas
  const createSupermarketTranslations = async (supermarket: AdminSupermarket) => {
    try {
      console.log('🌐 Creando traducciones para supermercado:', supermarket.name);
      
      const translationService = createTranslationService();
      
      // Crear objeto de lugar para traducir
      const placeToTranslate = {
        name: supermarket.name,
        description: supermarket.description || '',
        title: supermarket.name // Usar el nombre como título también
      };

      // Obtener traducciones
      const translations = await translationService.translatePlace(placeToTranslate, 'es');
      
      // Guardar traducciones en la base de datos
      const translationsToSave = [
        // Traducciones de nombre
        { key: `supermarket.${supermarket.id}.name`, language: 'es', value: translations.name.es },
        { key: `supermarket.${supermarket.id}.name`, language: 'en', value: translations.name.en },
        { key: `supermarket.${supermarket.id}.name`, language: 'fr', value: translations.name.fr },
        
        // Traducciones de descripción (solo si existe)
        ...(supermarket.description ? [
          { key: `supermarket.${supermarket.id}.description`, language: 'es', value: translations.description.es },
          { key: `supermarket.${supermarket.id}.description`, language: 'en', value: translations.description.en },
          { key: `supermarket.${supermarket.id}.description`, language: 'fr', value: translations.description.fr }
        ] : []),
        
        // Traducciones de título
        { key: `supermarket.${supermarket.id}.title`, language: 'es', value: translations.title?.es || translations.name.es },
        { key: `supermarket.${supermarket.id}.title`, language: 'en', value: translations.title?.en || translations.name.en },
        { key: `supermarket.${supermarket.id}.title`, language: 'fr', value: translations.title?.fr || translations.name.fr }
      ];

      // Insertar traducciones
      const { error: translationError } = await supabase
        .from('translations')
        .upsert(translationsToSave);

      if (translationError) {
        console.error('❌ Error guardando traducciones:', translationError);
      } else {
        console.log(`✅ ${translationsToSave.length} traducciones guardadas`);
      }
      
    } catch (err) {
      console.error('❌ Error creating supermarket translations:', err);
    }
  };

  // Función inteligente para manejar orden dinámico con swap automático
  const updateOrderPosition = useCallback(async (id: string, newPosition: number) => {
    try {
      console.log(`🔄 Swap dinámico en supermercados: ${id} → posición ${newPosition}`);
      
      // Usar el sistema de orden dinámico con swap automático
      const result = await orderManager.swapPosition(id, newPosition);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Refrescar la lista para mostrar el nuevo orden
      await fetchSupermarkets();
      
      console.log(`✅ Swap dinámico completado: ${result.message}`);
      return result;
      
    } catch (err) {
      console.error('❌ Error en swap dinámico de supermercados:', err);
      throw err;
    }
  }, [orderManager, fetchSupermarkets]);

  // Cargar supermercados al montar el componente
  useEffect(() => {
    fetchSupermarkets();
  }, [fetchSupermarkets]);

  return {
    supermarkets,
    loading,
    error,
    createSupermarket,
    updateSupermarket,
    updateOrderPosition,
    deleteSupermarket,
    toggleSupermarketStatus,
    refetch: fetchSupermarkets
  };
};



