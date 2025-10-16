import { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin as supabase } from '../lib/supabase';
import { createTranslationService } from '../services/translationService';
import { DynamicOrderManager, useOrderManager } from '../utils/dynamicOrderManager';

export interface AdminPlace {
  id: string;
  name: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  images: string[] | null;
  rating: number | null;
  reviews_count: number | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  display_order: number | null;
  unique_id: string | null;
  serial_code: string | null;
  slug: string | null;
  audio_en: string | null;
  audio_es: string | null;
  audio_fr: string | null;
  title: string | null;
  image_url: string | null;
  audios: string[] | null;
  order_position: number | null;
}

export const useAdminPlaces = () => {
  const [places, setPlaces] = useState<AdminPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const translationService = createTranslationService();
  
  // Usar el nuevo sistema de orden dinámico
  const orderManager = useOrderManager('destinations');

  // Función para crear traducciones automáticamente
  const createPlaceTranslations = useCallback(async (placeId: string, placeData: { name: string; description: string; title?: string }) => {
    try {
      console.log('🌐 Creando traducciones para lugar:', placeId);
      
      // Traducir el lugar a inglés y francés
      const translationResult = await translationService.translatePlace(placeData, 'es');
      
      // Preparar traducciones para guardar usando la estructura existente (incluyendo español)
      const translationsToSave = [
        {
          key: `place.${placeId}.name`,
          language: 'es',
          value: translationResult.name.es
        },
        {
          key: `place.${placeId}.name`,
          language: 'en',
          value: translationResult.name.en
        },
        {
          key: `place.${placeId}.name`,
          language: 'fr',
          value: translationResult.name.fr
        },
        {
          key: `place.${placeId}.description`,
          language: 'es',
          value: translationResult.description.es
        },
        {
          key: `place.${placeId}.description`,
          language: 'en',
          value: translationResult.description.en
        },
        {
          key: `place.${placeId}.description`,
          language: 'fr',
          value: translationResult.description.fr
        }
      ];

      // Agregar traducción del título si existe (incluyendo español)
      if (placeData.title && translationResult.title) {
        translationsToSave.push(
          {
            key: `place.${placeId}.title`,
            language: 'es',
            value: translationResult.title.es
          },
          {
            key: `place.${placeId}.title`,
            language: 'en',
            value: translationResult.title.en
          },
          {
            key: `place.${placeId}.title`,
            language: 'fr',
            value: translationResult.title.fr
          }
        );
      }

      // Guardar traducciones en la base de datos
      const { error: insertError } = await supabase
        .from('translations')
        .upsert(translationsToSave);

      if (insertError) {
        console.error('❌ Error guardando traducciones:', insertError);
      } else {
        console.log('✅ Traducciones guardadas exitosamente');
      }
    } catch (err) {
      console.error('❌ Error creando traducciones:', err);
      // No lanzar error para no interrumpir la creación del lugar
    }
  }, [translationService]);

  // Fetch places con orden dinámico
  const fetchPlaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Obteniendo lugares con orden dinámico...');
      
      // Usar el sistema de orden dinámico
      const orderedPlaces = await orderManager.getOrderedItems<AdminPlace>();
      
      console.log(`✅ ${orderedPlaces.length} lugares obtenidos con orden dinámico`);
      setPlaces(orderedPlaces);
      
    } catch (err) {
      console.error('Error fetching places:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar lugares');
    } finally {
      setLoading(false);
    }
  }, [orderManager]);

  // Create place con orden dinámico automático
  const createPlace = useCallback(async (placeData: Partial<AdminPlace>) => {
    try {
      setError(null);
      
      // Generar ID único basado en el nombre
      const id = placeData.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `lugar-${Date.now()}`;
      
      // Obtener la siguiente posición automáticamente
      const nextPosition = await orderManager.getNextPosition();
      
      // Preparar datos con tipos correctos
      const insertData = {
        id: id,
        name: placeData.name,
        description: placeData.description || null,
        latitude: placeData.latitude || null,
        longitude: placeData.longitude || null,
        category: placeData.category || 'religioso',
        images: placeData.images || null,
        rating: placeData.rating || 0,
        reviews_count: placeData.reviews_count || 0,
        is_featured: placeData.is_featured || false,
        is_active: placeData.is_active !== false,
        display_order: placeData.display_order || 0,
        unique_id: placeData.unique_id || null,
        serial_code: placeData.serial_code ? parseInt(placeData.serial_code.toString()) : null,
        slug: placeData.slug || id,
        audio_en: placeData.audio_en || null,
        audio_es: placeData.audio_es || null,
        audio_fr: placeData.audio_fr || null,
        title: placeData.title || null,
        image_url: placeData.image_url || null,
        audios: placeData.audios || null,
        order_position: nextPosition // Usar posición automática
      };
      
      console.log(`🔍 Creando lugar con posición automática: ${nextPosition}`);
      
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('destinations')
        .insert([{
          ...insertData,
          created_at: now,
          updated_at: now
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw error;
      }
      
      console.log('✅ Lugar creado exitosamente con orden dinámico:', data);
      
      // Actualizar estado local sin refetch para evitar loops
      setPlaces(prev => [...prev, data].sort((a, b) => (a.order_position || 0) - (b.order_position || 0)));
      
      // Crear traducciones automáticamente en segundo plano
      if (data.name && data.description) {
        createPlaceTranslations(data.id, {
          name: data.name,
          description: data.description,
          title: data.title || undefined
        }).catch(err => {
          console.error('Error creating translations in background:', err);
        });
      }
      
      return data;
    } catch (err) {
      console.error('❌ Error creating place:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al crear lugar';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [orderManager, createPlaceTranslations]);

  // Función básica de actualización (sin orden)
  const updatePlaceBasic = useCallback(async (id: string, placeData: Partial<AdminPlace>) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('destinations')
        .update({
          ...placeData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setPlaces(prev => prev.map(place => place.id === id ? data : place));
      return data;
    } catch (err) {
      console.error('Error updating place:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar lugar';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Función inteligente para manejar conflictos de orden automáticamente
  const handleOrderConflict = useCallback(async (newOrder: number, currentPlaceId: string) => {
    try {
      // Obtener todos los lugares ordenados por order_position
      const allPlacesSorted = [...places].sort((a, b) => (a.order_position || 0) - (b.order_position || 0));
      
      // Verificar si hay conflicto
      const conflictingPlace = allPlacesSorted.find(p => 
        p.order_position === newOrder && p.id !== currentPlaceId
      );
      
      if (!conflictingPlace) {
        // No hay conflicto, actualizar directamente
        return await updatePlaceBasic(currentPlaceId, { order_position: newOrder });
      }
      
      console.log(`🔄 Conflicto detectado: posición ${newOrder} ocupada por "${conflictingPlace.name}"`);
      
      // Determinar nueva posición para el elemento en conflicto
      let nextPosition = newOrder + 1;
      
      
      // Encontrar la siguiente posición disponible
      while (allPlacesSorted.some(p => p.order_position === nextPosition && p.id !== conflictingPlace.id)) {
        nextPosition++;
      }
      
      // Actualizar ambos elementos: el que cambiamos y el que se mueve automáticamente
      const updates = [
        updatePlaceBasic(currentPlaceId, { order_position: newOrder }),
        updatePlaceBasic(conflictingPlace.id, { order_position: nextPosition })
      ];
      
      await Promise.all(updates);
      
      console.log(`✅ Reordenamiento automático: "${conflictingPlace.name}" movido a posición ${nextPosition}`);
      
      return { success: true, moved: conflictingPlace.name, newPosition: nextPosition };
    } catch (err) {
      console.error('❌ Error manejando conflicto de orden:', err);
      throw err;
    }
  }, [places, updatePlaceBasic]);

  // Update place con manejo inteligente de conflictos de orden
  const updatePlace = useCallback(async (id: string, placeData: Partial<AdminPlace>) => {
    try {
      setError(null);
      
      // Si estamos actualizando el order_position, usar el manejo inteligente
      if (placeData.order_position !== undefined) {
        return await handleOrderConflict(placeData.order_position, id);
      }
      
      // Para otros campos, actualización normal
      return await updatePlaceBasic(id, placeData);
    } catch (err) {
      console.error('Error updating place:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar lugar';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [updatePlaceBasic, handleOrderConflict]);

  // Delete place
  const deletePlace = useCallback(async (id: string) => {
    try {
      setError(null);
      
      console.log(`🗑️ Eliminando lugar con ID: ${id}`);
      
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error de Supabase al eliminar:', error);
        throw error;
      }
      
      console.log(`✅ Lugar ${id} eliminado de Supabase`);
      
      // Actualizar el estado local
      setPlaces(prev => {
        const filtered = prev.filter(place => place.id !== id);
        console.log(`📊 Lugares restantes en estado local: ${filtered.length}`);
        return filtered;
      });
      
      // Forzar recarga de datos para asegurar sincronización
      setTimeout(() => {
        console.log('🔄 Forzando recarga de datos...');
        fetchPlaces();
      }, 500);
      
    } catch (err) {
      console.error('Error deleting place:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar lugar';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchPlaces]);

  // Toggle place status
  const togglePlaceStatus = useCallback(async (id: string) => {
    try {
      const place = places.find(p => p.id === id);
      if (!place) throw new Error('Lugar no encontrado');

      await updatePlace(id, { is_active: !place.is_active });
    } catch (err) {
      console.error('Error toggling place status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar estado del lugar';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [places, updatePlace]);

  // Update place category
  const updatePlaceCategory = useCallback(async (id: string, category: string) => {
    try {
      await updatePlace(id, { category });
    } catch (err) {
      console.error('Error updating place category:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar categoría';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [updatePlace]);

  // Update place rating
  const updatePlaceRating = useCallback(async (id: string, rating: number) => {
    try {
      await updatePlace(id, { rating });
    } catch (err) {
      console.error('Error updating place rating:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar calificación';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [updatePlace]);

  // Load data on mount
  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Función inteligente para manejar orden dinámico con swap automático
  const updateOrderPosition = useCallback(async (id: string, newPosition: number) => {
    try {
      console.log(`🔄 Swap dinámico en lugares: ${id} → posición ${newPosition}`);
      
      // Usar el sistema de orden dinámico con swap automático
      const result = await orderManager.swapPosition(id, newPosition);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Actualizar estado local sin refetch completo para evitar loops
      const updatedPlaces = await orderManager.getOrderedItems<AdminPlace>();
      setPlaces(updatedPlaces);
      
      console.log(`✅ Swap dinámico completado: ${result.message}`);
      return result;
      
    } catch (err) {
      console.error('❌ Error en swap dinámico de lugares:', err);
      throw err;
    }
  }, [orderManager]);

  return {
    places,
    loading,
    error,
    refetch: fetchPlaces,
    createPlace,
    updatePlace,
    updateOrderPosition,
    deletePlace,
    togglePlaceStatus,
    updatePlaceCategory,
    updatePlaceRating
  };
};
