import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtimeDataSync } from '../services/realtimeDataSync';

export interface Supermarket {
  id: string;
  name?: string;
  image_url?: string;
  address?: string;
  location?: string;
  phone?: string;
  schedule?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  order_position?: number;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export const useSupermarkets = () => {
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar supermercados ordenados
  const fetchSupermarkets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🛒 Obteniendo supermercados ordenados para frontend público...');
      
      // Obtener supermercados ordenados por order_position
      const { data, error } = await supabase
        .from('supermarkets')
        .select('*')
        // .eq('is_active', true) // Temporalmente comentado para debug
        .order('order_position', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching supermarkets:', error);
        setError(error.message);
        setSupermarkets([]);
      } else {
        console.log(`✅ ${data?.length || 0} supermercados obtenidos ordenados`);
        setSupermarkets(data || []);
      }
    } catch (err) {
      console.error('❌ Error fetching supermarkets:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar supermercados');
      setSupermarkets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sincronización en tiempo real para cambios de datos (orden + ratings + otros campos)
  const { isConnected } = useRealtimeDataSync(['supermarkets'], (update) => {
    console.log('🔄 Actualización de datos recibida en frontend:', update);
    
    // Si hay cambios en rating, orden o estado activo, refrescar supermercados
    if (update.changedFields.includes('rating') || 
        update.changedFields.includes('order_position') || 
        update.changedFields.includes('is_active') ||
        update.changedFields.includes('all')) {
      console.log('⭐ Cambios importantes detectados, refrescando supermercados...');
      fetchSupermarkets();
    }
  });

  useEffect(() => {
    fetchSupermarkets();
  }, [fetchSupermarkets]);

  return { 
    supermarkets, 
    loading, 
    error, 
    refetch: fetchSupermarkets,
    isRealtimeConnected: isConnected 
  };
};



