import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { createTranslationService } from '../services/translationService';
import { useOrderManager } from '../utils/dynamicOrderManager';

export interface AdminRestaurant {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  phone_display: string | null;
  email: string | null;
  website: string | null;
  website_url: string | null;
  image_url: string | null;
  cuisine_type: string | null;
  price_range: string | null;
  rating: number;
  opening_hours: string | null;
  hours: string | null;
  latitude: number | null;
  longitude: number | null;
  location: any | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  display_order: number;
  order_position: number;
}

export const useAdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Usar el nuevo sistema de orden dinámico
  const orderManager = useOrderManager('restaurants');

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Obteniendo restaurantes con orden dinámico...');
      
      // Usar el sistema de orden dinámico
      const orderedRestaurants = await orderManager.getOrderedItems<AdminRestaurant>();
      
      console.log(`✅ ${orderedRestaurants.length} restaurantes obtenidos con orden dinámico`);
      setRestaurants(orderedRestaurants);
      
    } catch (err) {
      console.error('❌ Error fetching restaurants:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
    } finally {
      setLoading(false);
    }
  }, [orderManager]);

  const createRestaurant = async (restaurantData: Partial<AdminRestaurant>) => {
    try {
      console.log('🍽️ Creando restaurante:', restaurantData);
      
      // Generar ID único basado en el nombre
      const baseId = restaurantData.name?.toLowerCase().replace(/\s+/g, '-') || 'restaurant';
      const uniqueId = `restaurant-${baseId}-${Date.now()}`;
      
      const restaurantToCreate = {
        id: uniqueId,
        name: restaurantData.name?.trim() || '',
        description: restaurantData.description?.trim() || null,
        address: restaurantData.address?.trim() || null,
        phone: restaurantData.phone?.trim() || null,
        phone_display: restaurantData.phone_display?.trim() || null,
        email: restaurantData.email?.trim() || null,
        website: restaurantData.website?.trim() || null,
        website_url: restaurantData.website_url?.trim() || null,
        image_url: restaurantData.image_url?.trim() || null,
        cuisine_type: restaurantData.cuisine_type?.trim() || null,
        price_range: restaurantData.price_range || '$$',
        rating: restaurantData.rating || 0,
        opening_hours: restaurantData.opening_hours?.trim() || null,
        hours: restaurantData.hours?.trim() || null,
        latitude: restaurantData.latitude || null,
        longitude: restaurantData.longitude || null,
        location: restaurantData.location || null,
        is_active: restaurantData.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_order: restaurantData.display_order || 999,
        order_position: restaurantData.order_position || 0
      };

      const { data, error } = await supabase
        .from('restaurants')
        .insert(restaurantToCreate)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando restaurante:', error);
        throw error;
      }

      console.log('✅ Restaurante creado:', data);
      
      // Crear traducciones automáticamente
      if (data && (restaurantData.name || restaurantData.description)) {
        await createRestaurantTranslations(data);
      }
      
      // Refrescar la lista
      await fetchRestaurants();
      
      return data;
    } catch (err) {
      console.error('❌ Error creating restaurant:', err);
      throw err;
    }
  };

  const updateRestaurant = async (id: string, updates: Partial<AdminRestaurant>) => {
    try {
      console.log('🍽️ Actualizando restaurante:', id, updates);
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('restaurants')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando restaurante:', error);
        throw error;
      }

      console.log('✅ Restaurante actualizado:', data);
      
      // Actualizar traducciones si es necesario
      if (data && (updates.name || updates.description)) {
        await createRestaurantTranslations(data);
      }
      
      // Refrescar la lista
      await fetchRestaurants();
      
      return data;
    } catch (err) {
      console.error('❌ Error updating restaurant:', err);
      throw err;
    }
  };

  const deleteRestaurant = async (id: string) => {
    try {
      console.log('🍽️ Eliminando restaurante:', id);
      
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error eliminando restaurante:', error);
        throw error;
      }

      console.log('✅ Restaurante eliminado');
      
      // Eliminar traducciones relacionadas
      await supabase
        .from('translations')
        .delete()
        .like('key', `restaurant.${id}.%`);
      
      // Refrescar la lista
      setTimeout(() => fetchRestaurants(), 100);
      
    } catch (err) {
      console.error('❌ Error deleting restaurant:', err);
      throw err;
    }
  };

  const toggleRestaurantStatus = async (id: string) => {
    try {
      const restaurant = restaurants.find(r => r.id === id);
      if (!restaurant) throw new Error('Restaurante no encontrado');

      const newStatus = !restaurant.is_active;
      console.log(`🍽️ Cambiando estado del restaurante ${id} a ${newStatus ? 'activo' : 'inactivo'}`);

      const { error } = await supabase
        .from('restaurants')
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
      await fetchRestaurants();
    } catch (err) {
      console.error('❌ Error toggling restaurant status:', err);
      throw err;
    }
  };

  // Función para crear traducciones automáticas
  const createRestaurantTranslations = async (restaurant: AdminRestaurant) => {
    try {
      console.log('🌐 Creando traducciones para restaurante:', restaurant.name);
      
      const translationService = createTranslationService();
      
      // Crear objeto de lugar para traducir
      const placeToTranslate = {
        name: restaurant.name,
        description: restaurant.description || '',
        title: restaurant.name // Usar el nombre como título también
      };

      // Obtener traducciones
      const translations = await translationService.translatePlace(placeToTranslate, 'es');
      
      // Guardar traducciones en la base de datos
      const translationsToSave = [
        // Traducciones de nombre
        { key: `restaurant.${restaurant.id}.name`, language: 'es', value: translations.name.es },
        { key: `restaurant.${restaurant.id}.name`, language: 'en', value: translations.name.en },
        { key: `restaurant.${restaurant.id}.name`, language: 'fr', value: translations.name.fr },
        
        // Traducciones de descripción (solo si existe)
        ...(restaurant.description ? [
          { key: `restaurant.${restaurant.id}.description`, language: 'es', value: translations.description.es },
          { key: `restaurant.${restaurant.id}.description`, language: 'en', value: translations.description.en },
          { key: `restaurant.${restaurant.id}.description`, language: 'fr', value: translations.description.fr }
        ] : []),
        
        // Traducciones de título
        { key: `restaurant.${restaurant.id}.title`, language: 'es', value: translations.title?.es || translations.name.es },
        { key: `restaurant.${restaurant.id}.title`, language: 'en', value: translations.title?.en || translations.name.en },
        { key: `restaurant.${restaurant.id}.title`, language: 'fr', value: translations.title?.fr || translations.name.fr }
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
      console.error('❌ Error creating restaurant translations:', err);
    }
  };

  // Función inteligente para manejar orden dinámico con swap automático
  const updateOrderPosition = useCallback(async (id: string, newPosition: number) => {
    try {
      console.log(`🔄 Swap dinámico en restaurantes: ${id} → posición ${newPosition}`);
      
      // Usar el sistema de orden dinámico con swap automático
      const result = await orderManager.swapPosition(id, newPosition);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Refrescar la lista para mostrar el nuevo orden
      await fetchRestaurants();
      
      console.log(`✅ Swap dinámico completado: ${result.message}`);
      return result;
      
    } catch (err) {
      console.error('❌ Error en swap dinámico de restaurantes:', err);
      throw err;
    }
  }, [orderManager, fetchRestaurants]);

  // Cargar restaurantes al montar el componente
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    loading,
    error,
    createRestaurant,
    updateRestaurant,
    updateOrderPosition,
    deleteRestaurant,
    toggleRestaurantStatus,
    refetch: fetchRestaurants
  };
};



