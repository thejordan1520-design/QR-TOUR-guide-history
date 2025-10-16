import { useState, useEffect, useCallback } from 'react';
import { destinationsService } from '../services/supabaseServices';
import { supabase } from '../lib/supabase';
import { useRealtimeDataSync } from '../services/realtimeDataSync';

export interface Place {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  image?: string;
  audios?: {
    es?: string;
    en?: string;
    fr?: string;
  };
  audio?: string;
  rating?: number;
  is_featured?: boolean;
  is_active?: boolean;
  order_position?: number;
  created_at: string;
  updated_at?: string;
}

export const usePlaces = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar lugares ordenados
  const fetchPlaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Obteniendo lugares ordenados para frontend público...');
      
      // Obtener lugares ordenados por order_position
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('order_position', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching places:', error);
        setError(error.message);
        setPlaces([]);
      } else {
        // Filtrar por is_active después de obtener los datos
        let filteredData = data || [];
        filteredData = filteredData.filter((place: any) => {
          // Si existe is_active, solo incluir activos
          if (place.is_active !== undefined) {
            return place.is_active === true;
          }
          // Si no existe is_active, incluir todos
          return true;
        });
        
        console.log(`✅ ${filteredData.length} lugares obtenidos ordenados (filtered from ${data?.length || 0})`);
        setPlaces(filteredData);
      }
    } catch (err) {
      console.error('❌ Error fetching places:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar lugares');
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sincronización en tiempo real para cambios de datos (orden + ratings + otros campos)
  const { isConnected } = useRealtimeDataSync(['destinations'], (update) => {
    console.log('🔄 Actualización de datos recibida en frontend:', update);
    
    // Si hay cambios en rating, orden o estado activo, refrescar lugares
    if (update.changedFields.includes('rating') || 
        update.changedFields.includes('order_position') || 
        update.changedFields.includes('is_active') ||
        update.changedFields.includes('all')) {
      console.log('⭐ Cambios importantes detectados, refrescando lugares...');
      fetchPlaces();
    }
  });

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  return { 
    places, 
    loading, 
    error, 
    refetch: fetchPlaces,
    isRealtimeConnected: isConnected 
  };
};
