import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtimeDataSync } from '../services/realtimeDataSync';

export interface Restaurant {
  id: string;
  name?: string;
  image_url?: string;
  cuisine_type?: string;
  address?: string;
  location?: string;
  phone?: string;
  rating?: number;
  description?: string;
  opening_hours?: string;
  price_range?: string;
  latitude?: number;
  longitude?: number;
  order_position?: number;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar restaurantes ordenados
  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🍽️ Obteniendo restaurantes ordenados para frontend público...');
      
      // Obtener restaurantes ordenados por order_position
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('order_position', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching restaurants:', error);
        setError(error.message);
        setRestaurants([]);
      } else {
        console.log(`✅ ${data?.length || 0} restaurantes obtenidos ordenados`);
        console.log('🍽️ [DEBUG] Primeros 3 restaurantes:', data?.slice(0, 3));
        setRestaurants(data || []);
      }
    } catch (err) {
      console.error('❌ Error fetching restaurants:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sincronización en tiempo real para cambios de datos (orden + ratings + otros campos)
  const { isConnected } = useRealtimeDataSync(['restaurants'], (update) => {
    console.log('🔄 Actualización de datos recibida en frontend:', update);
    
    // Si hay cambios en rating, orden o estado activo, refrescar restaurantes
    if (update.changedFields.includes('rating') || 
        update.changedFields.includes('order_position') || 
        update.changedFields.includes('is_active') ||
        update.changedFields.includes('all')) {
      console.log('⭐ Cambios importantes detectados, refrescando restaurantes...');
      fetchRestaurants();
    }
  });

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  console.log('🍽️ [DEBUG] useRestaurants devolviendo:', { 
    restaurantsCount: restaurants.length, 
    loading, 
    error,
    firstRestaurant: restaurants[0]?.name 
  });

  return { 
    restaurants, 
    loading, 
    error, 
    refetch: fetchRestaurants,
    isRealtimeConnected: isConnected 
  };
};



