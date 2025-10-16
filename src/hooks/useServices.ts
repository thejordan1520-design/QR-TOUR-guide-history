import { useState, useEffect, useCallback } from 'react';
import { supabasePublic } from '../lib/supabase';
import { useRealtimeOrderSync } from '../services/realtimeOrderSync';
// import { useRealtimeSync } from './useRealtimeSync'; // TODO: Implementar realtime sync

interface ServiceProvider {
  id: string;
  name: string;
  phone?: string;
  description?: string;
  image_url?: string;
  company?: string;
  vehicle_plate?: string;
  vehicle_type?: string;
  languages?: string[];
  hourly_rate?: number;
  location?: string;
  more_info_url?: string;
  route?: string;
  specialties?: string[];
  is_active?: boolean;
  order_position?: number;
  created_at?: string;
  updated_at?: string;
}

type ServiceType = 'guides' | 'taxis' | 'buses' | 'events';

export const useServices = (serviceType: ServiceType) => {
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTableName = (type: ServiceType): string => {
    switch (type) {
      case 'guides':
        return 'tourist_guides';
      case 'taxis':
        return 'taxi_drivers';
      case 'buses':
        return 'buss';
      case 'events':
        return 'events';
      default:
        return 'tourist_guides';
    }
  };

  const tableName = getTableName(serviceType);

  // Sincronización en tiempo real para cambios de orden (evitar duplicidad de canales)
  const { isConnected } = useRealtimeOrderSync([tableName], () => {
    loadServices();
  });

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tableName = getTableName(serviceType);
      
      // Consulta específica según el tipo de servicio
      let query = supabasePublic.from(tableName).select('*');
      
      // Filtrar por is_active solo si la tabla tiene esa columna Y el registro tiene el campo
      if (['tourist_guides', 'taxi_drivers', 'buss'].includes(tableName)) {
        // No aplicar filtro is_active aquí, lo haremos después
      }
      
      // Ordenar por order_position si existe, sino por created_at
      if (['tourist_guides', 'taxi_drivers', 'buss'].includes(tableName)) {
        query = query.order('order_position', { ascending: true, nullsFirst: false });
      }
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;

      if (error) {
        console.error(`Error loading ${serviceType}:`, error);
        setError(error.message);
        return;
      }

      // Filtrar por is_active después de obtener los datos
      let filteredData = data || [];
      if (['tourist_guides', 'taxi_drivers', 'buss'].includes(tableName)) {
        filteredData = filteredData.filter((item: any) => {
          // Si existe is_active, solo incluir activos
          if (item.is_active !== undefined) {
            return item.is_active === true;
          }
          // Si no existe is_active, incluir todos
          return true;
        });
      }

      setServices(filteredData);
      console.log(`✅ Loaded ${filteredData.length} ${serviceType} from database (filtered from ${data?.length || 0})`);
    } catch (err) {
      console.error(`Error loading ${serviceType}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [serviceType]);

  // Cargar servicios inicialmente
  useEffect(() => {
    loadServices();
  }, [serviceType]);

  // El canal de realtime ya es gestionado por useRealtimeOrderSync

  return {
    services,
    loading,
    error,
    refetch: loadServices,
    isRealtimeConnected: isConnected
  };
};
